import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallApp from "./components/InstallApp";
import AdminLayout from "./components/AdminLayout";
import SellerLayout from "./components/SellerLayout";

import { Toaster } from "react-hot-toast";

// Lazy loaded components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AuthSuccess = lazy(() => import("./pages/AuthSuccess"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Logout = lazy(() => import("./pages/Logout"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetails"));
const AdminGiftCards = lazy(() => import("./pages/admin/AdminGiftCards"));
const AdminGiftCardProducts = lazy(() => import("./pages/admin/AdminGiftCardProducts"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminDelivery = lazy(() => import("./pages/AdminShipping"));
const AdminTax = lazy(() => import("./pages/AdminTax"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminAttributes = lazy(() => import("./pages/AdminAttributes"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const FinanceDashboard = lazy(() => import("./pages/admin/FinanceDashboard"));
const OwnerOverview = lazy(() => import("./pages/admin/OwnerOverview"));
const POS = lazy(() => import("./pages/admin/POS"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Home = lazy(() => import("./pages/Home"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQ = lazy(() => import("./pages/FAQ"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DailyDeals = lazy(() => import("./pages/DailyDeals"));
const AdminFlashSales = lazy(() => import("./pages/AdminFlashSales"));
const AdminBanners = lazy(() => import("./pages/AdminBanners"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminBrandPartners = lazy(() => import("./pages/AdminBrandPartners"));
const AdminSiteSettings = lazy(() => import("./pages/AdminSiteSettings"));
const AdminSubscribers = lazy(() => import("./pages/AdminSubscribers"));
const AdminSellers = lazy(() => import("./pages/AdminSellers"));
const AdminCommissions = lazy(() => import("./pages/AdminCommissions"));
const AdminPayouts = lazy(() => import("./pages/AdminPayouts"));
const AdminProductApproval = lazy(() => import("./pages/AdminProductApproval"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const AdminCustomerQueries = lazy(() => import("./pages/AdminCustomerQueries"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const SellerOrders = lazy(() => import("./pages/SellerOrders"));
const SellerPrintOrders = lazy(() => import("./pages/SellerPrintOrders"));
const SellerPayouts = lazy(() => import("./pages/SellerPayouts"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const SellerOrderDetails = lazy(() => import("./pages/SellerOrderDetails"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const SellerNotifications = lazy(() => import("./pages/SellerNotifications"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const SellerAbonne = lazy(() => import("./pages/SellerAbonne"));
const AdminAbonne = lazy(() => import("./pages/admin/AdminAbonne"));
const SellerShifts = lazy(() => import("./pages/SellerShifts"));
const AdminShifts = lazy(() => import("./pages/admin/AdminShifts"));
const AdminSellerVerification = lazy(() => import("./pages/AdminSellerVerification"));
const AdminViolations = lazy(() => import("./pages/AdminViolations"));
const AdminSellerReports = lazy(() => import("./pages/AdminSellerReports"));
const SellerRegistration = lazy(() => import("./pages/SellerRegistration"));
const SellerPOS = lazy(() => import("./pages/SellerPOS"));
const SellerProducts = lazy(() => import("./pages/SellerProducts"));
const SellerReports = lazy(() => import("./pages/SellerReports"));
const SellerTeam = lazy(() => import("./pages/SellerTeam"));
const PrintPortal = lazy(() => import("./pages/PrintPortal"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Data is fresh for 1 minute
      cacheTime: 300000, // Data stays in memory for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch just because window regained focus
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-terracotta-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
                  Skip to Content
                </a>
                <ScrollToTop />
                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
                <InstallApp />
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen bg-cream-100 dark:bg-charcoal-900">
                    <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:id" element={<OrderSuccess />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/print-portal" element={<PrintPortal />} />
                    <Route path="/orders" element={
                      <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'cashier', 'owner']}>
                        <OrderHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/daily-deals" element={<DailyDeals />} />
                    <Route path="/gift-cards" element={<GiftCards />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    {/* Admin Routes with Shared Layout */}
                    <Route element={
                      <ProtectedRoute allowedRoles={['admin', 'owner']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/overview" element={<OwnerOverview />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
                      <Route path="/admin/gift-cards" element={<AdminGiftCards />} />
                      <Route path="/admin/gift-card-products" element={<AdminGiftCardProducts />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/coupons" element={<AdminCoupons />} />
                      <Route path="/admin/delivery" element={<AdminDelivery />} />
                      <Route path="/admin/taxes" element={<AdminTax />} />
                      <Route path="/admin/attributes" element={<AdminAttributes />} />
                      <Route path="/admin/reports" element={<AdminReports />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/flash-sales" element={<AdminFlashSales />} />
                      <Route path="/admin/banners" element={<AdminBanners />} />
                      <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                      <Route path="/admin/brand-partners" element={<AdminBrandPartners />} />
                      <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
                      <Route path="/admin/subscribers" element={<AdminSubscribers />} />
                      <Route path="/admin/sellers" element={<AdminSellers />} />
                      <Route path="/admin/commissions" element={<AdminCommissions />} />
                      <Route path="/admin/payouts" element={<AdminPayouts />} />
                      <Route path="/admin/product-approval" element={<AdminProductApproval />} />
                      <Route path="/admin/reviews" element={<AdminReviews />} />
                      <Route path="/admin/tickets" element={<AdminTickets />} />
                      <Route path="/admin/customer-queries" element={<AdminCustomerQueries />} />
                      <Route path="/admin/seller-verification" element={<AdminSellerVerification />} />
                      <Route path="/admin/blogs" element={<AdminBlogs />} />
                      <Route path="/admin/blogs/new" element={<AdminBlogEditor />} />
                      <Route path="/admin/blogs/edit/:id" element={<AdminBlogEditor />} />
                      <Route path="/admin/violations" element={<AdminViolations />} />
                      <Route path="/admin/seller-reports" element={<AdminSellerReports />} />
                      <Route path="/admin/finance" element={<FinanceDashboard />} />
                      <Route path="/admin/pos" element={<POS />} />
                      <Route path="/admin/notifications" element={<AdminNotifications />} />
                      <Route path="/admin/abonnes" element={<AdminAbonne />} />
                      <Route path="/admin/shifts" element={<AdminShifts />} />
                    </Route>

                    {/* Seller Routes with Shared Layout */}
                    <Route element={
                      <ProtectedRoute allowedRoles={['seller', 'admin', 'cashier']}>
                        <SellerLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/seller/dashboard" element={<SellerDashboard />} />
                      <Route path="/seller/pos" element={<SellerPOS />} />
                      <Route path="/seller/products" element={<SellerProducts />} />
                      <Route path="/seller/orders" element={<SellerOrders />} />
                      <Route path="/seller/print-orders" element={<SellerPrintOrders />} />
                      <Route path="/seller/orders/:id" element={<SellerOrderDetails />} />
                      <Route path="/seller/payouts" element={<SellerPayouts />} />
                      <Route path="/seller/profile" element={<SellerProfile />} />
                      <Route path="/seller/abonnes" element={<SellerAbonne />} />
                      <Route path="/seller/reports" element={<SellerReports />} />
                      <Route path="/seller/team" element={<SellerTeam />} />
                      <Route path="/seller/notifications" element={<SellerNotifications />} />
                      <Route path="/seller/shifts" element={<SellerShifts />} />
                    </Route>

                    <Route path="/become-seller" element={<SellerRegistration />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/logout" element={<Logout />} />

                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'cashier', 'owner']}>
                        <UserDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/guest" element={<div>Guest Page</div>} />


                  </Routes>
                </Suspense>

              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
