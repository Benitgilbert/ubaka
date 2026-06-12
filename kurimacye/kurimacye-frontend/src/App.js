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
import SellerLayout from "./components/SellerLayout";

import { Toaster } from "react-hot-toast";

// Utility to handle ChunkLoadError after new deployments
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

// Lazy loaded components
const Login = lazyWithRetry(() => import("./views/Login"));
const Register = lazyWithRetry(() => import("./views/Register"));
const SellerDashboard = lazyWithRetry(() => import("./views/SellerDashboard"));
const UserDashboard = lazyWithRetry(() => import("./views/UserDashboard"));
const AuthSuccess = lazyWithRetry(() => import("./views/AuthSuccess"));
const ForgotPassword = lazyWithRetry(() => import("./views/ForgotPassword"));
const Logout = lazyWithRetry(() => import("./views/Logout"));
const Shop = lazyWithRetry(() => import("./views/Shop"));
const ProductDetail = lazyWithRetry(() => import("./views/ProductDetail"));
const CartPage = lazyWithRetry(() => import("./views/Cart"));
const CheckoutPage = lazyWithRetry(() => import("./views/Checkout"));
const TrackOrder = lazyWithRetry(() => import("./views/TrackOrder"));
const Home = lazyWithRetry(() => import("./views/Home"));
const Wishlist = lazyWithRetry(() => import("./views/Wishlist"));
const About = lazyWithRetry(() => import("./views/About"));
const Contact = lazyWithRetry(() => import("./views/Contact"));
const Blog = lazyWithRetry(() => import("./views/Blog"));
const BlogPost = lazyWithRetry(() => import("./views/BlogPost"));
const FAQ = lazyWithRetry(() => import("./views/FAQ"));
const OrderHistory = lazyWithRetry(() => import("./views/OrderHistory"));
const PrivacyPolicy = lazyWithRetry(() => import("./views/PrivacyPolicy"));
const TermsOfService = lazyWithRetry(() => import("./views/TermsOfService"));
const DailyDeals = lazyWithRetry(() => import("./views/DailyDeals"));
const SellerOrders = lazyWithRetry(() => import("./views/SellerOrders"));
const SellerPrintOrders = lazyWithRetry(() => import("./views/SellerPrintOrders"));
const SellerPayouts = lazyWithRetry(() => import("./views/SellerPayouts"));
const SellerProfile = lazyWithRetry(() => import("./views/SellerProfile"));
const SellerOrderDetails = lazyWithRetry(() => import("./views/SellerOrderDetails"));
const SellerNotifications = lazyWithRetry(() => import("./views/SellerNotifications"));
const OrderSuccess = lazyWithRetry(() => import("./views/OrderSuccess"));
const GiftCards = lazyWithRetry(() => import("./views/GiftCards"));
const Unsubscribe = lazyWithRetry(() => import("./views/Unsubscribe"));
const SellerAbonne = lazyWithRetry(() => import("./views/SellerAbonne"));
const SellerShifts = lazyWithRetry(() => import("./views/SellerShifts"));
const SellerRegistration = lazyWithRetry(() => import("./views/SellerRegistration"));
const SellerPOS = lazyWithRetry(() => import("./views/SellerPOS"));
const SellerProducts = lazyWithRetry(() => import("./views/SellerProducts"));
const SellerReports = lazyWithRetry(() => import("./views/SellerReports"));
const SellerTeam = lazyWithRetry(() => import("./views/SellerTeam"));
const SellerSettings = lazyWithRetry(() => import("./views/SellerSettings"));
const SellerDiscounts = lazyWithRetry(() => import("./views/SellerDiscounts"));
const SellerReviews = lazyWithRetry(() => import("./views/SellerReviews"));
const PrintPortal = lazyWithRetry(() => import("./views/PrintPortal"));
const Careers = lazyWithRetry(() => import("./views/Careers"));
const Storefront = lazyWithRetry(() => import("./views/Storefront"));

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
                    <Route path="/cookies" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/print-portal" element={<PrintPortal />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/store/:slug" element={<Storefront />} />
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
                      <Route path="/seller/settings" element={<SellerSettings />} />
                      <Route path="/seller/discounts" element={<SellerDiscounts />} />
                      <Route path="/seller/reviews" element={<SellerReviews />} />
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
