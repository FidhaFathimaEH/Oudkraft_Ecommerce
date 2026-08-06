import { useState } from 'react';
import { Layout } from '../components/Layout';
import { businessConfig } from '../config/businessConfig';
import { MessageCircle, Mail, Camera, MapPin } from 'lucide-react';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-8 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Contact</p>
            <h1 className="mt-3 font-serif text-3xl">Let us help you find the right scent</h1>
            <p className="mt-4 max-w-md text-[#efe4d0]">Our concierge team is ready to assist with gifting, fragrance advice and private order requests throughout Abu Dhabi.</p>
            <div className="mt-8 space-y-4 text-[#efe4d0]">
              <div className="flex items-center gap-3"><MessageCircle size={18} className="text-[#C6A15B]" /><span>WhatsApp: {businessConfig.whatsapp}</span></div>
              <div className="flex items-center gap-3"><Mail size={18} className="text-[#C6A15B]" /><span>Email: {businessConfig.email}</span></div>
              <div className="flex items-center gap-3"><Camera size={18} className="text-[#C6A15B]" /><span>Instagram: {businessConfig.instagram}</span></div>
              <div className="flex items-center gap-3"><MapPin size={18} className="text-[#C6A15B]" /><span>Location: {businessConfig.location}</span></div>
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
            <form className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="5" className="w-full rounded-[24px] border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              </div>
              <button type="button" className="rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white">Send message</button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};
