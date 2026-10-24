'use client';

import Link from 'next/link';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

const QUESTIONS = [
  {
    question: 'Can I visit your Bhiwandi factory before placing an order?',
    answer:
      'Yes, absolutely! We warmly welcome both corporate and home buyers to our Bhiwandi Experience Centre (Harihar Compound, Building A/21, Mankoli - Anjurphata Rd, Dapode, Bhiwandi, Maharashtra 421302). You can test all mesh chairs, executive recliners, and handcrafted sofas in person.',
  },
  {
    question: 'How long does Pan-India delivery take?',
    answer:
      'Standard orders are packaged in transit-safe crating and dispatched within 24-48 business hours directly from our Bhiwandi hub. Deliveries to Mumbai, Pune, Bengaluru, Delhi NCR, Hyderabad, and major metros typically arrive within 3 to 7 business days with free doorstep delivery.',
  },
  {
    question: 'What does the 10-Year Factory Warranty cover?',
    answer:
      'Our comprehensive manufacturer warranty covers chair structural frames, heavy-duty synchronized tilt mechanisms, and certified Class-4 hydraulic gas lifts. In the rare event of a defect, our factory dispatches replacement parts with guided support.',
  },
  {
    question: 'Can I order directly on WhatsApp or request custom upholstery?',
    answer:
      'Yes! You can connect with our factory sales lead directly on WhatsApp at +91 97680 01999. We provide bespoke fabric choices, corporate brand colors, high-density foam options, and tailored batch delivery.',
  },
  {
    question: 'Which payment methods are accepted?',
    answer:
      'We accept all major secure payment channels through Razorpay including UPI (Google Pay, PhonePe, Paytm), NetBanking across 50+ banks, Credit/Debit cards, and flexible EMI options.',
  },
  {
    question: 'Do you offer bulk corporate and commercial discounts?',
    answer:
      'Yes. For office setups, co-working spaces, and orders of 10+ units, we offer special factory bulk rates, formal GST invoices, and dedicated project management. Contact us via our Corporate Solutions form or WhatsApp.',
  },
];

export function FaqSection() {
  return (
    <section className="bg-[#F8F8F4] py-16 sm:py-20" aria-labelledby="faq-title">
      <div className="mx-auto grid w-full max-w-[1720px] gap-10 px-4 sm:px-6 lg:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="mb-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#70775D]">FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="faq-title" className="font-serif-luxury text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#252A23] leading-[1.08]">
            <span>Everything you</span>{' '}
            <span className="italic font-serif text-[#78836A] font-light">need to know.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#666A61] font-light">
            Direct factory answers regarding deliveries, warranties, corporate orders, and factory visits.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20have%20a%20question%20about%20your%20seating"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition text-center"
            >
              <MessageCircle size={15} /> <span>WhatsApp: +91 97680 01999</span>
            </a>
            <a
              href="mailto:support@ergocraft.in"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#DFE1D8] text-[#59644E] hover:text-[#252A23] hover:border-[#78836A] transition bg-white text-center"
            >
              <Mail size={15} /> <span>support@ergocraft.in</span>
            </a>
          </div>
        </div>
        <div className="divide-y divide-[#DFE1D8] border-y border-[#DFE1D8]">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-[#292D27] marker:content-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#78836A]">
                {question}<span aria-hidden="true" className="text-xl text-[#78836A] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pt-3 text-sm leading-7 text-[#686D63]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
