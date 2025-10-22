"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form data:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6b8a7a] mb-4">
            📬 Get In Touch
          </h1>
          <p className="text-xl text-[#3a4043] max-w-3xl mx-auto">
            Have questions about our platform? Want to partner with us? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
            <h2 className="text-2xl font-bold text-[#3a4043] mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-[#faf9f7]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-[#faf9f7]"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-[#faf9f7]"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-[#faf9f7]"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white font-medium py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
              <h2 className="text-2xl font-bold text-[#3a4043] mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043] mb-1">Email</h3>
                    <p className="text-[#6b8a7a]">hello@talentspectrum.com</p>
                    <p className="text-sm text-[#3a4043]">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043] mb-1">Phone</h3>
                    <p className="text-[#6b8a7a]">+1 (555) 123-4567</p>
                    <p className="text-sm text-[#3a4043]">Monday - Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043] mb-1">Office</h3>
                    <p className="text-[#6b8a7a]">123 Innovation Drive<br />Tech Valley, CA 94043</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
              <h2 className="text-2xl font-bold text-[#3a4043] mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#3a4043] mb-2">How accurate are your talent assessments?</h3>
                  <p className="text-sm text-[#3a4043]">Our assessments are based on validated psychological research and have a 95% accuracy rate in predicting job performance and satisfaction.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#3a4043] mb-2">Is my data secure?</h3>
                  <p className="text-sm text-[#3a4043]">Absolutely. We use enterprise-grade encryption and never share your personal data without explicit consent.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#3a4043] mb-2">Can I retake assessments?</h3>
                  <p className="text-sm text-[#3a4043]">Yes, you can retake assessments after 6 months to track your development and growth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
