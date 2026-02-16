import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useState } from "react";

type Tab = "photo" | "video";
type Category = "wedding" | "ordination" | "event" | "product";

const categories: Category[] = ["wedding", "ordination", "event", "product"];

const Portfolio = () => {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("photo");
  const [selectedCat, setSelectedCat] = useState<Category | "all">("all");

  const filtered = selectedCat === "all" ? categories : categories.filter(c => c === selectedCat);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl text-gradient text-center mb-8"
          >
            {t.portfolio.title}
          </motion.h1>

          <div className="flex justify-center gap-4 mb-8">
            {(["photo", "video"] as Tab[]).map((v) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className={`px-6 py-2 font-heading text-lg tracking-wider uppercase border transition-all ${
                  tab === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {v === "photo" ? t.portfolio.photo : t.portfolio.video}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-4 py-1 text-sm uppercase tracking-wider border transition-all ${
                selectedCat === "all" ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.all}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1 text-sm uppercase tracking-wider border transition-all ${
                  selectedCat === cat ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.portfolioCategories[cat]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat, i) => (
              <motion.div
                key={`${cat}-${tab}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card border border-border overflow-hidden hover:border-primary/50 transition-all"
              >
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    {tab === "photo" ? "📷" : "🎬"} {t.portfolioCategories[cat]}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-xl tracking-wider">
                    {t.portfolioCategories[cat]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tab === "photo" ? t.portfolio.photo : t.portfolio.video}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
