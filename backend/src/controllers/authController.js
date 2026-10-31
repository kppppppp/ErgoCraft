import crypto from 'crypto';
import { User } from '../models/User.js';
import { Setting } from '../models/Setting.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken, sendTokenCookie, clearTokenCookie } from '../utils/token.js';
import { emailService } from '../services/emailService.js';
import { config } from '../config/env.js';
import { checkDeliveryServiceability, DEFAULT_RESTRICTED_STATES } from '../utils/deliveryService.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists');
  }

  // Public registration is strictly customer role
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    role: 'customer',
  });

  const token = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 });
  sendTokenCookie(res, token);

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    addresses: user.addresses,
  };

  res.status(201).json(new ApiResponse(201, { user: safeUser, token }, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 });
  sendTokenCookie(res, token);

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    addresses: user.addresses,
  };

  res.status(200).json(new ApiResponse(200, { user: safeUser, token }, 'Login successful'));
});

export const mergeCart = asyncHandler(async (req, res) => {
  const incoming = Array.isArray(req.body.items) ? req.body.items : [];
  const merged = new Map();
  for (const item of [...(req.user.cart || []), ...incoming]) {
    if (!item?.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) continue;
    const productId = String(item.productId);
    const maxStock = Math.max(1, Number(item.maxStock) || 99);
    const previous = merged.get(productId);
    const quantity = Math.min(maxStock, (previous?.quantity || 0) + Number(item.quantity));
    merged.set(productId, {
      productId, name: String(item.name || previous?.name || 'Product'), sku: String(item.sku || previous?.sku || ''),
      slug: String(item.slug || previous?.slug || ''), sellingPrice: Number(item.sellingPrice ?? previous?.sellingPrice ?? 0),
      mrp: Number(item.mrp ?? previous?.mrp ?? 0), image: String(item.image || previous?.image || ''), quantity, maxStock,
    });
  }
  req.user.cart = [...merged.values()];
  await req.user.save();
  res.status(200).json(new ApiResponse(200, { items: req.user.cart }, 'Cart merged successfully'));
});

export const saveCart = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.items)) throw new ApiError(400, 'Cart items must be an array');
  req.user.cart = req.body.items;
  await req.user.save();
  res.status(200).json(new ApiResponse(200, { items: req.user.cart }, 'Cart saved successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save();
  }
  clearTokenCookie(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    addresses: user.addresses,
  };

  res.status(200).json(new ApiResponse(200, { user: safeUser }, 'Current user retrieved'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide an email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Security rule: Never reveal whether an email exists or not
  if (!user || !user.isActive) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'If an account with that email exists, a password reset link has been dispatched.'
        )
      );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Resolve frontend base URL: prioritize incoming request origin (e.g. https://ergo-craft.vercel.app),
  // falling back to FRONTEND_URL or production default.
  const originHeader = (req.get('origin') || req.get('referer') || '').trim();
  let candidateOrigin = '';
  if (originHeader) {
    try {
      const parsed = new URL(originHeader);
      candidateOrigin = parsed.origin;
    } catch {
      // ignore parse errors
    }
  }

  const configuredFrontend = (config.frontendUrl || process.env.FRONTEND_URL || '').split(',')[0].trim().replace(/\/+$/, '');
  let frontendBase = candidateOrigin || configuredFrontend;

  // In production or if frontendBase points to localhost, ensure we fall back to the live storefront
  if (!frontendBase || ((config.env === 'production' || process.env.NODE_ENV === 'production') && (frontendBase.includes('localhost') || frontendBase.includes('127.0.0.1')))) {
    frontendBase = 'https://ergo-craft.vercel.app';
  }
  frontendBase = frontendBase.replace(/\/+$/, '');

  const resetUrl = `${frontendBase}/reset-password?token=${resetToken}`;

  try {
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetUrl);
    if (!emailResult.success) throw new Error('Brevo could not send the password reset email');
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'If an account with that email exists, a password reset link has been dispatched.'
        )
      );
  } catch (err) {
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'There was an error sending the password reset email. Please try again.');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, 'Please provide the reset token and new password');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetTokenHash: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  user.password = password;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send confirmation email
  emailService.sendPasswordResetConfirmationEmail(user.email).catch((err) => {
    console.error('[Auth] Failed to send password reset confirmation email:', err);
  });

  const sessionToken = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 });
  sendTokenCookie(res, sessionToken);

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful. You are now logged in.'));
});

export const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    houseNumber,
    street,
    landmark,
    city,
    state,
    postalCode,
    country = 'India',
    isDefault = false,
  } = req.body;

  if (!street || !city || !state || !postalCode) {
    throw new ApiError(400, 'Please provide street, city, state, and 6-digit postal code');
  }

  const setting = await Setting.findOne({ key: 'store_settings' });
  const restrictionsEnabled = setting?.deliveryRestrictions?.enabled ?? true;
  const restrictedStates = setting?.deliveryRestrictions?.restrictedStates ?? DEFAULT_RESTRICTED_STATES;

  const serviceCheck = checkDeliveryServiceability(state, postalCode, {
    restrictedStates,
    restrictionsEnabled,
  });

  if (serviceCheck.error === 'PIN_MISMATCH' || serviceCheck.error === 'INVALID_STATE') {
    throw new ApiError(400, serviceCheck.message);
  }

  const newAddress = {
    fullName: fullName?.trim() || req.user.name,
    phone: phone?.trim() || req.user.phone || '',
    houseNumber: houseNumber?.trim() || '',
    street: street.trim(),
    landmark: landmark?.trim() || '',
    city: city.trim(),
    state: serviceCheck.state,
    postalCode: serviceCheck.postalCode,
    country: country.trim() || 'India',
    isDefault: Boolean(isDefault || req.user.addresses.length === 0),
  };

  if (newAddress.isDefault) {
    req.user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  req.user.addresses.push(newAddress);
  await req.user.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        address: req.user.addresses[req.user.addresses.length - 1],
        addresses: req.user.addresses,
        serviceable: serviceCheck.serviceable,
        serviceCheck,
      },
      serviceCheck.serviceable
        ? 'Address added successfully'
        : 'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    )
  );
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phone,
    houseNumber,
    street,
    landmark,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const address = req.user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const nextState = state || address.state;
  const nextPin = postalCode || address.postalCode;

  const setting = await Setting.findOne({ key: 'store_settings' });
  const restrictionsEnabled = setting?.deliveryRestrictions?.enabled ?? true;
  const restrictedStates = setting?.deliveryRestrictions?.restrictedStates ?? DEFAULT_RESTRICTED_STATES;

  const serviceCheck = checkDeliveryServiceability(nextState, nextPin, {
    restrictedStates,
    restrictionsEnabled,
  });

  if (serviceCheck.error === 'PIN_MISMATCH' || serviceCheck.error === 'INVALID_STATE') {
    throw new ApiError(400, serviceCheck.message);
  }

  if (fullName !== undefined) address.fullName = fullName.trim();
  if (phone !== undefined) address.phone = phone.trim();
  if (houseNumber !== undefined) address.houseNumber = houseNumber.trim();
  if (street !== undefined) address.street = street.trim();
  if (landmark !== undefined) address.landmark = landmark.trim();
  if (city !== undefined) address.city = city.trim();
  address.state = serviceCheck.state;
  address.postalCode = serviceCheck.postalCode;
  if (country !== undefined) address.country = country.trim();

  if (isDefault) {
    req.user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });
  }

  await req.user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        address,
        addresses: req.user.addresses,
        serviceable: serviceCheck.serviceable,
        serviceCheck,
      },
      serviceCheck.serviceable
        ? 'Address updated successfully'
        : 'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    )
  );
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = req.user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  req.user.addresses.pull({ _id: addressId });
  if (address.isDefault && req.user.addresses.length > 0) {
    req.user.addresses[0].isDefault = true;
  }

  await req.user.save();

  res.status(200).json(
    new ApiResponse(200, { addresses: req.user.addresses }, 'Address deleted successfully')
  );
});
