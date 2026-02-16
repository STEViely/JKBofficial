import { useLang } from "@/lib/i18n";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="bg-secondary border-t border-border py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="JKB" className="h-8 w-auto" />
            <span className="font-heading text-xl tracking-wider">JKB PRODUCTION</span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">{t.nav.about}</Link>
            <Link to="/portfolio" className="hover:text-primary transition-colors">{t.nav.portfolio}</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">{t.nav.contact}</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 JKB Production. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
