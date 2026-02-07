import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  topic: '',
  message: ''
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePayload = () => {
    if (!formData.name.trim()) {
      toast.error('Please share your name so we know how to address you.');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please add a valid email address.');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Let us know how we can help you.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validatePayload()) {
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success('Thank you! Our care team will reach out within one business day.');
      setFormData(initialFormState);
    } catch (error) {
      toast.error('We could not send your message. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-100" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm text-sm font-medium text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span>We are here for you</span>
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-display font-semibold text-slate-900 leading-tight">
              Let us support your skin health journey
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Book a consultation, ask about personalised treatment plans, or talk to our care team. We respond to every message within one business day.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Doctor-led guidance</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
                <Clock className="h-5 w-5 text-emerald-500" />
                <span>Response under 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-100/50 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-900">Tell us about your concern</h2>
            <p className="mt-2 text-slate-600 text-sm">
              Complete the form and one of our specialists will schedule a detailed consult tailored to your skin goals.
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Aarohi Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@skincareai.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
                    What do you want to discuss?
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Select a topic</option>
                    <option value="consultation">Book a doctor consultation</option>
                    <option value="plan">Understand treatment plans</option>
                    <option value="products">Ask about products</option>
                    <option value="partnerships">Partnership opportunities</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Share details about your skin history, goals, or questions."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70"
              >
                {submitting ? 'Sending...' : 'Send Message'}
                {!submitting && <MessageCircle className="h-5 w-5" />}
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg shadow-emerald-100 border border-emerald-100/50 p-8 space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">Contact details</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-medium text-slate-800">Talk to our care guides</p>
                    <a href="tel:+919876543210" className="text-emerald-600 hover:underline font-semibold">
                      +91 98765 43210
                    </a>
                    <p className="text-xs text-slate-500 mt-1">Mon - Sat, 9:00 AM to 8:00 PM IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-medium text-slate-800">Email support</p>
                    <a href="mailto:care@skincareai.com" className="text-emerald-600 hover:underline font-semibold">
                      care@skincareai.com
                    </a>
                    <p className="text-xs text-slate-500 mt-1">We reply within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="font-medium text-slate-800">Clinic HQ</p>
                    <p>WeWork Prestige Central<br />Infantry Road, Bengaluru 560001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold">Prefer WhatsApp?</h3>
              <p className="mt-2 text-sm text-emerald-50 leading-relaxed">
                Chat with our care concierge for quick follow-ups or routine checks.
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Start WhatsApp chat</span>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Contact;
