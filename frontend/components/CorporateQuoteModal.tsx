'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Phone, Mail, User, Layers, ArrowRight } from 'lucide-react';

interface CorporateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledProduct?: string;
}

export const CorporateQuoteModal: React.FC<CorporateQuoteModalProps> = ({
  isOpen,
  onClose,
  prefilledProduct = '',
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    quantity: '25-50 units',
    category: prefilledProduct || 'Office Chairs & Workstations',
    projectCity: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API submission with polite confirmation
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#13231D]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E8E5DE] shadow-2xl p-6 sm:p-8 z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#73756F] hover:text-[#242620] hover:bg-[#EFEEE8] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#242620]">
              Corporate Enquiry Received
            </h3>
            <p className="text-sm text-[#73756F] max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-[#242620]">{formData.contactPerson}</span>.
              Our commercial furniture specialists will review your project requirements for{' '}
              <span className="font-semibold text-[#242620]">{formData.companyName}</span> and share a
              customized quotation with CAD space planning assistance within 4 business hours.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg bg-[#13231D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#78836A] transition cursor-pointer"
              >
                Back to Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#78836A] block mb-1">
                B2B & Institutional Procurement
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-[#242620]">
                Request a Corporate Furniture Quote
              </h3>
              <p className="text-xs text-[#73756F] mt-1">
                Direct factory pricing, custom upholstery options, and pan-India project installation support.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Company / Organization *
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Infosys Ltd. / Studio Arc"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Contact Person Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="e.g. Rajesh Kulkarni"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rajesh@company.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Estimated Quantity
                  </label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white cursor-pointer"
                  >
                    <option value="10-25 units">10 - 25 units</option>
                    <option value="25-50 units">25 - 50 units</option>
                    <option value="50-100 units">50 - 100 units</option>
                    <option value="100+ units">100+ units (Bulk Fleet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Project City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.projectCity}
                    onChange={(e) => setFormData({ ...formData, projectCity: e.target.value })}
                    placeholder="e.g. Mumbai, Pune, Bangalore"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242620] mb-1">
                  Primary Furniture Requirement
                </label>
                <div className="relative">
                  <Layers size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Ergonomic Mesh Task Chairs & Conference Seating"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242620] mb-1">
                  Additional Notes / Floor Plan Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Specify timeline, custom fabric colors, or delivery requirements..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#73756F]">
                  Guaranteed response within 4 hours
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-[#13231D] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#78836A] transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
