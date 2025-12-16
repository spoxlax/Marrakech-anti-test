import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivities from './pages/admin/AdminActivities';
import AdminBookings from './pages/admin/AdminBookings';

// Hosting
import HostingLayout from './layouts/HostingLayout';
import HostingDashboard from './pages/hosting/HostingDashboard';
import HostingActivities from './pages/hosting/HostingActivities';
import CreateActivity from './pages/hosting/CreateActivity';
import EditActivity from './pages/hosting/EditActivity';
import HostingBookings from './pages/hosting/HostingBookings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
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
        <ProtectedRoute allowedRoles={['vendor', 'admin']}>
          <HostingLayout />
        </ProtectedRoute>
      }>
        <Route index element={<HostingDashboard />} />
        <Route path="listings" element={<HostingActivities />} />
        <Route path="activities/edit/:id" element={<EditActivity />} />
        <Route path="create" element={<CreateActivity />} />
        <Route path="bookings" element={<HostingBookings />} />
      </Route>
    </Routes>
  );
}

export default App;
