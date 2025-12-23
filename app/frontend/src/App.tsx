import { Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const Checkout = lazy(() => import('./pages/Checkout'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Admin Pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));

// Hosting Pages
const HostingLayout = lazy(() => import('./layouts/HostingLayout'));
const HostingDashboard = lazy(() => import('./pages/hosting/HostingDashboard'));
const HostingActivities = lazy(() => import('./pages/hosting/HostingActivities'));
const CreateActivity = lazy(() => import('./pages/hosting/CreateActivity'));
const EditActivity = lazy(() => import('./pages/hosting/EditActivity'));
const HostingBookings = lazy(() => import('./pages/hosting/HostingBookings'));

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/activities/:id/book" element={<Booking />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking/success/:id" element={<BookingConfirmation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="activities" element={<AdminActivities />} />
          <Route path="activities/create" element={<CreateActivity />} />
          <Route path="activities/edit/:id" element={<EditActivity />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        {/* Hosting Routes */}
        <Route path="/hosting" element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <HostingLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HostingDashboard />} />
          <Route path="listings" element={<HostingActivities />} />
          <Route path="activities/edit/:id" element={<EditActivity />} />
          <Route path="create" element={<CreateActivity />} />
          <Route path="bookings" element={<HostingBookings />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
