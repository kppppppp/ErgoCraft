'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import leatherChairImg from '../../public/hero-img/leather_char.png';
import meshChairImg from '../../public/hero-img/Mesh.png';
import sofaImg from '../../public/hero-img/sofaa.png';
import softSittingImg from '../../public/hero-img/soft_sitting.png';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  Smartphone,
  Headset,
} from 'lucide-react';

export interface HeroSlide {
  id: string;
  categoryTag: string;
  edition: string;
  editorialLabel: string;
  headlineRoman: string;
  headlineItalic: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  image: string | StaticImageData;
  alt: string;
  objectPositionDesktop: string;
  objectPositionMobile: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'flagship-collection',
    categoryTag: 'All Seating',
    edition: 'EDITION 01',
    editorialLabel: 'THE ERGOCRAFT COLLECTION',
    headlineRoman: 'Comfort,',
    headlineItalic: 'composed beautifully.',
    description: 'Seating designed around the spaces you live, work, and gather in.',
    primaryCtaText: 'Explore the Collection',
    primaryCtaHref: '/products',
    secondaryCtaText: 'Discover Our Design Philosophy',
    secondaryCtaHref: '#corporate-solutions',
    image: leatherChairImg,
    alt: 'ErgoCraft Seating Collection - Comfort, composed beautifully',
    objectPositionDesktop: '80% center',
    objectPositionMobile: '85% center',
  },
  {
    id: 'mesh-chairs',
    categoryTag: 'Mesh Chairs',
    edition: 'EDITION 02',
    editorialLabel: 'ACTIVE WORKSPACE ERGONOMICS',
    headlineRoman: 'Precision engineering,',
    headlineItalic: 'effortless posture.',
    description: 'Calibrated elastomeric mesh with active dynamic lumbar support for focused days.',
    primaryCtaText: 'Shop Mesh Chairs',
    primaryCtaHref: '/products?category=office-chairs&subcategory=mesh-chairs',
    secondaryCtaText: 'View Workstation Line',
    secondaryCtaHref: '/products?category=office-chairs&subcategory=workstation-chairs',
    image: meshChairImg,
    alt: 'ErgoCraft Ergonomic Mesh Workstation Chairs',
    objectPositionDesktop: '78% center',
    objectPositionMobile: '82% center',
  },
  {
    id: 'sofas',
    categoryTag: 'Sofas',
    edition: 'EDITION 03',
    editorialLabel: 'HERITAGE & CONTEMPORARY LIVING',
    headlineRoman: 'Curated silhouettes,',
    headlineItalic: 'tailored for living.',
    description: 'Handcrafted luxury sofas built with kiln-dried solid hardwood frames and bespoke upholstery.',
    primaryCtaText: 'Explore Handcrafted Sofas',
    primaryCtaHref: '/products?category=sofas',
    secondaryCtaText: 'Living Room Configurations',
    secondaryCtaHref: '/products?category=sofas',
    image: sofaImg,
    alt: 'ErgoCraft Contemporary Living Room Sectional Sofas',
    objectPositionDesktop: '75% center',
    objectPositionMobile: '80% center',
  },
  {
    id: 'soft-seating',
    categoryTag: 'Soft Seating',
    edition: 'EDITION 04',
    editorialLabel: 'SCULPTURAL ACCENTS & LOUNGE',
    headlineRoman: 'Sculptural forms,',
    headlineItalic: 'quiet intimacy.',
    description: 'Curved velvet accent armchairs, tailored wingbacks, and architectural cafe stools.',
    primaryCtaText: 'Explore Soft Seating',
    primaryCtaHref: '/products?category=soft-seating',
    secondaryCtaText: 'Browse Cafe Stools',
    secondaryCtaHref: '/products?category=soft-seating&subcategory=cafe-chairs',
    image: softSittingImg,
    alt: 'ErgoCraft Soft Seating, Accent Armchairs and Cafe Stools',
    objectPositionDesktop: '82% center',
    objectPositionMobile: '85% center',
  },
];

const AUTOPLAY_DURATION = 6500; // 6.5 seconds per slide
const TRANSITION_DURATION = 700; // 700ms smooth transition

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const isAnimatingRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const initialMotionTimer = window.setTimeout(() => setPrefersReducedMotion(mediaQuery.matches), 0);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => {
      window.clearTimeout(initialMotionTimer);
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // Safe slide navigation with animation locking to prevent overlapping rapid clicks
  const goToSlide = useCallback((index: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex(index);
    setProgress(0);
    lastTickTimeRef.current = Date.now();

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, TRANSITION_DURATION);
  }, []);

  const nextSlide = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
    lastTickTimeRef.current = Date.now();

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, TRANSITION_DURATION);
  }, []);

  const prevSlide = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
    lastTickTimeRef.current = Date.now();

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, TRANSITION_DURATION);
  }, []);

  // Autoplay timer with precise progress ticker
  useEffect(() => {
    if (isPaused) {
      lastTickTimeRef.current = Date.now();
      return;
    }

    lastTickTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      setProgress((prev) => {
        const nextProgress = prev + (delta / AUTOPLAY_DURATION) * 100;
        if (nextProgress >= 100) {
          nextSlide();
          return 0;
        }
        return nextProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only react if hero container is within viewport or focused
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inViewport) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartXRef.current - touchEndX;
    const deltaY = touchStartYRef.current - (touchEndY || 0);

    // Only swipe if horizontal intent is stronger than vertical scroll
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setIsPaused(false);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#0C1512] text-white select-none focus:outline-none"
      style={{ height: 'clamp(580px, 72vh, 680px)', minHeight: 'clamp(580px, 72vh, 680px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="ErgoCraft Featured Seating Slider"
      tabIndex={0}
    >
      {/* Horizontal Carousel Track */}
      <div
        className={`flex h-full w-full ${
          prefersReducedMotion
            ? 'transition-none'
            : 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'
        }`}
        style={{
          width: `${HERO_SLIDES.length * 100}%`,
          transform: `translateX(-${(currentIndex * 100) / HERO_SLIDES.length}%)`,
        }}
      >
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={slide.id}
              className="relative h-full flex-shrink-0"
              style={{ width: `${100 / HERO_SLIDES.length}%` }}
              aria-hidden={!isActive}
            >
              {/* Background Image Container with cover & subject positioning */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  quality={90}
                  className="object-cover transition-opacity duration-500"
                  style={{
                    objectPosition: slide.objectPositionDesktop,
                  }}
                />

                {/* Subtle dark gradient overlay from left toward right for maximum text contrast */}
                {/* Desktop: Strong on left, gentle in center, transparent on furniture right */}
                <div
                  className="absolute inset-0 hidden sm:block pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(10,18,15,0.92) 0%, rgba(10,18,15,0.84) 34%, rgba(10,18,15,0.50) 58%, rgba(10,18,15,0.14) 78%, transparent 100%)',
                  }}
                />

                {/* Mobile: Gradient from bottom and left to keep headline readable over furniture */}
                <div
                  className="absolute inset-0 sm:hidden pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,18,15,0.25) 0%, rgba(10,18,15,0.65) 45%, rgba(10,18,15,0.92) 100%)',
                  }}
                />

                {/* Very subtle overall dark tint to harmonize photography */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>

              {/* Text & Action Content Block (Left ~45% on desktop) */}
              <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="w-full sm:max-w-lg lg:max-w-xl xl:max-w-[580px] pt-8 pb-20 sm:pb-0 sm:pt-4">
                  {/* Understated collection identifier & fine warm gold rule */}
                  <div
                    className={`flex items-center gap-3.5 mb-5 sm:mb-6 transition-all duration-700 delay-75 ${
                      isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#C5A880] uppercase font-bold">
                      {slide.edition}
                    </span>
                    <span className="w-8 sm:w-12 h-[1px] bg-[#C5A880]/70" />
                    <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.22em] text-white/80 uppercase">
                      {slide.editorialLabel}
                    </span>
                  </div>

                  {/* Expressive Two-Line Editorial Headline with Roman + Italic Contrast */}
                  <h1
                    className={`font-serif-luxury text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[68px] font-normal text-white tracking-tight leading-[1.04] mb-4 sm:mb-5 transition-all duration-700 delay-150 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    <span className="block font-normal">{slide.headlineRoman}</span>
                    <span className="block italic font-serif text-[#E8D8C3] font-light mt-0.5 sm:mt-1">
                      {slide.headlineItalic}
                    </span>
                  </h1>

                  {/* Concise Supporting Line with restrained width */}
                  <p
                    className={`text-sm sm:text-base md:text-[17px] text-white/80 font-light leading-relaxed mb-7 sm:mb-9 max-w-md transition-all duration-700 delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.description}
                  </p>

                  {/* Action Group: Strong Primary CTA + Quieter Secondary Link */}
                  <div
                    className={`flex flex-wrap items-center gap-4 sm:gap-6 transition-all duration-700 delay-250 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <Link
                      href={slide.primaryCtaHref}
                      className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#78836A] hover:bg-[#59644E] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2.5 shadow-xl shadow-black/35 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer group"
                    >
                      <span>{slide.primaryCtaText}</span>
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1.5 transition-transform duration-300"
                      />
                    </Link>

                    {slide.secondaryCtaText && slide.secondaryCtaHref && (
                      <Link
                        href={slide.secondaryCtaHref}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/85 hover:text-[#C5A880] font-medium tracking-wide transition-colors py-2 group cursor-pointer"
                      >
                        <span className="border-b border-white/30 group-hover:border-[#C5A880] pb-0.5 transition-colors">
                          {slide.secondaryCtaText}
                        </span>
                        <ArrowRight size={13} className="text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>

                  {/* Refined Integrated Slide Indicator: 01 / 04 */}
                  <div
                    className={`flex items-center gap-3 pt-6 sm:pt-8 text-xs font-mono tracking-widest text-white/50 transition-all duration-700 delay-300 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <span className="text-[#C5A880] font-bold">0{index + 1}</span>
                    <span className="w-10 sm:w-14 h-[1px] bg-white/20 relative overflow-hidden">
                      {isActive && (
                        <span
                          className="absolute inset-y-0 left-0 bg-[#C5A880] transition-all duration-75 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </span>
                    <span>0{HERO_SLIDES.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow Controls: Left / Right (Shifted up to top-[40%] to ensure Next button is completely clear of floating buttons) */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 sm:left-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-lg items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 sm:right-6 top-[40%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-lg items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105"
      >
        <ChevronRight
          size={20}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>

      {/* Bottom Category Slide Indicators with Smooth Progress Fill */}
      <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`group relative text-left py-1.5 px-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-black/60 border-[#C5A880]/60 text-white shadow-md'
                      : 'bg-black/25 border-white/10 text-white/60 hover:text-white hover:border-white/25'
                  }`}
                  aria-label={`Slide ${index + 1}: ${slide.categoryTag}`}
                >
                  <span className="text-[10px] font-mono font-bold text-[#C5A880]">
                    0{index + 1}
                  </span>
                  <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
                    {slide.categoryTag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Trust Pill on Desktop Right */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/12">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#C5A880]" />
              <span>Order updates in your account</span>
            </span>
            <span className="text-white/25">•</span>
            <span className="flex items-center gap-1.5">
              <Truck size={13} className="text-[#C5A880]" />
              <span>Secure online checkout</span>
            </span>
            <span className="text-white/25">•</span>
            <span className="flex items-center gap-1.5">
              <Award size={13} className="text-[#C5A880]" />
              <span>Current prices at checkout</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating Quick Action Buttons: Buy On Phone & Need Help? (Repositioned to bottom-24 to avoid obscuring Next Slide button) */}
      <aside
        aria-label="Quick order and support actions"
        className="absolute right-0 bottom-24 sm:bottom-28 z-30 flex flex-col gap-2 select-none"
      >
        {/* Card 1: Buy On Phone */}
        <a
          href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20would%20like%20to%20order%20furniture%20on%20phone"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white/95 hover:bg-white text-center py-2.5 px-2.5 sm:py-3 sm:px-3 w-[70px] sm:w-[78px] rounded-l-2xl shadow-xl hover:shadow-2xl border-l border-y border-black/10 hover:border-black/20 hover:-translate-x-1 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          aria-label="Buy On Phone via WhatsApp at +91 97680 01999"
        >
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0D766E] group-hover:scale-110 transition-transform">
            <Smartphone size={18} strokeWidth={2.2} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#20251F] leading-tight mt-1.5">
            Buy On
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#0D766E] leading-tight">
            Phone
          </span>
        </a>

        {/* Card 2: Need Help? */}
        <a
          href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20need%20help%20choosing%20the%20right%20seating"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white/95 hover:bg-white text-center py-2.5 px-2.5 sm:py-3 sm:px-3 w-[70px] sm:w-[78px] rounded-l-2xl shadow-xl hover:shadow-2xl border-l border-y border-black/10 hover:border-black/20 hover:-translate-x-1 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          aria-label="Need Help? Contact WhatsApp Support at +91 97680 01999"
        >
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0D766E] group-hover:scale-110 transition-transform">
            <Headset size={18} strokeWidth={2.2} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#20251F] leading-tight mt-1.5">
            Need
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#0D766E] leading-tight">
            Help?
          </span>
        </a>
      </aside>

      {/* Edge-to-edge Subtle Progress Line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-30">
        <div
          className="h-full bg-[#78836A] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
};
