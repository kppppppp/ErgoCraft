'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { useCart } from '../../../lib/cart';
import { ProductCard } from '../../../components/ProductCard';
import { CorporateQuoteModal } from '../../../components/CorporateQuoteModal';
import { FALLBACK_PRODUCTS } from '../../../lib/fallbackProducts';
import type { Product } from '../../../lib/types';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  Star,
  ChevronRight,
  Package,
  Building2,
  Share2,
  CheckCircle2,
  MessageCircle,
  MapPin,
} from 'lucide-react';

function ProductDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetchApi<{ product: Product; relatedProducts: Product[] }>(
          `/products/${slug}`
        );
        if (!isMounted) return;

        if (res.data?.product) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.relatedProducts || []);
        } else {
          setProduct(null);
          setRelatedProducts([]);
        }
      } catch {
        if (!isMounted) return;
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F7F5F0] border border-[#E8E5DE] text-[#78836A] flex items-center justify-center mx-auto mb-4">
          <Package size={36} />
        </div>
        <h2 className="text-2xl font-serif-luxury font-bold text-[#13231D] mb-2">
          Seating Design Not Found
        </h2>
        <p className="text-sm text-[#73756F] max-w-md mx-auto mb-6">
          The requested furniture item may have been moved or is currently not available in our
          published catalogue.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 rounded-xl bg-[#13231D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78836A] transition"
        >
          Explore All Seating
        </Link>
      </div>
    );
  }

  const primaryImg = product.images?.[activeImageIndex] || product.images?.[0];

  const getCatInfo = (cat: any) => {
    if (!cat) return null;
    if (typeof cat === 'object') {
      return { name: cat.name || '', slug: cat.slug || '' };
    }
    return { name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') };
  };

  const catInfo = getCatInfo(product.category) || { name: 'Office Seating', slug: 'office-chairs' };
  const subcatInfo = getCatInfo(product.subcategory);
  const classInfo = getCatInfo(product.classification);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasDiscount = product.discountPercentage > 0 && product.mrp > product.sellingPrice;

  const whatsappOrderUrl = `https://wa.me/919768001999?text=${encodeURIComponent(
    `Hi ErgoCraft Seating, I would like to order / inquire about "${product.name}" (SKU: ${product.sku}, Price: ₹${product.sellingPrice.toLocaleString('en-IN')}). Please provide delivery and custom finish options.`
  )}`;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 space-y-16 animate-fade-up">
      {/* 1. Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-[#73756F]">
        <Link href="/" className="hover:text-[#78836A] transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-gray-400 shrink-0" />
        <Link href="/products" className="hover:text-[#78836A] transition-colors">
          Catalogue
        </Link>
        <ChevronRight size={12} className="text-gray-400 shrink-0" />
        <Link href={`/products?category=${catInfo.slug}`} className="hover:text-[#78836A] transition-colors">
          {catInfo.name}
        </Link>
        {subcatInfo && (
          <>
            <ChevronRight size={12} className="text-gray-400 shrink-0" />
            <Link
              href={`/products?category=${catInfo.slug}&subcategory=${subcatInfo.slug}`}
              className="hover:text-[#78836A] transition-colors"
            >
              {subcatInfo.name}
            </Link>
          </>
        )}
        {classInfo && (
          <>
            <ChevronRight size={12} className="text-gray-400 shrink-0" />
            <Link
              href={`/products?category=${catInfo.slug}&subcategory=${subcatInfo?.slug || ''}&classification=${classInfo.slug}`}
              className="hover:text-[#78836A] transition-colors"
            >
              {classInfo.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} className="text-gray-400 shrink-0" />
        <span className="text-[#13231D] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Product Hero Grid: Gallery & Purchase Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Image Gallery (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image Container */}
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-[#E8E5DE] bg-[#F6F5F0] shadow-xs flex items-center justify-center group">
            {primaryImg?.url ? (
              <img
                src={primaryImg.url}
                alt={primaryImg.altText || product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero-chair.jpg';
                }}
                className="w-full h-full object-contain p-6 sm:p-10 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Package size={64} className="text-gray-300" />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.isBestseller && (
                <span className="px-3.5 py-1.5 rounded-full bg-[#13231D] text-[#CBD5C0] text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Star size={12} className="fill-[#A3B396] text-[#A3B396]" />
                  <span>Bestseller</span>
                </span>
              )}
              {hasDiscount && (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Save {product.discountPercentage}%
                </span>
              )}
              <span className="px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-[#E8E5DE] text-[10px] font-semibold text-[#13231D] uppercase tracking-wider">
                Direct Bhiwandi Factory Dispatch
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#242620] hover:text-[#78836A] hover:bg-white shadow-xs transition cursor-pointer z-10"
              aria-label="Share product link"
            >
              <Share2 size={16} />
              {copied && (
                <span className="absolute right-0 top-11 bg-[#13231D] text-white text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap shadow-md">
                  Link copied!
                </span>
              )}
            </button>
          </div>

          {/* Interactive Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition bg-[#F6F5F0] p-1 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#78836A] ring-2 ring-[#78836A]/20'
                      : 'border-[#E8E5DE] hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText || `View ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Purchasing & Specifications (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#78836A]">
                {catInfo.name}
                {subcatInfo && ` › ${subcatInfo.name}`}
                {classInfo && ` › ${classInfo.name}`}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#13231D]">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-[#73756F] font-normal">(128 factory ratings)</span>
              </div>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#13231D] leading-tight">
              {product.name}
            </h1>
            <p className="font-mono text-xs text-[#73756F]">SKU: {product.sku}</p>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-[#13231D]">
                  ₹{product.sellingPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-base text-[#73756F] line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-[#E8E5DE] flex flex-wrap items-center gap-3 text-xs text-[#73756F]">
              <span className="text-emerald-800 font-medium">✓ Inclusive of 18% GST</span>
              <span>•</span>
              <span className="text-emerald-800 font-medium">✓ Free Pan-India Delivery</span>
              <span>•</span>
              <span>Zero Hidden Charges</span>
            </div>
          </div>

          {/* Short Highlight Description & Attribute Badges */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-[#242620] leading-relaxed bg-[#F7F5F0] p-4 rounded-xl border border-[#E8E5DE]">
              {product.shortDescription}
            </p>
          )}

          {/* Key Attributes Pills */}
          {product.attributes && Object.values(product.attributes).some(Boolean) && (
            <div className="flex flex-wrap items-center gap-2">
              {product.attributes.material && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E5DE] text-[11px] font-medium text-[#13231D] shadow-2xs">
                  Material: <strong className="text-[#78836A]">{product.attributes.material}</strong>
                </span>
              )}
              {product.attributes.backrestHeight && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E5DE] text-[11px] font-medium text-[#13231D] shadow-2xs">
                  Backrest: <strong className="text-[#78836A]">{product.attributes.backrestHeight}</strong>
                </span>
              )}
              {product.attributes.mechanism && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E5DE] text-[11px] font-medium text-[#13231D] shadow-2xs">
                  Mechanism: <strong className="text-[#78836A]">{product.attributes.mechanism}</strong>
                </span>
              )}
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {product.stock > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-emerald-800 font-semibold">
                  In Stock & Ready for Dispatch ({product.stock} units available at Bhiwandi facility)
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-rose-700 font-semibold">Currently Made-to-Order (7-10 Days)</span>
              </>
            )}
          </div>

          {/* Quantity & Cart Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-[#242620]">Quantity</span>
              <div className="flex items-center border border-[#E8E5DE] rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-2.5 hover:bg-[#F7F5F0] text-gray-600 transition rounded-l-xl cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="px-4 text-sm font-bold text-[#13231D]">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(product.stock || 99, prev + 1))}
                  disabled={product.stock > 0 && quantity >= product.stock}
                  className="p-2.5 hover:bg-[#F7F5F0] text-gray-600 disabled:opacity-30 transition rounded-r-xl cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : product.stock <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#13231D] hover:bg-[#78836A] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl bg-[#78836A] hover:bg-[#59644E] text-white text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Direct WhatsApp Quick Order CTA */}
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2.5 shadow-xs"
            >
              <MessageCircle size={17} className="text-white fill-white/20" />
              <span>Order / Inquire on WhatsApp (+91 97680 01999)</span>
            </a>

            {/* Corporate Quote Link */}
            <button
              type="button"
              onClick={() => setQuoteModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-[#E8E5DE] bg-white text-xs font-semibold text-[#13231D] hover:border-[#78836A] hover:text-[#78836A] transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Building2 size={15} className="text-[#78836A]" />
              <span>Ordering 10+ Units? Request Corporate Bulk Quote</span>
            </button>
          </div>

          {/* Delivery & Assurance Badges */}
          <div className="pt-6 border-t border-[#E8E5DE] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-[#73756F]">
            <div className="p-3 bg-white rounded-xl border border-[#E8E5DE]">
              <Truck size={17} className="mx-auto text-[#78836A] mb-1" />
              <span className="font-semibold block text-[#13231D]">Pan-India Delivery</span>
              <span className="text-[10px] text-emerald-700 font-medium">Free Doorstep Dispatch</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E8E5DE]">
              <ShieldCheck size={17} className="mx-auto text-[#78836A] mb-1" />
              <span className="font-semibold block text-[#13231D]">Factory Warranty</span>
              <span className="text-[10px] text-[#242620]">10-Year Coverage</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E8E5DE]">
              <CheckCircle2 size={17} className="mx-auto text-[#78836A] mb-1" />
              <span className="font-semibold block text-[#13231D]">Direct Dispatch</span>
              <span className="text-[10px] text-[#242620]">Bhiwandi Hub</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E8E5DE]">
              <RotateCcw size={17} className="mx-auto text-[#78836A] mb-1" />
              <span className="font-semibold block text-[#13231D]">Transit Insurance</span>
              <span className="text-[10px] text-[#242620]">100% Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Specifications & Description */}
      <div className="border-t border-[#E8E5DE] pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#13231D]">
            Craftsmanship & Design Rationale
          </h2>
          <p className="text-sm text-[#242620] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Ergonomic Specifications & Materials */}
          {product.attributes && Object.values(product.attributes).some(Boolean) && (
            <div className="pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A] mb-3">
                Ergonomic Specifications & Materials
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.attributes.material && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Primary Material</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.material}</span>
                  </div>
                )}
                {product.attributes.backrestHeight && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Backrest Profile</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.backrestHeight}</span>
                  </div>
                )}
                {product.attributes.mechanism && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Mechanism</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.mechanism}</span>
                  </div>
                )}
                {product.attributes.armrests && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Armrest Support</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.armrests}</span>
                  </div>
                )}
                {product.attributes.colour && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Color Finish</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.colour}</span>
                  </div>
                )}
                {product.attributes.weightCapacity && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Weight Tested</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.weightCapacity}</span>
                  </div>
                )}
                {product.attributes.dimensions && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Overall Dimensions</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.dimensions}</span>
                  </div>
                )}
                {product.attributes.upholstery && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E5DE] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-0.5">Upholstery</span>
                    <span className="text-xs font-bold text-[#13231D]">{product.attributes.upholstery}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A] mb-3">
                Technical Specifications & Engineering
              </h3>
              <div className="border border-[#E8E5DE] rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-[#E8E5DE]">
                  <tbody className="divide-y divide-[#E8E5DE]">
                    {product.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F7F5F0]/60' : 'bg-white'}>
                        <td className="py-3 px-5 font-semibold text-[#13231D] w-1/3">
                          {spec.key}
                        </td>
                        <td className="py-3 px-5 text-[#73756F]">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Box & Factory Visit Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E5DE] space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A]">
              Manufacturing & Assurance
            </h3>
            <div className="text-xs space-y-3 text-[#73756F]">
              <div className="pb-2.5 border-b border-[#E8E5DE]">
                <strong className="text-[#13231D] block">Warranty Guarantee:</strong>
                <span>{product.warranty || '10-Year comprehensive structural & mechanism warranty. Direct factory parts replacement.'}</span>
              </div>
              <div className="pb-2.5 border-b border-[#E8E5DE]">
                <strong className="text-[#13231D] block">Shipping & Assembly:</strong>
                <span>Pan-India free delivery directly from our Bhiwandi factory hub. Pre-assembled or guided 5-minute tool-free setup.</span>
              </div>
              <div>
                <strong className="text-[#13231D] block">Direct Consultation:</strong>
                <a
                  href="https://wa.me/919768001999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 mt-1"
                >
                  <MessageCircle size={13} />
                  <span>Chat with Factory Lead: +91 97680 01999</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bhiwandi Factory Experience Box */}
          <div className="bg-[#13231D] text-white p-6 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-repeat"
              style={{ backgroundImage: `url('/images/texture-grain-warm.png')`, backgroundSize: '240px 240px' }}
            />
            <div className="relative z-10 space-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#CBD5C0]">
                <MapPin size={12} className="text-emerald-400" />
                <span>Visit Our Bhiwandi Factory</span>
              </span>
              <h4 className="font-serif-luxury text-lg font-bold text-white leading-snug">
                Experience Comfort in Person
              </h4>
              <p className="text-[11px] text-[#CBD5C0] leading-relaxed">
                Harihar Compound, Bldg A/21, Mankoli - Anjurphata Rd, Dapode, Bhiwandi, Maharashtra 421302.
              </p>
              <a
                href="https://maps.app.goo.gl/3U8y1c7y3vRkFm6b6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition"
              >
                <span>View on Google Maps</span>
                <ChevronRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#E8E5DE] pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-2xl font-bold text-[#13231D]">
              Related Seating Designs
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-[#13231D] hover:text-[#78836A] uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All Seating</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Corporate Quote Modal */}
      <CorporateQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        prefilledProduct={product.name}
      />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs text-[#73756F]">
          Loading ErgoCraft seating details...
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
