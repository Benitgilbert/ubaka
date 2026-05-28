import { useEffect, useState } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { Link } from "react-router-dom";
import { FaBullseye, FaLightbulb, FaHandshake, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/auth/team`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTeamMembers(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return '/images/default-avatar.png'; // Fallback image
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    if (path.startsWith('/uploads/')) return `${baseUrl}${path}`;
    return process.env.PUBLIC_URL + path;
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main>
        <section className="relative py-12 md:py-16 overflow-hidden bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cream-200 dark:bg-charcoal-700/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-charcoal-800 dark:text-white mb-4 tracking-tight">
              {t("about.hero_title")}<span className="text-terracotta-500 dark:text-terracotta-400">{t("about.hero_highlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal-600 dark:text-charcoal-400 max-w-3xl mx-auto leading-relaxed">
              {t("about.hero_desc")}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white dark:bg-charcoal-800">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-terracotta-50 dark:bg-terracotta-900/10 rounded-full text-terracotta-600 dark:text-terracotta-400 font-bold tracking-widest uppercase text-xs">
                  {t("about.story_badge")}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white leading-tight">{t("about.story_title")}</h2>
                <p className="text-base text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
                  {t("about.story_desc1")}
                </p>
                <p className="text-base text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
                  {t("about.story_desc2")}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-terracotta-500/20 dark:bg-terracotta-400/10 rounded-3xl blur-2xl group-hover:bg-terracotta-600/30 transition-all duration-500"></div>
                <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-xl">
                  <img src={process.env.PUBLIC_URL + '/images/about-us-story.jpg'} alt="Kuri Macye Workshop" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-cream-100 dark:bg-charcoal-900">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="inline-block px-3 py-1 bg-sage-50 dark:bg-sage-900/10 rounded-full text-sage-600 dark:text-sage-400 font-bold tracking-widest uppercase text-xs mb-4">
              {t("about.values_badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white mb-10">{t("about.values_title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-charcoal-800 p-6 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-sand-50 dark:bg-sand-900/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-sand-500 group-hover:scale-110 transition-transform">
                  <FaLightbulb className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-800 dark:text-white mb-2">{t("about.values_list.innovation_title")}</h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 leading-relaxed">{t("about.values_list.innovation_desc")}</p>
              </div>
              <div className="bg-white dark:bg-charcoal-800 p-6 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-sage-50 dark:bg-sage-900/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-sage-500 group-hover:scale-110 transition-transform">
                  <FaBullseye className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-800 dark:text-white mb-2">{t("about.values_list.quality_title")}</h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 leading-relaxed">{t("about.values_list.quality_desc")}</p>
              </div>
              <div className="bg-white dark:bg-charcoal-800 p-6 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-terracotta-500 group-hover:scale-110 transition-transform">
                  <FaHandshake className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-800 dark:text-white mb-2">{t("about.values_list.partnership_title")}</h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 leading-relaxed">{t("about.values_list.partnership_desc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white dark:bg-charcoal-800">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 bg-terracotta-50 dark:bg-terracotta-900/10 rounded-full text-terracotta-600 dark:text-terracotta-400 font-bold tracking-widest uppercase text-xs mb-4">
                {t("about.team_badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white mb-2">{t("about.team_title")}</h2>
              <p className="text-lg text-charcoal-500 dark:text-charcoal-400">{t("about.team_desc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-full py-16 text-center">
                  <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-charcoal-500 font-bold">{t("about.team_loading")}</p>
                </div>
              ) : teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id || member.name} className="text-center group">
                    <div className="relative mb-4 mx-auto w-36 h-36">
                      <div className="absolute inset-0 bg-terracotta-500 rounded-full scale-0 group-hover:scale-105 transition-transform duration-500 opacity-20"></div>
                      <img
                        className="w-full h-full rounded-full object-cover shadow-lg relative z-10 border-4 border-white dark:border-charcoal-800 transition-transform duration-500 group-hover:scale-95"
                        src={getImageUrl(member.profileImage)}
                        alt={member.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + member.name + "&background=random" }}
                      />
                    </div>
                    <h3 className="text-xl font-black text-charcoal-800 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-terracotta-600 dark:text-terracotta-400 font-bold uppercase tracking-widest text-xs">{member.title || member.role}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-cream-50 dark:bg-charcoal-700/50 rounded-2xl border border-dashed border-cream-200 dark:border-charcoal-600">
                  <p className="text-charcoal-400 font-medium">{t("about.team_empty")}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-terracotta-500 dark:bg-terracotta-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{t("about.cta_title")}</h2>
            <p className="text-lg text-terracotta-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              {t("about.cta_desc")}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-white text-terracotta-500 px-8 py-3 rounded-xl font-black text-lg transition-all hover:bg-cream-100 hover:scale-105 shadow-xl"
            >
              {t("about.cta_btn")} <FaArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
