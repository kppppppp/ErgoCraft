'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ExternalLink, CheckCircle2, MessageCircle, Building2 } from 'lucide-react';

interface GoogleReview {
  id: string;
  author: string;
  avatarBg: string;
  avatarColor: string;
  reviewMeta: string;
  timeAgo: string;
  rating: number;
  text: string;
  ownerReply?: {
    author: string;
    timeAgo: string;
    text: string;
  };
}

const GOOGLE_MAPS_URL =
  'https://www.google.com/search?q=ergocraft+seating+pvt.+ltd.+bhiwandi+address&ludocid=3661903996944538718';

const REVIEWS: GoogleReview[] = [
  {
    id: 'review-1',
    author: 'Aarna Lugani',
    avatarBg: 'bg-purple-100',
    avatarColor: 'text-purple-700',
    reviewMeta: '3 reviews · 2 photos',
    timeAgo: 'a month ago',
    rating: 5,
    text: 'Good variety of products and quality is top notch, deliverers at time aswell.',
    ownerReply: {
      author: 'Ergocraft Seating Pvt. Ltd. (owner)',
      timeAgo: 'a month ago',
      text: 'Thank you, Aarna. We are delighted that you loved our sofa and chairs',
    },
  },
  {
    id: 'review-2',
    author: 'Kejal Dhadave',
    avatarBg: 'bg-rose-100',
    avatarColor: 'text-rose-700',
    reviewMeta: '2 reviews',
    timeAgo: '2 months ago',
    rating: 5,
    text: 'Amazing experience with Ergocraft. The staff is polite, helpful and very responsive. Delivered the chairs in less than 24 hours. The chairs are of great quality and comfortable.',
  },
  {
    id: 'review-3',
    author: 'Jagadish Vishwakarma',
    avatarBg: 'bg-blue-100',
    avatarColor: 'text-blue-700',
    reviewMeta: 'Verified Customer',
    timeAgo: '3 months ago',
    rating: 5,
    text: 'Very good quality office chairs and fast delivery in Mumbai & Thane region. Directly from factory so pricing is very reasonable.',
  },
  {
    id: 'review-4',
    author: 'Saddma Shah',
    avatarBg: 'bg-amber-100',
    avatarColor: 'text-amber-700',
    reviewMeta: 'Local Guide',
    timeAgo: '3 months ago',
    rating: 5,
    text: 'Visited their Bhiwandi manufacturing unit. Impressed by the infrastructure and finish of the ergonomic chairs. Highly recommended for corporate & home office setups.',
  },
  {
    id: 'review-5',
    author: 'Vijay Patel',
    avatarBg: 'bg-emerald-100',
    avatarColor: 'text-emerald-700',
    reviewMeta: 'Commercial Buyer',
    timeAgo: '4 months ago',
    rating: 5,
    text: 'Prompt service and customisation options. Got cafe chairs and bar stools for our new restaurant. Sturdy build and elegant finish.',
  },
];

export const GoogleReviewsSection: React.FC = () => {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#E7E5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Google Rating Badge & Trust Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F4EC] border border-[#E7E5DC] mb-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-semibold text-[#20251F] tracking-wide">
                Google Customer Reviews
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#1F241F] tracking-tight leading-tight">
              Loved by Architects, <br className="hidden sm:inline" />
              <span className="italic font-serif text-[#78836A]">Founders & Homeowners.</span>
            </h2>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-[#FBBC05]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#FBBC05" />
                ))}
              </div>
              <span className="text-sm font-bold text-[#1F241F]">4.9 out of 5</span>
              <span className="text-xs text-[#71736D]">• Based on verified Google & Factory reviews</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5D2C7] hover:border-[#1F241F] bg-white text-xs sm:text-sm font-semibold text-[#1F241F] hover:shadow-sm transition-all"
            >
              <span>View Google Reviews</span>
              <ExternalLink size={14} />
            </a>
            <a
              href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20would%20like%20to%20visit%20your%20Bhiwandi%20factory%20experience%20centre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#FAF9F5] border border-[#E9E7DF] hover:border-[#78836A]/50 hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Author Info & Verified Tag */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${review.avatarBg} ${review.avatarColor}`}
                    >
                      {review.author[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1F241F] flex items-center gap-1.5">
                        <span>{review.author}</span>
                        <CheckCircle2 size={13} className="text-[#34A853]" />
                      </h3>
                      <p className="text-[11px] text-[#71736D]">{review.reviewMeta}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#9CA3AF] shrink-0 font-medium">
                    {review.timeAgo}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3 text-[#FBBC05]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#FBBC05" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-[#374151] leading-relaxed italic font-sans">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Owner Response Sub-block if available */}
              {review.ownerReply && (
                <div className="mt-5 pt-4 border-t border-[#E5E3D8] bg-white/70 p-3.5 rounded-xl">
                  <p className="text-[11px] font-bold text-[#1F241F] flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#78836A]" />
                    <span>Response from {review.ownerReply.author}</span>
                  </p>
                  <p className="text-[11px] text-[#555952] leading-relaxed">
                    &ldquo;{review.ownerReply.text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* 6th Card: Factory Address & Experience Centre Visit Invite */}
          <div className="p-6 rounded-2xl bg-[#1C2520] text-white flex flex-col justify-between shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-[#C5A880]">
                <Building2 size={20} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880] font-bold">
                FACTORY & EXPERIENCE CENTRE
              </span>
              <h3 className="text-base font-bold text-white mt-1 mb-2">
                Visit Our Manufacturing Facility
              </h3>
              <p className="text-xs text-white/75 leading-relaxed mb-4">
                Test 50+ ergonomic chairs, select custom leatherette & fabric swatches directly from our factory floor.
              </p>
              <div className="flex items-start gap-2.5 text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10">
                <MapPin size={16} className="text-[#C5A880] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  1st Floor Gala No, Harihar Compound, Building No, A/21, Mankoli - Anjurphata Rd, near Gajanan Petrol Pump, Dapode, Bhiwandi, Maharashtra 421302
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] hover:text-white transition-colors"
              >
                <span>Get Directions on Maps</span>
                <ExternalLink size={13} />
              </a>
              <span className="text-[11px] text-white/50">Mon–Sat: 10AM–7PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
