// Centralized delivery serviceability utility for ErgoCraft

export const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const DEFAULT_RESTRICTED_STATES = [
  'Jammu & Kashmir',
  'Himachal Pradesh',
  'Uttarakhand',
  'Uttar Pradesh',
  'Bihar',
  'Jharkhand',
  'West Bengal',
  'Odisha',
  'Sikkim',
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Tripura',
];

// Mapping of common abbreviations and alternate names to standard state names
const STATE_ALIAS_MAP = {
  // Restricted states
  'jammu and kashmir': 'Jammu & Kashmir',
  'jammu & kashmir': 'Jammu & Kashmir',
  'j&k': 'Jammu & Kashmir',
  'jk': 'Jammu & Kashmir',
  'himachal pradesh': 'Himachal Pradesh',
  'hp': 'Himachal Pradesh',
  'uttarakhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'uk': 'Uttarakhand',
  'ua': 'Uttarakhand',
  'uttar pradesh': 'Uttar Pradesh',
  'up': 'Uttar Pradesh',
  'bihar': 'Bihar',
  'br': 'Bihar',
  'jharkhand': 'Jharkhand',
  'jh': 'Jharkhand',
  'west bengal': 'West Bengal',
  'wb': 'West Bengal',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'or': 'Odisha',
  'od': 'Odisha',
  'sikkim': 'Sikkim',
  'sk': 'Sikkim',
  'arunachal pradesh': 'Arunachal Pradesh',
  'ar': 'Arunachal Pradesh',
  'assam': 'Assam',
  'as': 'Assam',
  'manipur': 'Manipur',
  'mn': 'Manipur',
  'meghalaya': 'Meghalaya',
  'ml': 'Meghalaya',
  'mizoram': 'Mizoram',
  'mz': 'Mizoram',
  'nagaland': 'Nagaland',
  'nl': 'Nagaland',
  'tripura': 'Tripura',
  'tr': 'Tripura',

  // Other states & UTs
  'maharashtra': 'Maharashtra',
  'mh': 'Maharashtra',
  'karnataka': 'Karnataka',
  'ka': 'Karnataka',
  'kar': 'Karnataka',
  'delhi': 'Delhi',
  'dl': 'Delhi',
  'new delhi': 'Delhi',
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'gujarat': 'Gujarat',
  'gj': 'Gujarat',
  'rajasthan': 'Rajasthan',
  'rj': 'Rajasthan',
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'tn': 'Tamil Nadu',
  'kerala': 'Kerala',
  'kl': 'Kerala',
  'telangana': 'Telangana',
  'ts': 'Telangana',
  'tg': 'Telangana',
  'andhra pradesh': 'Andhra Pradesh',
  'ap': 'Andhra Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  'mp': 'Madhya Pradesh',
  'chhattisgarh': 'Chhattisgarh',
  'chhatisgarh': 'Chhattisgarh',
  'cg': 'Chhattisgarh',
  'ct': 'Chhattisgarh',
  'goa': 'Goa',
  'ga': 'Goa',
  'punjab': 'Punjab',
  'pb': 'Punjab',
  'haryana': 'Haryana',
  'hr': 'Haryana',
  'chandigarh': 'Chandigarh',
  'ch': 'Chandigarh',
  'ladakh': 'Ladakh',
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
  'py': 'Puducherry',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'an': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'dn': 'Dadra and Nagar Haveli and Daman and Diu',
  'dd': 'Dadra and Nagar Haveli and Daman and Diu',
  'lakshadweep': 'Lakshadweep',
  'ld': 'Lakshadweep',
};

/**
 * Normalizes state name or common abbreviation to standard state title.
 * Returns normalized state name or null if unknown.
 */
export const normalizeState = (inputState) => {
  if (!inputState || typeof inputState !== 'string') return null;
  const noDots = inputState.trim().toLowerCase().replace(/\./g, '').replace(/[\s\-_]+/g, ' ').trim();
  if (STATE_ALIAS_MAP[noDots]) {
    return STATE_ALIAS_MAP[noDots];
  }

  const clean = inputState.trim().toLowerCase().replace(/[\s\-_.]+/g, ' ').trim();
  if (STATE_ALIAS_MAP[clean]) {
    return STATE_ALIAS_MAP[clean];
  }

  // Check direct case-insensitive match against ALL_INDIAN_STATES
  const directMatch = ALL_INDIAN_STATES.find(
    (s) => s.toLowerCase() === clean || s.toLowerCase().replace(/&/g, 'and') === clean.replace(/&/g, 'and')
  );
  if (directMatch) return directMatch;

  return null;
};

/**
 * Validates PIN code format (6 numeric digits, starting 1-9).
 */
export const validatePinCode = (pin) => {
  if (!pin) return false;
  const str = String(pin).trim();
  return /^[1-9][0-9]{5}$/.test(str);
};

/**
 * PIN prefix range checking for Indian states.
 * India Postal PIN system:
 * 11: Delhi
 * 12, 13: Haryana
 * 14, 15: Punjab
 * 16: Chandigarh
 * 17: Himachal Pradesh
 * 18, 19: Jammu & Kashmir, Ladakh
 * 20-28: Uttar Pradesh & Uttarakhand (Uttarakhand has 244xxx/246-249xxx, 262-263xxx)
 * 30-34: Rajasthan
 * 36-39: Gujarat, Dadra & Nagar Haveli, Daman & Diu
 * 40-44: Maharashtra, Goa (403)
 * 45-48: Madhya Pradesh
 * 49: Chhattisgarh
 * 50-53: Andhra Pradesh, Telangana
 * 56-59: Karnataka
 * 60-64: Tamil Nadu, Puducherry (605, 607, 609)
 * 67-69: Kerala, Lakshadweep (682)
 * 70-74: West Bengal (737 is Sikkim, 744 is Andaman & Nicobar)
 * 75-77: Odisha
 * 78: Assam
 * 79: Northeast states (790-792: Arunachal, 793-794: Meghalaya, 795: Manipur, 796: Mizoram, 797: Nagaland, 799: Tripura)
 * 80-85: Bihar & Jharkhand (814-816, 825-835: Jharkhand; 800-813, 841-855: Bihar)
 */
export const getStatesForPinCode = (pin) => {
  if (!validatePinCode(pin)) return [];
  const p = String(pin).trim();
  const prefix2 = parseInt(p.substring(0, 2), 10);
  const prefix3 = parseInt(p.substring(0, 3), 10);

  // Specific 3-digit checks first
  if (prefix3 === 403) return ['Goa'];
  if (prefix3 === 737) return ['Sikkim'];
  if (prefix3 === 744) return ['Andaman and Nicobar Islands'];
  if (prefix3 === 682 && (p.startsWith('68255') || p.startsWith('682555'))) return ['Lakshadweep', 'Kerala'];
  if ([605, 607, 609].includes(prefix3)) return ['Puducherry', 'Tamil Nadu'];
  if ([396].includes(prefix3)) return ['Dadra and Nagar Haveli and Daman and Diu', 'Gujarat'];

  // Northeast (prefix 79)
  if (prefix2 === 79) {
    if (prefix3 >= 790 && prefix3 <= 792) return ['Arunachal Pradesh'];
    if (prefix3 >= 793 && prefix3 <= 794) return ['Meghalaya'];
    if (prefix3 === 795) return ['Manipur'];
    if (prefix3 === 796) return ['Mizoram'];
    if (prefix3 === 797) return ['Nagaland'];
    if (prefix3 === 799) return ['Tripura'];
    return ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura'];
  }

  // Uttarakhand vs UP in 24 & 26 prefixes
  if (prefix2 === 24 || prefix2 === 26) {
    if (
      (prefix3 >= 246 && prefix3 <= 249) ||
      prefix3 === 262 ||
      prefix3 === 263
    ) {
      return ['Uttarakhand', 'Uttar Pradesh'];
    }
    return ['Uttar Pradesh', 'Uttarakhand'];
  }

  // Bihar vs Jharkhand in 80-85
  if (prefix2 >= 80 && prefix2 <= 85) {
    if (
      (prefix3 >= 814 && prefix3 <= 816) ||
      (prefix3 >= 825 && prefix3 <= 835)
    ) {
      return ['Jharkhand', 'Bihar'];
    }
    return ['Bihar', 'Jharkhand'];
  }

  // 2-digit ranges
  if (prefix2 === 11) return ['Delhi'];
  if (prefix2 === 12 || prefix2 === 13) return ['Haryana'];
  if (prefix2 === 14 || prefix2 === 15) return ['Punjab'];
  if (prefix2 === 16) return ['Chandigarh', 'Punjab', 'Haryana'];
  if (prefix2 === 17) return ['Himachal Pradesh'];
  if (prefix2 === 18 || prefix2 === 19) return ['Jammu & Kashmir', 'Ladakh'];
  if (prefix2 >= 20 && prefix2 <= 28) return ['Uttar Pradesh', 'Uttarakhand'];
  if (prefix2 >= 30 && prefix2 <= 34) return ['Rajasthan'];
  if (prefix2 >= 36 && prefix2 <= 39) return ['Gujarat', 'Dadra and Nagar Haveli and Daman and Diu'];
  if (prefix2 >= 40 && prefix2 <= 44) return ['Maharashtra', 'Goa'];
  if (prefix2 >= 45 && prefix2 <= 48) return ['Madhya Pradesh'];
  if (prefix2 === 49) return ['Chhattisgarh'];
  if (prefix2 >= 50 && prefix2 <= 53) return ['Telangana', 'Andhra Pradesh'];
  if (prefix2 >= 56 && prefix2 <= 59) return ['Karnataka'];
  if (prefix2 >= 60 && prefix2 <= 64) return ['Tamil Nadu', 'Puducherry'];
  if (prefix2 >= 67 && prefix2 <= 69) return ['Kerala', 'Lakshadweep'];
  if (prefix2 >= 70 && prefix2 <= 74) return ['West Bengal', 'Sikkim', 'Andaman and Nicobar Islands'];
  if (prefix2 >= 75 && prefix2 <= 77) return ['Odisha'];
  if (prefix2 === 78) return ['Assam'];

  return [];
};

/**
 * Verifies if the given PIN code and state are consistent.
 */
export const verifyPinAndState = (pin, state) => {
  if (!validatePinCode(pin)) {
    return {
      valid: false,
      message: 'PIN code must be a valid 6-digit Indian postal code.',
    };
  }

  const normalizedState = normalizeState(state);
  if (!normalizedState) {
    return {
      valid: false,
      message: `Invalid or unrecognized Indian state: "${state}".`,
    };
  }

  const allowedStates = getStatesForPinCode(pin);
  if (!allowedStates.length) {
    return {
      valid: false,
      message: `PIN code ${pin} is not recognized in the Indian postal network.`,
    };
  }

  const matches = allowedStates.some(
    (s) => s.toLowerCase() === normalizedState.toLowerCase()
  );

  if (!matches) {
    return {
      valid: false,
      message: `PIN code ${pin} does not belong to ${normalizedState} (belongs to ${allowedStates.join(' / ')}).`,
      expectedStates: allowedStates,
    };
  }

  return {
    valid: true,
    normalizedState,
    pin: String(pin).trim(),
  };
};

/**
 * Checks serviceability for a given state & PIN code.
 *
 * @param {string} state - The Indian state
 * @param {string} pin - 6-digit postal code
 * @param {object} [options]
 * @param {string[]} [options.restrictedStates] - Custom restricted states list
 * @param {boolean} [options.restrictionsEnabled] - Whether restrictions are active
 */
export const checkDeliveryServiceability = (state, pin, options = {}) => {
  const normalizedState = normalizeState(state);
  if (!normalizedState) {
    return {
      serviceable: false,
      error: 'INVALID_STATE',
      message: `Invalid or unrecognized Indian state: "${state}".`,
      state: state || '',
      postalCode: pin || '',
    };
  }

  const pinCheck = verifyPinAndState(pin, normalizedState);
  if (!pinCheck.valid) {
    return {
      serviceable: false,
      error: 'PIN_MISMATCH',
      message: pinCheck.message,
      state: normalizedState,
      postalCode: pin || '',
    };
  }

  const restrictionsEnabled = options.restrictionsEnabled !== false;
  const restrictedList = (options.restrictedStates || DEFAULT_RESTRICTED_STATES).map((s) =>
    normalizeState(s) || s
  );

  if (restrictionsEnabled && restrictedList.includes(normalizedState)) {
    return {
      serviceable: false,
      error: 'RESTRICTED_LOCATION',
      message: 'Sorry! ErgoCraft currently does not offer delivery services to your location.',
      state: normalizedState,
      postalCode: pinCheck.pin,
      isRestrictedState: true,
    };
  }

  return {
    serviceable: true,
    state: normalizedState,
    postalCode: pinCheck.pin,
    message: 'Delivery is available to your location.',
  };
};
