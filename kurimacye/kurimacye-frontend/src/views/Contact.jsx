import { useState, useEffect } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/site-settings/public`);
        const data = await res.json();
        if (data.success) setSettings(data.data);
      } catch (err) { }
    };
    fetchSettings();
  }, []);

  const mapSource = settings?.googleMapsQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(settings.googleMapsQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31901.07604313465!2d30.0467549!3d-1.6166549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc63979435b699%3A0x7d0a64e1c72f9e4b!2sGicumbi%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1714900000000!5m2!1sen!2sus";

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main>
        {/* Hero Section — compact */}
        <section className="relative py-10 md:py-14 overflow-hidden bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 left-8 w-52 h-52 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-52 h-52 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white mb-3 tracking-tight">
              {t("contact.hero_title")}
              <span className="text-terracotta-500 dark:text-terracotta-400">{t("contact.hero_highlight")}</span>
            </h1>
            <p className="text-base text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              {settings?.tagline || t("contact.hero_desc")}
            </p>
          </div>
        </section>

        {/* Form + Info Section — tighter padding */}
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Form Card */}
              <div className="lg:col-span-2 bg-white dark:bg-charcoal-800 rounded-2xl p-6 md:p-8 shadow-sm border border-cream-200 dark:border-charcoal-700">
                <h2 className="text-2xl font-black text-charcoal-800 dark:text-white mb-6">
                  {t("contact.form_title")}
                </h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-widest pl-1">
                        {t("contact.label_name")}
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="w-full bg-cream-50 dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl py-2.5 px-4 text-charcoal-800 dark:text-white focus:ring-2 focus:ring-terracotta-400 outline-none transition-all placeholder:text-charcoal-400 text-sm"
                        placeholder={t("contact.placeholder_name")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-widest pl-1">
                        {t("contact.label_email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="w-full bg-cream-50 dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl py-2.5 px-4 text-charcoal-800 dark:text-white focus:ring-2 focus:ring-terracotta-400 outline-none transition-all placeholder:text-charcoal-400 text-sm"
                        placeholder={t("contact.placeholder_email")}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="subject" className="text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-widest pl-1">
                      {t("contact.label_subject")}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      className="w-full bg-cream-50 dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl py-2.5 px-4 text-charcoal-800 dark:text-white focus:ring-2 focus:ring-terracotta-400 outline-none transition-all placeholder:text-charcoal-400 text-sm"
                      placeholder={t("contact.placeholder_subject")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="message" className="text-xs font-bold text-charcoal-600 dark:text-charcoal-300 uppercase tracking-widest pl-1">
                      {t("contact.label_message")}
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows="5"
                      className="w-full bg-cream-50 dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl py-2.5 px-4 text-charcoal-800 dark:text-white focus:ring-2 focus:ring-terracotta-400 outline-none transition-all placeholder:text-charcoal-400 resize-none text-sm"
                      placeholder={t("contact.placeholder_message")}
                    ></textarea>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-md shadow-terracotta-500/20 active:scale-95"
                    >
                      {t("contact.btn_send")}
                    </button>
                  </div>
                </form>
              </div>

              {/* Info Card */}
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 md:p-8 shadow-sm border border-cream-200 dark:border-charcoal-700 h-fit">
                <h2 className="text-2xl font-black text-charcoal-800 dark:text-white mb-6">
                  {t("contact.info_title")}
                </h2>
                <div className="space-y-6">

                  {/* Address */}
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-900/10 rounded-xl flex items-center justify-center text-terracotta-500 dark:text-terracotta-400 shrink-0 group-hover:scale-110 transition-transform">
                      <FaMapMarkerAlt className="text-base" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-widest mb-1">
                        {t("contact.label_address")}
                      </h3>
                      <p className="text-sm text-charcoal-700 dark:text-charcoal-300 font-medium leading-relaxed">
                        {settings?.address || "Building near Gicumbi district office (Eudiose Building)"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 bg-sage-50 dark:bg-sage-900/10 rounded-xl flex items-center justify-center text-sage-600 dark:text-sage-400 shrink-0 group-hover:scale-110 transition-transform">
                      <FaPhoneAlt className="text-base" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-widest mb-1">
                        {t("contact.label_phone")}
                      </h3>
                      <p className="text-sm text-charcoal-700 dark:text-charcoal-300 font-medium">
                        {settings?.contactPhone || "+250 790 479 815"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 bg-sand-50 dark:bg-sand-900/10 rounded-xl flex items-center justify-center text-sand-600 dark:text-sand-400 shrink-0 group-hover:scale-110 transition-transform">
                      <FaEnvelope className="text-base" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-widest mb-1">
                        {t("contact.label_email_info")}
                      </h3>
                      <p className="text-sm text-charcoal-700 dark:text-charcoal-300 font-medium">
                        <a
                          href={`mailto:${settings?.contactEmail || "byiringirobenitg@gmail.com"}`}
                          className="hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors"
                        >
                          {settings?.contactEmail || "byiringirobenitg@gmail.com"}
                        </a>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section — shorter */}
        <section className="h-72 w-full bg-cream-100 dark:bg-charcoal-800 grayscale dark:grayscale-0 hover:grayscale-0 transition-all duration-700">
          <iframe
            src={mapSource}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
