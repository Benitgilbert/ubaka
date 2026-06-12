import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaShieldAlt, FaLock, FaEye, FaDatabase, FaEnvelope } from 'react-icons/fa';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-12 md:py-16 bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-100/20 dark:bg-terracotta-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-20 right-20 w-72 h-72 bg-sand-100/20 dark:bg-sand-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 text-center">
                        <div className="w-16 h-16 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-terracotta-500">
                            <FaShieldAlt className="text-3xl" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-charcoal-900 dark:text-white mb-4">Privacy <span className="text-terracotta-500">Policy</span></h1>
                        <p className="text-base text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
                            We value your trust and are committed to protecting your personal information.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-12">
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden p-6 md:p-10 space-y-10">

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaEye className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">1. Introduction</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                Welcome to Kuri Macye. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our website
                                and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaDatabase className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">2. Information We Collect</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                We collect several different types of information for various purposes to provide and improve our Service to you:
                            </p>
                            <div className="grid gap-4">
                                {[
                                    { title: "Personal Data", desc: "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (Name, Email, Phone, Address)." },
                                    { title: "Usage Data", desc: "We may also collect information how the Service is accessed and used (IP address, browser type, pages visited, time spent)." },
                                    { title: "Tracking & Cookies", desc: "We use cookies and similar tracking technologies to track the activity on our Service and hold certain information to enhance your experience." }
                                ].map((item, i) => (
                                    <div key={i} className="p-5 bg-cream-50 dark:bg-charcoal-900/50 rounded-2xl border border-cream-200 dark:border-charcoal-700 transition-all hover:border-terracotta-500/30">
                                        <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-1">{item.title}</h3>
                                        <p className="text-sm md:text-base text-charcoal-600 dark:text-charcoal-300">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaShieldAlt className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">3. Use of Data</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                Kuri Macye uses the collected data for various professional purposes:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "To provide and maintain our high-quality printing services",
                                    "To notify you about changes to our Service or your order status",
                                    "To allow you to participate in interactive features of our Service",
                                    "To provide elite customer care and prompt support",
                                    "To provide analysis or valuable information to improve the Service"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base text-charcoal-600 dark:text-charcoal-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-terracotta-500/60 shrink-0 mt-2"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaLock className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">4. Data Security</h2>
                            </div>
                            <div className="p-6 bg-terracotta-50/50 dark:bg-terracotta-950/10 border-l-4 border-terracotta-500/60 rounded-2xl text-base text-charcoal-600 dark:text-charcoal-300 italic">
                                "The security of your data is paramount to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use industry-standard means to protect your Personal Data, we cannot guarantee its absolute security."
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaEnvelope className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">5. Contact Us</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                If you have any questions about this Privacy Policy, please reach out to our team at
                                <a href="mailto:support@kurimacye.co.rw" className="ml-1.5 text-terracotta-500 font-bold hover:underline underline-offset-4 transition-all">
                                    support@kurimacye.co.rw
                                </a>.
                            </p>
                        </section>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
};

export default PrivacyPolicy;
