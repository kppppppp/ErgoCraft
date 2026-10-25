'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { CorporateQuoteModal } from './CorporateQuoteModal';
import { fetchApi } from '../lib/api';
import type { CategorySummary } from '../lib/types';
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

// Fallback hierarchical categories if backend is booting or unreachable
const DEFAULT_TREE_CATEGORIES: CategorySummary[] = [
  {
    _id: 'cat-office-chairs',
    name: 'Office Chairs',
    slug: 'office-chairs',
    showInNavbar: true,
    isActive: true,
    image: { url: '/images/hero-chair.jpg' },
    children: [
      {
        _id: 'sub-leatherette',
        name: 'Leatherette Chairs',
        slug: 'leatherette-chairs',
        showInNavbar: true,
        isActive: true,
        image: { url: '/images/cat-executive.png' },
        children: [
          { _id: 'class-lhb', name: 'Leatherette High Back', slug: 'leatherette-high-back', showInNavbar: true, isActive: true, image: { url: '/images/categories/stanley-hb-grey.png' } },
          { _id: 'class-lmb', name: 'Leatherette Medium Back', slug: 'leatherette-medium-back', showInNavbar: true, isActive: true, image: { url: '/images/categories/leno-grey-mb.png' } },
          { _id: 'class-lc', name: 'Leatherette Cushion', slug: 'leatherette-cushion', showInNavbar: true, isActive: true, image: { url: '/images/categories/leatherette-chairs.jpg' } },
          { _id: 'class-lw', name: 'Leatherette Workstation Chairs', slug: 'leatherette-workstation-chairs', showInNavbar: true, isActive: true, image: { url: '/images/cat-workstation.png' } },
        ],
      },
      {
        _id: 'sub-mesh',
        name: 'Mesh Chairs',
        slug: 'mesh-chairs',
        showInNavbar: true,
        isActive: true,
        image: { url: '/images/categories/mesh-chair-polo.png' },
        children: [
          { _id: 'class-mhb', name: 'Mesh High Back', slug: 'mesh-high-back', showInNavbar: true, isActive: true, image: { url: '/images/hero-chair.jpg' } },
          { _id: 'class-mmb', name: 'Mesh Medium Back', slug: 'mesh-medium-back', showInNavbar: true, isActive: true, image: { url: '/images/categories/oscar-mb.png' } },
          { _id: 'class-ms', name: 'Mesh Staff Chairs', slug: 'mesh-staff-chairs', showInNavbar: true, isActive: true, image: { url: '/images/categories/mesh-chair-zee.jpg' } },
        ],
      },
      {
        _id: 'sub-workstation',
        name: 'Workstation Cushion Chairs',
        slug: 'workstation-chairs',
        showInNavbar: true,
        isActive: true,
        image: { url: '/images/categories/workstation-chairs.png' },
        children: [],
      },
    ],
  },
  {
    _id: 'cat-sofas',
    name: 'Sofas',
    slug: 'sofas',
    showInNavbar: true,
    isActive: true,
    image: { url: '/images/hero-sofa.webp' },
    children: [
      { _id: 'sub-3seater', name: '3-Seater Sofa', slug: '3-seater-sofa', showInNavbar: true, isActive: true, image: { url: '/images/categories/woodland-sofa.png' }, children: [] },
      { _id: 'sub-2seater', name: '2-Seater Sofa', slug: '2-seater-sofa', showInNavbar: true, isActive: true, image: { url: '/images/categories/stokes-sofa.png' }, children: [] },
    ],
  },
  {
    _id: 'cat-soft-seating',
    name: 'Soft Seating',
    slug: 'soft-seating',
    showInNavbar: true,
    isActive: true,
    image: { url: '/hero-img/soft_sitting.png' },
    children: [
      { _id: 'sub-lounge', name: 'Lounge Chairs', slug: 'lounge-chairs', showInNavbar: true, isActive: true, image: { url: '/images/categories/lounge-chair-velvet.jpg' }, children: [] },
      { _id: 'sub-dining', name: 'Dining Chairs', slug: 'dining-chairs', showInNavbar: true, isActive: true, image: { url: '/images/categories/dining-chair-ergo.png' }, children: [] },
      { _id: 'sub-cafe', name: 'Cafe Chairs', slug: 'cafe-chairs', showInNavbar: true, isActive: true, image: { url: '/images/categories/cafe-stool-ergo.png' }, children: [] },
    ],
  },
];

// Fallback preview images for classifications
const DEFAULT_PREVIEW_MAP: Record<string, string> = {
  'office-chairs': '/images/hero-chair.jpg',
  'leatherette-chairs': '/images/cat-executive.png',
  'leatherette-high-back': '/images/categories/stanley-hb-grey.png',
  'leatherette-medium-back': '/images/categories/leno-grey-mb.png',
  'leatherette-cushion': '/images/categories/leatherette-chairs.jpg',
  'leatherette-workstation-chairs': '/images/cat-workstation.png',
  'mesh-chairs': '/images/categories/mesh-chair-polo.png',
  'mesh-high-back': '/images/hero-chair.jpg',
  'mesh-medium-back': '/images/categories/oscar-mb.png',
  'mesh-staff-chairs': '/images/categories/mesh-chair-zee.jpg',
  'workstation-chairs': '/images/categories/workstation-chairs.png',
  sofas: '/images/hero-sofa.webp',
  '3-seater-sofa': '/images/categories/woodland-sofa.png',
  '2-seater-sofa': '/images/categories/stokes-sofa.png',
  'soft-seating': '/hero-img/soft_sitting.png',
  'lounge-chairs': '/images/categories/lounge-chair-velvet.jpg',
  'dining-chairs': '/images/categories/dining-chair-ergo.png',
  'cafe-chairs': '/images/categories/cafe-stool-ergo.png',
};

export const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cartCount, openCart } = useCart();

  // Dynamic Categories from database
  const [categoryTree, setCategoryTree] = useState<CategorySummary[]>(DEFAULT_TREE_CATEGORIES);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Navigation and mega menu state
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [hoveredPreview, setHoveredPreview] = useState<{
    label: string;
    href: string;
    image: string;
  } | null>(null);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileRoots, setExpandedMobileRoots] = useState<Record<string, boolean>>({});
  const [expandedMobileSubs, setExpandedMobileSubs] = useState<Record<string, boolean>>({});

  // Search & Utilities
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Category Tree dynamically from backend API with no-store cache policy
  useEffect(() => {
    let isMounted = true;
    const loadCategoryTree = async () => {
      try {
        let rawList: CategorySummary[] | null = null;
        try {
          const res = await fetchApi<{ tree?: CategorySummary[]; categories?: CategorySummary[] }>(
            '/categories',
            { cache: 'no-store' }
          );
          rawList = res.data?.categories || res.data?.tree || null;
        } catch {
          const res = await fetchApi<{ tree?: CategorySummary[]; categories?: CategorySummary[] }>(
            '/categories/tree',
            { cache: 'no-store' }
          );
          rawList = res.data?.tree || res.data?.categories || null;
        }

        if (isMounted && rawList && Array.isArray(rawList) && rawList.length > 0) {
          // Recursive helper to sanitize active and navbar-visible nodes
          const sanitizeNodes = (nodes: CategorySummary[]): CategorySummary[] => {
            return nodes
              .filter((n) => n.isActive !== false && n.showInNavbar !== false)
              .map((n) => {
                const rawSubs = n.children || n.subcategories || [];
                const cleanChildren = sanitizeNodes(rawSubs);
                return {
                  ...n,
                  children: cleanChildren,
                  subcategories: cleanChildren,
                };
              });
          };

          const filteredTree = sanitizeNodes(rawList);
          if (filteredTree.length > 0) {
            setCategoryTree(filteredTree);
            setCategoriesLoaded(true);
          }
        }
      } catch {
        // Fallback default tree is already in place
      }
    };

    loadCategoryTree();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close menus on Escape key & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null);
        setHoveredPreview(null);
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

  // Stable hover with debounce
  const handleMouseEnter = (slug: string, hasChildren: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasChildren) {
      setActiveMegaMenu(slug);
      setHoveredPreview(null);
    } else {
      setActiveMegaMenu(null);
      setHoveredPreview(null);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredPreview(null);
    }, 240);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const toggleMobileRoot = (slug: string) => {
    setExpandedMobileRoots((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleMobileSub = (slug: string) => {
    setExpandedMobileSubs((prev) => ({ ...prev, [slug]: !prev[slug] }));
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

  // Helper to determine image URL for a category preview
  const getCategoryImageUrl = (cat: CategorySummary): string => {
    if (cat.image?.url && cat.image.url.trim()) return cat.image.url;
    if (DEFAULT_PREVIEW_MAP[cat.slug]) return DEFAULT_PREVIEW_MAP[cat.slug];
    return '/images/cat-workstation.png';
  };

  // Active root category object for open mega menu
  const activeRootCategory = useMemo(() => {
    if (!activeMegaMenu) return null;
    return categoryTree.find((c) => c.slug === activeMegaMenu) || null;
  }, [activeMegaMenu, categoryTree]);

  return (
    <>
      {/* 1. Slim Announcement Bar */}
      <div className="bg-[#0B1512]/95 text-[#F7F5F0] text-[10px] sm:text-[11px] py-1.5 px-3 sm:px-4 border-b border-white/8 select-none transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1 sm:gap-2">
          {/* Left Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-6 text-[#F7F5F0]/85">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={12} className="text-[#C5A880] shrink-0" />
              <span>Direct Bhiwandi Factory • 10-Yr Warranty</span>
            </span>
            <span className="hidden sm:inline text-white/25">&bull;</span>
            <span className="hidden xs:flex items-center gap-1.5">
              <Truck size={12} className="text-[#C5A880] shrink-0" />
              <span>Pan-India Free Express Shipping</span>
            </span>
            <span className="hidden lg:inline text-white/25">&bull;</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <Briefcase size={12} className="text-[#C5A880] shrink-0" />
              <span>Institutional & Corporate Bulk Pricing</span>
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
              {user ? 'My Account' : 'Sign In / Orders'}
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

      {/* 2. Main Site Header */}
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

          {/* Brand Logo */}
          <Link href="/" className="flex items-center group py-1 shrink-0" aria-label="ErgoCraft Seating Home">
            <Image
              src="/images/logo.png"
              alt="ErgoCraft Seating Pvt. Ltd."
              width={190}
              height={62}
              className="w-[125px] xs:w-[145px] sm:w-[170px] md:w-[190px] h-auto object-contain transition-opacity hover:opacity-90"
              priority
            />
          </Link>

          {/* Desktop Navigation Links — Generated Dynamically from Category Tree */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-2 h-full text-sm font-medium text-[#242620]"
            onMouseLeave={handleMouseLeave}
          >
            {/* Home Link */}
            <div className="relative h-full flex items-center px-3 xl:px-4">
              <Link href="/" className="py-2 hover:text-[#78836A] transition-colors font-medium">
                Home
              </Link>
            </div>

            {/* Dynamic Root Categories from Database */}
            {categoryTree.map((rootCat) => {
              const children = rootCat.children || rootCat.subcategories || [];
              const hasDropdown = children.length > 0;
              const isOpen = activeMegaMenu === rootCat.slug;

              return (
                <div
                  key={rootCat._id}
                  className="relative h-full flex items-center px-3 xl:px-4 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(rootCat.slug, hasDropdown)}
                >
                  <Link
                    href={`/products?category=${rootCat.slug}`}
                    aria-expanded={hasDropdown ? isOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                    className={`flex items-center gap-1.5 py-2 hover:text-[#78836A] transition-colors relative font-medium ${
                      isOpen ? 'text-[#78836A]' : ''
                    }`}
                  >
                    <span>{rootCat.name}</span>
                    {hasDropdown && (
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

            {/* All Seating Link */}
            <div className="relative h-full flex items-center px-3 xl:px-4">
              <Link href="/products" className="py-2 hover:text-[#78836A] transition-colors font-medium">
                All Seating
              </Link>
            </div>

            {/* Corporate Solutions */}
            <div
              className="relative h-full flex items-center px-3 xl:px-4 cursor-pointer"
              onClick={handleCorporateClick}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 py-2 text-[#78836A] hover:text-[#59644E] font-semibold transition-colors cursor-pointer"
              >
                <Briefcase size={14} />
                <span>Corporate Solutions</span>
              </button>
            </div>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
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
              aria-label={user ? 'Customer Account' : 'Sign In'}
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

        {/* 3. DYNAMIC MULTI-COLUMN MEGA MENU WITH LIVE IMAGE PREVIEW */}
        {activeRootCategory && (
          <div
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white/98 backdrop-blur-2xl border-b border-[#E8E2D9] shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-50 transition-all duration-200 overflow-hidden"
          >
            {/* Hover safe-area bridge to avoid flickering */}
            <div className="absolute -top-2 left-0 right-0 h-2" />

            <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 py-8">
              {(() => {
                const subcategories =
                  activeRootCategory.children || activeRootCategory.subcategories || [];

                // Determine preview image & info
                const previewImg =
                  hoveredPreview?.image ||
                  getCategoryImageUrl(activeRootCategory);

                const previewTitle =
                  hoveredPreview?.label || activeRootCategory.name;

                const previewHref =
                  hoveredPreview?.href || `/products?category=${activeRootCategory.slug}`;

                const colCount = Math.min(4, Math.max(2, subcategories.length));

                return (
                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Left: Dynamic Subcategory Columns */}
                    <div
                      className={`grid col-span-8 ${
                        colCount >= 3 ? 'grid-cols-3' : 'grid-cols-2'
                      } gap-6`}
                    >
                      {subcategories.map((sub) => {
                        const classifications =
                          sub.children || sub.subcategories || [];
                        const subHref = `/products?category=${activeRootCategory.slug}&subcategory=${sub.slug}`;

                        return (
                          <div key={sub._id} className="space-y-3">
                            {/* Column Header: Level 2 Category */}
                            <div className="border-b border-[#E8E2D9] pb-2 flex items-center justify-between">
                              <Link
                                href={subHref}
                                onClick={() => setActiveMegaMenu(null)}
                                onMouseEnter={() =>
                                  setHoveredPreview({
                                    label: sub.name,
                                    href: subHref,
                                    image: getCategoryImageUrl(sub),
                                  })
                                }
                                className="text-xs font-bold uppercase tracking-wider text-[#78836A] hover:text-[#59644E] flex items-center gap-1 group"
                              >
                                <span>{sub.name}</span>
                                <ChevronRight
                                  size={13}
                                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#78836A]"
                                />
                              </Link>
                            </div>

                            {/* Column Links: Level 3 Classifications */}
                            <ul className="space-y-1">
                              {classifications.length > 0 ? (
                                classifications.map((item) => {
                                  const itemHref = `/products?category=${activeRootCategory.slug}&subcategory=${sub.slug}&classification=${item.slug}`;
                                  const isHovered = hoveredPreview?.label === item.name;

                                  return (
                                    <li key={item._id}>
                                      <Link
                                        href={itemHref}
                                        onClick={() => setActiveMegaMenu(null)}
                                        onMouseEnter={() =>
                                          setHoveredPreview({
                                            label: item.name,
                                            href: itemHref,
                                            image: getCategoryImageUrl(item),
                                          })
                                        }
                                        className={`text-xs font-medium flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 group ${
                                          isHovered
                                            ? 'bg-[#F5F4EC] text-[#78836A]'
                                            : 'text-[#242620] hover:bg-[#F5F4EC] hover:text-[#78836A]'
                                        }`}
                                      >
                                        <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                                          {item.name}
                                        </span>
                                        <ChevronRight
                                          size={12}
                                          className={`transition-all duration-150 ${
                                            isHovered
                                              ? 'opacity-100 translate-x-0 text-[#78836A]'
                                              : 'opacity-0 -translate-x-1 text-[#73756F]'
                                          }`}
                                        />
                                      </Link>
                                    </li>
                                  );
                                })
                              ) : (
                                <li>
                                  <Link
                                    href={subHref}
                                    onClick={() => setActiveMegaMenu(null)}
                                    className="text-xs text-[#73756F] hover:text-[#78836A] py-1 block"
                                  >
                                    View {sub.name} Collection
                                  </Link>
                                </li>
                              )}

                              {/* View All under column */}
                              <li className="pt-1.5">
                                <Link
                                  href={subHref}
                                  onClick={() => setActiveMegaMenu(null)}
                                  className="text-[11px] font-bold text-[#78836A] hover:underline flex items-center gap-1"
                                >
                                  <span>View All {sub.name}</span>
                                  <ArrowRight size={11} />
                                </Link>
                              </li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Live Image Preview Panel */}
                    <div className="col-span-4 relative pl-4 border-l border-[#E8E2D9]">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F4EC] shadow-xs">
                        <img
                          key={previewImg}
                          src={previewImg}
                          alt={previewTitle}
                          className="w-full h-full object-cover animate-[fadeIn_200ms_ease-out]"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                        {/* Title & Explore Button */}
                        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] block mb-0.5">
                              {activeRootCategory.name}
                            </span>
                            <p className="text-white font-semibold text-base leading-snug drop-shadow-sm">
                              {previewTitle}
                            </p>
                          </div>
                          <Link
                            href={previewHref}
                            onClick={() => setActiveMegaMenu(null)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white/35 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-white/25 transition-all duration-200 shrink-0"
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
          <div className="absolute left-0 right-0 top-full border-b border-[#E8E2D9] bg-[#FAF9F5]/98 backdrop-blur-2xl p-4 sm:p-6 shadow-xl transition-all z-50">
            <div className="max-w-3xl mx-auto space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#73756F]" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search office chairs, leatherette seating, high back, mesh, sofas..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm text-[#242620] focus:outline-none focus:border-[#78836A] shadow-xs"
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
            </div>
          </div>
        )}
      </header>

      {/* 5. Mobile Drawer Navigation with Hierarchical Accordion */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#13231D]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content (tested on 320px to 430px widths) */}
          <div className="fixed inset-y-0 left-0 max-w-[320px] xs:max-w-sm w-full bg-white shadow-2xl flex flex-col p-4 sm:p-6 overflow-y-auto z-10">
            {/* Header with Brand & Close */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E2D9]">
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
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E8E2D9] bg-[#F7F5F0] text-xs text-[#242620] focus:outline-none focus:border-[#78836A]"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Navigation Multi-Level Accordions */}
            <nav className="flex-1 py-4 space-y-1">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] border-b border-gray-100"
              >
                Home
              </Link>

              {/* Dynamic Root Categories */}
              {categoryTree.map((root) => {
                const subcategories = root.children || root.subcategories || [];
                const hasSubs = subcategories.length > 0;
                const isRootExpanded = !!expandedMobileRoots[root.slug];

                if (!hasSubs) {
                  return (
                    <Link
                      key={root._id}
                      href={`/products?category=${root.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] border-b border-gray-100"
                    >
                      {root.name}
                    </Link>
                  );
                }

                return (
                  <div key={root._id} className="border-b border-[#E8E2D9]/70 py-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/products?category=${root.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] flex-1"
                      >
                        {root.name}
                      </Link>
                      <button
                        onClick={() => toggleMobileRoot(root.slug)}
                        className="p-2.5 text-gray-400 hover:text-[#78836A] cursor-pointer"
                        aria-label={`Expand ${root.name} subcategories`}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isRootExpanded ? 'rotate-180 text-[#78836A]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Level 2 Subcategories Accordion */}
                    {isRootExpanded && (
                      <div className="pl-3 pr-2 pb-3 pt-1 space-y-2 bg-[#F7F5F0]/70 rounded-lg ml-1">
                        {subcategories.map((sub) => {
                          const classifications =
                            sub.children || sub.subcategories || [];
                          const hasClassifications = classifications.length > 0;
                          const isSubExpanded = !!expandedMobileSubs[sub.slug];

                          return (
                            <div key={sub._id} className="border-l-2 border-[#78836A]/30 pl-2 py-1">
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/products?category=${root.slug}&subcategory=${sub.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-xs font-semibold text-[#242620] hover:text-[#78836A] py-1"
                                >
                                  {sub.name}
                                </Link>
                                {hasClassifications && (
                                  <button
                                    onClick={() => toggleMobileSub(sub.slug)}
                                    className="p-1 text-gray-400 hover:text-[#78836A]"
                                  >
                                    <ChevronDown
                                      size={14}
                                      className={`transition-transform ${
                                        isSubExpanded ? 'rotate-180 text-[#78836A]' : ''
                                      }`}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Level 3 Specific Classifications */}
                              {hasClassifications && isSubExpanded && (
                                <div className="pl-3 pt-1 space-y-1 border-l border-gray-200 ml-1">
                                  {classifications.map((item) => (
                                    <Link
                                      key={item._id}
                                      href={`/products?category=${root.slug}&subcategory=${sub.slug}&classification=${item.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block text-[11px] text-[#73756F] hover:text-[#242620] py-1"
                                    >
                                      &bull; {item.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <Link
                          href={`/products?category=${root.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#78836A] pt-2"
                        >
                          <span>Explore All {root.name}</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* All Seating */}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-2 text-sm font-semibold text-[#242620] hover:text-[#78836A] border-b border-gray-100"
              >
                All Seating
              </Link>

              {/* Corporate Solutions */}
              <button
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

              {/* Account Links */}
              <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
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
            <div className="pt-4 border-t border-[#E8E2D9] text-[11px] text-[#73756F] space-y-1">
              <p className="font-semibold text-[#242620]">ErgoCraft Seating Pvt. Ltd.</p>
              <p>Direct Factory Logistics • Bhiwandi, Maharashtra</p>
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
