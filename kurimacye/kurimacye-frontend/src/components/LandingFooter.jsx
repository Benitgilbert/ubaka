import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/axiosInstance";

// Custom inline SVG icons to replace react-icons/fa (reduces bundle size)
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622c0-1.272.759-2.399 1.898-2.825 1.139-.427 2.428-.016 3.197.94l1.378 1.723a3 3 0 0 1-.03 4.1l-1.05 1.05a20.084 20.084 0 0 0 7.376 7.376l1.05-1.05a3 3 0 0 1 4.1-.03l1.723 1.378c.956.765 1.367 2.058.94 3.197-.426 1.139-1.553 1.898-2.825 1.898h-.697c-7.763 0-14.078-6.314-14.078-14.078v-.697Z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

export default function LandingFooter() {
  const { t } = useTranslation();
  const [footerData, setFooterData] = useState({
    footerTagline: 'Your premium destination for quality products. Curated collections, exclusive deals, and exceptional service.',
    contactEmail: 'byiringirobenitg@gmail.com',
    contactPhone: '+250 790 479 815',
    contactAddress: 'Building near Gicumbi distict office (Eudiose Building)',
    siteName: 'Kuri Macye',
    logo: '/logo.png',
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' }
  });
  const [hasPrintingServices, setHasPrintingServices] = useState(false);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await api.get('/site-settings/public');
        const data = res.data; // Axios puts the response body in .data
        if (data.success && data.data) {
          setFooterData(prev => ({
            ...prev,
            footerTagline: data.data.footerTagline || prev.footerTagline,
            socialLinks: data.data.socialLinks || prev.socialLinks
            // Ignored backend overrides for siteName, logo, and contact info to enforce Kuri Macye branding
          }));
        }
      } catch (error) {
      }
    };
    fetchFooterSettings();
  }, []);

  useEffect(() => {
    const checkPrintingServices = async () => {
      try {
        const res = await api.get('/products?tags=printing_service');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setHasPrintingServices(res.data.data.length > 0);
        }
      } catch (err) {
      }
    };
    checkPrintingServices();
  }, []);

  const socialIcons = [
    { key: 'facebook', Icon: FacebookIcon, url: footerData.socialLinks.facebook },
    { key: 'twitter', Icon: TwitterIcon, url: footerData.socialLinks.twitter },
    { key: 'instagram', Icon: InstagramIcon, url: footerData.socialLinks.instagram },
    { key: 'linkedin', Icon: LinkedinIcon, url: footerData.socialLinks.linkedin }
  ];

  return (
    <footer className="bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-cream-300 border-t border-cream-200 dark:border-charcoal-700 transition-colors duration-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center mb-6 no-underline">
              <img src="/logo.svg" alt={footerData.siteName || "Kuri Macye"} width="167" height="40" className="h-10 w-auto object-contain" />
            </Link>

            <p className="text-charcoal-500 dark:text-charcoal-400 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialIcons.map(({ key, Icon, url }) => (
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 rounded-lg flex items-center justify-center text-charcoal-500 dark:text-charcoal-400 hover:text-white dark:hover:text-white transition-all duration-300"
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    key={key}
                    className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-charcoal-400 cursor-default"
                  >
                    <Icon />
                  </span>
                )
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.shop')}</h3>
            <ul className="space-y-3 p-0 list-none">
              {[
                { label: t('footer.all_products'), to: '/shop' },
                hasPrintingServices && { label: t('footer.print_portal'), to: '/print-portal' },
                { label: t('footer.new_arrivals'), to: '/shop?category=new' },
                { label: t('footer.best_sellers'), to: '/shop?sort=popular' },
                { label: t('footer.deals'), to: '/daily-deals' },
                { label: t('footer.gift_cards'), to: '/gift-cards' }
              ].filter(Boolean).map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline text-inherit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.company')}</h3>
            <ul className="space-y-3 p-0 list-none">
              {[
                { label: t('footer.about_us'), to: '/about' },
                { label: t('footer.blog'), to: '/blog' },
                { label: t('footer.contact'), to: '/contact' },
                { label: t('footer.faq'), to: '/faq' },
                { label: t('footer.careers'), to: '/careers' },
                { label: "Become a Seller", to: '/become-seller' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline text-inherit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.get_in_touch')}</h3>
            <ul className="space-y-4 p-0 list-none">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400">
                  <EnvelopeIcon />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{footerData.contactEmail}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400">
                  <PhoneIcon />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{footerData.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400 shrink-0">
                  <MapPinIcon />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{t('footer.address')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream-200 dark:border-charcoal-700">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">
              © {new Date().getFullYear()} Kuri Macye. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.terms')}
              </Link>
              <Link to="/cookies" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

