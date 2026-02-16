import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Camera, Film, Palette, Megaphone } from "lucide-react";

const memberIcons = [Camera, Film, Palette, Megaphone];
const memberKeys = ["role1", "role2", "role3", "role4"] as const;

const About = () => {
  const { t } = useLang();

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-heading text-5xl md:text-7xl text-gradient">{t.about.title}</h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{t.about.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberKeys.map((key, i) => {
              const Icon = memberIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card border border-border p-8 text-center group hover:border-primary/50 transition-all"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:glow-red transition-all">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl tracking-wider">Member {i + 1}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t.members[key]}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
