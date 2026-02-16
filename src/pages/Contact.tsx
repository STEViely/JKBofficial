import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
    alert("Message sent!");
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl text-gradient text-center mb-16"
          >
            {t.contact.title}
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-heading text-lg tracking-wider">{t.contact.phone}</h3>
                  <p className="text-muted-foreground">+66 XX XXX XXXX</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-heading text-lg tracking-wider">{t.contact.email}</h3>
                  <p className="text-muted-foreground">contact@jkbproduction.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-heading text-lg tracking-wider">{t.contact.address}</h3>
                  <p className="text-muted-foreground">Bangkok, Thailand</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-heading text-lg tracking-wider mb-4">Social Media</h3>
                <div className="flex gap-4">
                  <a href="https://facebook.com/jkbproduction" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/jkbproduction" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://tiktok.com/@jkbproduction" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all group">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z"/></svg>
                  </a>
                  <a href="https://line.me/ti/p/jkbproduction" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder={t.contact.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
              <input
                type="email"
                placeholder={t.contact.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
              <textarea
                placeholder={t.contact.message}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-heading text-lg tracking-wider uppercase hover:bg-primary/90 transition-colors glow-red"
              >
                {t.contact.send}
              </button>
            </motion.form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
