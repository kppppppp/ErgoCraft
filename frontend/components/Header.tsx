'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { CorporateQuoteModal } from './CorporateQuoteModal';
import { fetchApi } from '../lib/api';
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  Briefcase,
  Sparkles,
  Command,
} from 'lucide-react';

interface SubcategoryLink {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

interface MenuSection {
  title: string;
  links: SubcategoryLink[];
}

interface MegaMenuConfig {
  id: string;
  label: string;
  href: string;
  hasDropdown: boolean;
  sections?: MenuSection[];
  featured?: {
    badge: string;
    title: string;
    description: string;
    price: string;
    image: string;
    href: string;
    ctaText: string;
  };
}

interface HeaderCategory { _id: string; name: string; slug: string; subcategories?: Array<{ _id: string; name: string; slug: string }> }

const NAVIGATION_ITEMS: MegaMenuConfig[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    hasDropdown: false,
  },
  {
    id: 'chairs',
    label: 'Chairs',
    href: '/products?category=office-chairs',
    hasDropdown: true,
    sections: [
      {
        title: 'Office Chairs',
        links: [
          {
            label: 'Executive Chairs',
            href: '/products?category=office-chairs&subcategory=leatherette-chairs',
            badge: 'Popular',
          },
          {
            label: 'Ergonomic Chairs',
            href: '/products?category=office-chairs&subcategory=mesh-chairs',
            badge: 'Flagship',
          },
          {
            label: 'Mesh Chairs',
            href: '/products?category=office-chairs&subcategory=mesh-chairs',
          },
          {
            label: 'High-Back Chairs',
            href: '/products?category=office-chairs&q=high+back',
          },
          {
            label: 'Mid-Back Chairs',
            href: '/products?category=office-chairs&q=mid+back',
          },
          {
            label: 'Visitor Chairs',
            href: '/products?category=office-chairs&q=visitor',
          },
        ],
      },
      {
        title: 'Specialty & Collections',
        links: [
          {
            label: 'Workstation Chairs',
            href: '/products?category=office-chairs&subcategory=workstation-chairs',
          },
          {
            label: 'COD Chairs',
            href: '/products?category=office-chairs&q=cod',
            badge: 'Available',
          },
          {
            label: 'Cafe & Bar Stools',
            href: '/products?category=soft-seating&subcategory=cafe-chairs',
          },
          {
            label: 'All Chairs',
            href: '/products?category=office-chairs',
            badge: 'View All',
          },
        ],
      },
    ],
    featured: {
      badge: 'Bestselling Ergonomics',
      title: 'Oscar High Back Mesh Chair',
      description: 'Active dynamic lumbar matrix with Korean elastomeric mesh and 3D armrests.',
      price: '₹12,999',
      image: '/images/hero-chair.jpg',
      href: '/products/oscar-high-back-mesh-chair',
      ctaText: 'View Oscar Chair',
    },
  },
  {
    id: 'sofas',
    label: 'Sofas',
    href: '/products?category=sofas',
    hasDropdown: true,
    sections: [
      {
        title: 'Configurations',
        links: [
          {
            label: 'All Sofas',
            href: '/products?category=sofas',
            badge: 'View All',
          },
          {
            label: 'Two-Seater Sofas',
            href: '/products?category=sofas&subcategory=2-seater-sofa',
          },
          {
            label: 'Three-Seater Sofas',
            href: '/products?category=sofas&subcategory=3-seater-sofa',
            badge: 'Bestseller',
          },
          {
            label: 'Lounge Sofas',
            href: '/products?category=sofas&q=lounge',
          },
        ],
      },
      {
        title: 'Commercial & Executive',
        links: [
          {
            label: 'Office Sofas',
            href: '/products?category=sofas&q=office',
          },
          {
            label: 'Reception Sofas',
            href: '/products?category=sofas&q=reception',
          },
          {
            label: 'Modular Sofas',
            href: '/products?category=sofas&q=modular',
          },
        ],
      },
    ],
    featured: {
      badge: 'Heritage Craft',
      title: 'Daylen Contemporary Leather Sofa',
      description: 'Handcrafted luxury upholstery with kiln-dried hardwood structure.',
      price: '₹45,999',
      image: '/images/hero-sofa.webp',
      href: '/products/chesterfield-royale-3-seater-sofa',
      ctaText: 'Explore Sofas',
    },
  },
  {
    id: 'soft-seating',
    label: 'Soft Seating',
    href: '/products?category=soft-seating',
    hasDropdown: true,
    sections: [
      {
        title: 'Accent & Lounge',
        links: [
          {
            label: 'All Soft Seating',
            href: '/products?category=soft-seating',
            badge: 'View All',
          },
          {
            label: 'Lounge Chairs',
            href: '/products?category=soft-seating&subcategory=lounge-chairs',
            badge: 'Popular',
          },
          {
            label: 'Accent Chairs',
            href: '/products?category=soft-seating&subcategory=lounge-chairs',
          },
          {
            label: 'Reception Seating',
            href: '/products?category=soft-seating&q=reception',
          },
        ],
      },
      {
        title: 'Dining & Breakout',
        links: [
          {
            label: 'Dining Chairs',
            href: '/products?category=soft-seating&subcategory=dining-chairs',
          },
          {
            label: 'Cafe Seating',
            href: '/products?category=soft-seating&subcategory=cafe-chairs',
          },
          {
            label: 'Collaborative Seating',
            href: '/products?category=soft-seating&q=collaborative',
          },
        ],
      },
    ],
    featured: {
      badge: 'Modern Breakout',
      title: 'Aria Contemporary Cafe Chair',
      description: 'UV-stabilized matte shell with architectural steel wireframe legs.',
      price: '₹7,999',
      image: '/images/cat-cafe.png',
      href: '/products/aria-contemporary-cafe-chair',
      ctaText: 'Discover Chair',
    },
  },
  {
    id: 'all-seating',
    label: 'All Seating',
    href: '/products',
    hasDropdown: false,
  },
  {
    id: 'corporate-solutions',
    label: 'Corporate Solutions',
    href: '#corporate-solutions',
    hasDropdown: false,
  },
];

// Maps subcategory labels to existing product images for the mega-menu live preview
const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Chairs
  'Executive Chairs': '/images/cat-executive.png',
  'Ergonomic Chairs': '/images/categories/mesh-chair-zee.jpg',
  'Mesh Chairs': '/images/categories/mesh-chair-polo.png',
  'High-Back Chairs': '/images/categories/stanley-hb-grey.png',
  'Mid-Back Chairs': '/images/categories/oscar-mb.png',
  'Visitor Chairs': '/images/categories/visitor-conference-chair.jpg',
  'Workstation Chairs': '/images/categories/workstation-chairs.png',
  'COD Chairs': '/images/cat-visitor.png',
  'Cafe & Bar Stools': '/hero-img/bar_stool.png',
  'All Chairs': '/images/hero-chair.jpg',
  // Sofas
  'All Sofas': '/images/hero-sofa.webp',
  'Two-Seater Sofas': '/images/categories/stokes-sofa.png',
  'Three-Seater Sofas': '/images/categories/woodland-sofa.png',
  'Lounge Sofas': '/images/categories/sofa-daylen.webp',
  'Office Sofas': '/images/categories/stokes-sofa.png',
  'Reception Sofas': '/images/categories/nivea-1seater.png',
  'Modular Sofas': '/images/categories/woodland-sofa.png',
  // Soft Seating
  'All Soft Seating': '/hero-img/soft_sitting.png',
  'Lounge Chairs': '/images/categories/lounge-chair-velvet.jpg',
  'Accent Chairs': '/images/categories/spruce-lounge-cutout.png',
  'Reception Seating': '/images/categories/doux-lounge.png',
  'Dining Chairs': '/images/categories/dining-chair-ergo.png',
  'Cafe Seating': '/images/categories/cafe-stool-ergo.png',
  'Collaborative Seating': '/images/categories/sunflower-lounge.png',
};

// Fallback images per category for dynamic previews
const CATEGORY_PREVIEW_FALLBACKS: Record<string, string> = {
  chairs: '/images/hero-chair.jpg',
  'office-chairs': '/images/hero-chair.jpg',
  sofas: '/images/hero-sofa.webp',
  'soft-seating': '/hero-img/soft_sitting.png',
};

export const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cartCount, openCart } = useCart();
  const [navigationItems] = useState(NAVIGATION_ITEMS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>('chairs');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{ label: string; href: string; image: string } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Suggested quick search terms
  const suggestedSearches = [
    { label: 'Oscar High Back Mesh', query: 'oscar' },
    { label: 'Executive Leatherette', query: 'leatherette' },
    { label: 'Chesterfield Sofa', query: 'chesterfield' },
    { label: 'Workstation Chairs', query: 'workstation' },
    { label: 'Wingback Lounge', query: 'wingback' },
  ];

  // Close menus on Escape key & listen for keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null);
        setHoveredLink(null);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const item = navigationItems.find((nav) => nav.id === id);
    if (item?.hasDropdown) {
      setActiveMegaMenu(id);
      setHoveredLink(null);
    } else {
      setActiveMegaMenu(null);
      setHoveredLink(null);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // 240ms buffer allows smooth pointer transition from navbar into dropdown
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredLink(null);
    }, 240);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleQuickTagClick = (tagQuery: string) => {
    router.push(`/products?q=${encodeURIComponent(tagQuery)}`);
    setSearchOpen(false);
  };

  const toggleMobileCategory = (id: string) => {
    setExpandedMobileCategory(expandedMobileCategory === id ? null : id);
  };

  const handleCorporateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('corporate-solutions');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCorporateModalOpen(true);
    }
  };

  return (
    <>
      {/* 1. Slim Announcement Bar */}
      <div className="bg-[#0B1512]/95 text-[#F7F5F0] text-[10px] sm:text-[11px] py-1.5 px-3 sm:px-4 border-b border-white/8 select-none transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1 sm:gap-2">
          {/* Left Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-6 text-[#F7F5F0]/85">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={12} className="text-[#C5A880] shrink-0" />
              <span>Secure checkout with Razorpay</span>
            </span>
            <span className="hidden sm:inline text-white/25">&bull;</span>
            <span className="hidden xs:flex items-center gap-1.5">
              <Truck size={12} className="text-[#C5A880] shrink-0" />
              <span>Order updates in your account</span>
            </span>
            <span className="hidden lg:inline text-white/25">&bull;</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <Briefcase size={12} className="text-[#C5A880] shrink-0" />
              <span>Corporate & Institutional Bulk Pricing</span>
            </span>
          </div>

          {/* Right Utility Navigation */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs font-medium text-[#F7F5F0]/85 shrink-0">
            <button
              onClick={() => setCorporateModalOpen(true)}
              className="text-[#C5A880] hover:underline cursor-pointer font-semibold flex items-center gap-1"
            >
              <Sparkles size={11} className="shrink-0" />
              <span>Bulk Enquiry</span>
            </button>
            <span className="text-white/25">|</span>
            <Link href={user ? '/account' : '/login'} className="hover:text-[#C5A880] transition-colors">
              {user ? 'My Account' : 'Sign In / Track Order'}
            </Link>
            <span className="text-white/25">|</span>
            <a
              href="tel:+919768001999"
              className="hover:text-[#C5A880] transition-colors flex items-center gap-1"
            >
              <PhoneCall size={11} className="text-[#C5A880] shrink-0" />
              <span>+91 97680 01999</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Main Site Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#FDFCF8]/98 backdrop-blur-xl border-[#E8E5DE] shadow-sm'
            : 'bg-[#FDFCF8]/92 backdrop-blur-md border-[#E8E5DE]'
        }`}
      >
        <div className="w-full px-3 sm:px-8 xl:px-12 h-16 sm:h-18 md:h-20 flex items-center justify-between gap-2">
          {/* Mobile hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-[#242620] hover:text-[#78836A] lg:hidden cursor-pointer rounded-lg hover:bg-[#EFEEE8]"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={22} />
          </button>

            {/* Brand Logo & Identification */}
            <Link href="/" className="flex items-center group py-1 shrink-0" aria-label="ErgoCraft Seating Home">
              <Image
                src="/images/logo.png"
                alt="ErgoCraft Seating Pvt. Ltd. - Ergo Comfort, Expertly Crafted"
                width={190}
                height={62}
                className="w-[125px] xs:w-[145px] sm:w-[170px] md:w-[190px] h-auto object-contain transition-opacity hover:opacity-90"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-2 h-full text-sm font-medium text-[#242620]"
              onMouseLeave={handleMouseLeave}
            >
              {navigationItems.map((item) => {
                const isOpen = activeMegaMenu === item.id;
                const isCorporate = item.id === 'corporate-solutions';

                if (isCorporate) {
                  return (
                    <div
                      key={item.id}
                      className="relative h-full flex items-center px-3 xl:px-4 cursor-pointer"
                      onClick={handleCorporateClick}
                    >
                      <button
                        type="button"
                        className="flex items-center gap-1.5 py-2 text-[#78836A] hover:text-[#59644E] font-semibold transition-colors cursor-pointer"
                      >
                        <Briefcase size={14} />
                        <span>{item.label}</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="relative h-full flex items-center px-3 xl:px-4 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={item.hasDropdown ? isOpen : undefined}
                      aria-haspopup={item.hasDropdown ? 'true' : undefined}
                      className={`flex items-center gap-1.5 py-2 hover:text-[#78836A] transition-colors relative font-medium ${
                        isOpen ? 'text-[#78836A]' : ''
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasDropdown && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 text-[#73756F] ${
                            isOpen ? 'rotate-180 text-[#78836A]' : ''
                          }`}
                        />
                      )}
                      {/* Active underline indicator */}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-[#78836A] transition-all duration-200 ${
                          isOpen ? 'w-full' : 'w-0'
                        }`}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-[#242620] hover:text-[#78836A] hover:bg-[#EFEEE8] rounded-full transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                aria-label="Search catalogue (Ctrl+K)"
              >
                <Search size={18} />
                <span className="hidden md:inline-flex items-center text-[10px] text-[#73756F] bg-[#EFEEE8] px-1.5 py-0.5 rounded border border-[#E8E5DE]">
                  <Command size={10} className="mr-0.5" /> K
                </span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/products?filter=wishlist"
                className="p-2.5 text-[#242620] hover:text-[#78836A] hover:bg-[#EFEEE8] rounded-full transition-colors hidden sm:flex items-center justify-center"
                aria-label="Saved products"
              >
                <Heart size={18} />
              </Link>

              {/* Account Icon */}
              <Link
                href={user ? '/account' : '/login'}
                className="p-2 sm:px-3 text-[#242620] hover:text-[#78836A] hover:bg-[#EFEEE8] rounded-full sm:rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                aria-label={user ? 'Customer Account & Orders' : 'Sign In to Account'}
              >
                <User size={18} />
                <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Sign In'}</span>
              </Link>

              {/* Shopping Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 text-[#242620] hover:text-[#78836A] hover:bg-[#EFEEE8] rounded-full transition-colors cursor-pointer flex items-center justify-center"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#78836A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

        {/* 3. Full-Width Desktop Mega Menu with Live Image Preview */}
        {activeMegaMenu && (
          <div
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white/98 backdrop-blur-2xl border-b border-[#E8E5DE] shadow-[0_20px_40px_rgba(0,0,0,0.10)] z-50 transition-all duration-200 overflow-hidden"
          >
            {/* Hover safe-area bridge */}
            <div className="absolute -top-2 left-0 right-0 h-2" />

            <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 py-8">
              {(() => {
                const activeConfig = navigationItems.find((nav) => nav.id === activeMegaMenu);
                if (!activeConfig || !activeConfig.hasDropdown) return null;

                // Determine the preview image: hovered subcategory > featured image > category fallback
                const previewImage =
                  hoveredLink?.image ||
                  activeConfig.featured?.image ||
                  CATEGORY_PREVIEW_FALLBACKS[activeConfig.id] ||
                  '/images/cat-workstation.png';

                const previewLabel =
                  hoveredLink?.label ||
                  activeConfig.featured?.title ||
                  activeConfig.label;

                const previewHref =
                  hoveredLink?.href ||
                  activeConfig.featured?.href ||
                  activeConfig.href;

                return (
                  <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Left: Subcategory Navigation Columns */}
                    <div
                      className={`grid ${
                        activeConfig.sections && activeConfig.sections.length > 2
                          ? 'col-span-7 grid-cols-3'
                          : 'col-span-7 grid-cols-2'
                      } gap-6`}
                    >
                      {activeConfig.sections?.map((section) => (
                        <div key={section.title} className="space-y-3">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#78836A] border-b border-[#E8E5DE] pb-2">
                            {section.title}
                          </h4>
                          <ul className="space-y-1">
                            {section.links.map((link) => {
                              const linkImage =
                                SUBCATEGORY_IMAGES[link.label] ||
                                CATEGORY_PREVIEW_FALLBACKS[activeConfig.id] ||
                                '/images/cat-workstation.png';
                              const isHovered = hoveredLink?.label === link.label;

                              return (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setActiveMegaMenu(null)}
                                    onMouseEnter={() =>
                                      setHoveredLink({
                                        label: link.label,
                                        href: link.href,
                                        image: linkImage,
                                      })
                                    }
                                    className={`text-[13px] font-medium flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 group ${
                                      isHovered
                                        ? 'bg-[#F5F4EC] text-[#78836A]'
                                        : 'text-[#242620] hover:bg-[#F5F4EC] hover:text-[#78836A]'
                                    }`}
                                  >
                                    <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                                      {link.label}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      {link.badge && (
                                        <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#EFEEE8] text-[#13231D] border border-[#E8E5DE]">
                                          {link.badge}
                                        </span>
                                      )}
                                      <ChevronRight
                                        size={13}
                                        className={`transition-all duration-150 ${
                                          isHovered
                                            ? 'opacity-100 translate-x-0 text-[#78836A]'
                                            : 'opacity-0 -translate-x-1 text-[#73756F]'
                                        }`}
                                      />
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Right: Live Image Preview Panel */}
                    <div className="col-span-5 relative">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F4EC]">
                        {/* Image with fade transition */}
                        <img
                          key={previewImage}
                          src={previewImage}
                          alt={previewLabel}
                          className="w-full h-full object-cover animate-[fadeIn_200ms_ease-out]"
                        />

                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Subcategory name + explore CTA */}
                        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                          <div>
                            <p className="text-white font-semibold text-base leading-snug drop-shadow-sm">
                              {previewLabel}
                            </p>
                          </div>
                          <Link
                            href={previewHref}
                            onClick={() => setActiveMegaMenu(null)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 transition-all duration-200"
                          >
                            <span>Explore</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 4. Live Search Dropdown Panel */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-[#E8E5DE] bg-[#FAF9F5]/98 backdrop-blur-2xl p-4 sm:p-6 shadow-xl transition-all z-50">
            <div className="max-w-3xl mx-auto space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#73756F]" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search office chairs, velvet sofas, ergonomic seating, SKU..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E5DE] bg-white text-sm text-[#242620] focus:outline-none focus:border-[#78836A] shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#13231D] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#78836A] transition cursor-pointer shadow-xs"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 text-[#73756F] hover:text-[#242620] cursor-pointer"
                  aria-label="Close search overlay"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Popular Suggested Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#73756F]">
                <span className="font-semibold text-[#242620]">Popular searches:</span>
                {suggestedSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickTagClick(item.query)}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#E8E5DE] hover:border-[#78836A] hover:text-[#78836A] transition cursor-pointer shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 5. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#13231D]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 max-w-[320px] xs:max-w-sm w-full bg-white shadow-2xl flex flex-col p-4 sm:p-6 overflow-y-auto z-10">
            {/* Header with Brand & Close */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E5DE]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label="ErgoCraft Seating Home">
                <Image
                  src="/images/logo.png"
                  alt="ErgoCraft Seating Pvt. Ltd."
                  width={140}
                  height={46}
                  className="w-32 xs:w-36 h-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-1 text-[#73756F] hover:text-[#242620] rounded-full hover:bg-[#EFEEE8] cursor-pointer"
                aria-label="Close mobile navigation"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chairs, sofas, stools..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E8E5DE] bg-[#F7F5F0] text-xs text-[#242620] focus:outline-none focus:border-[#78836A]"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Navigation Accordions */}
            <nav className="flex-1 py-4 space-y-1">
              {navigationItems.map((item) => {
                if (item.id === 'corporate-solutions') {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCorporateModalOpen(true);
                      }}
                      className="w-full text-left flex items-center justify-between py-3 px-2 text-sm font-semibold text-[#78836A] hover:bg-[#F7F5F0] rounded-lg cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase size={16} />
                        <span>Corporate Solutions</span>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                }

                if (!item.hasDropdown) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] border-b border-gray-100"
                    >
                      {item.label}
                    </Link>
                  );
                }

                const isExpanded = expandedMobileCategory === item.id;

                return (
                  <div key={item.id} className="border-b border-[#E8E5DE]/60 py-1">
                    <button
                      onClick={() => toggleMobileCategory(item.id)}
                      className="w-full flex items-center justify-between py-2.5 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#78836A]' : ''
                        }`}
                      />
                    </button>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="pl-4 pr-2 pb-3 pt-1 space-y-3 bg-[#F7F5F0]/60 rounded-lg">
                        {item.sections?.map((section) => (
                          <div key={section.title} className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#78836A] block">
                              {section.title}
                            </span>
                            <div className="space-y-1 pl-1">
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-xs text-[#73756F] hover:text-[#242620] py-1"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#78836A] pt-2"
                        >
                          <span>Explore All {item.label}</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Account Links */}
              <div className="pt-4 border-t border-[#E8E5DE] space-y-2">
                <Link
                  href={user ? '/account' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-xs font-medium text-[#242620] hover:text-[#78836A] py-2 px-2"
                >
                  <User size={16} />
                  <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
                </Link>
              </div>
            </nav>

            {/* Footer Trust Details */}
            <div className="pt-4 border-t border-[#E8E5DE] text-[11px] text-[#73756F] space-y-1">
              <p className="font-semibold text-[#242620]">ErgoCraft Seating Pvt. Ltd.</p>
              <p>Secure checkout • Account order history</p>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Quote Modal */}
      <CorporateQuoteModal
        isOpen={corporateModalOpen}
        onClose={() => setCorporateModalOpen(false)}
      />
    </>
  );
};
