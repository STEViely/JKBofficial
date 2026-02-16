import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Heart, Users, Package, PartyPopper, Building2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import Layout from "@/components/Layout";

const categoryIcons = [
  { key: "wedding" as const, icon: Heart },
  { key: "ordination" as const, icon: Users },
  { key: "photobooth" as const, icon: Camera },
  { key: "product" as const, icon: Package },
  { key: "event" as const, icon: PartyPopper },
  { key: "corporate" as const, icon: Building2 },
];

const Index = () => {
  const { t } = useLang();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="font-heading text-7xl md:text-9xl tracking-wider text-gradient leading-none">
            {t.hero.title}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            {t.hero.subtitle}
          </p>
          <Link
            to="/portfolio"
            className="inline-block mt-8 px-8 py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors glow-red"
          >
            {t.hero.cta}
          </Link>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl text-center mb-12 line-accent mx-auto w-fit"
          >
            {t.categories.title}
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categoryIcons.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-card border border-border p-8 flex flex-col items-center gap-4 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="w-10 h-10 text-primary relative z-10" />
                <span className="font-heading text-xl tracking-wider relative z-10">
                  {t.categories[key]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
