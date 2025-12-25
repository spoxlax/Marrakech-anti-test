const Booking = require('./models/Booking');

const crypto = require('crypto');

const generateConfirmationCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const formattedCode = `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}`;

  const existing = await Booking.findOne({ confirmationCode: formattedCode });
  if (existing) return generateConfirmationCode();
  return formattedCode;
};

const resolvers = {
  Query: {
    booking: async (_, { id }, { user }) => {
      const booking = await Booking.findById(id);
      if (!booking) return null;

      // Allow if user is admin
      if (user && user.role === 'admin') return booking;

      // Allow if user is owner (Customer or Vendor)
      if (user) {
        if (booking.customerId && booking.customerId.toString() === user.userId) return booking;
        if (booking.vendorId && booking.vendorId.toString() === user.userId) return booking;
      }

      // Allow if it's a guest booking (no customerId associated)
      // Note: In production, we should require confirmationCode for guest access
      if (!booking.customerId) return booking;

      throw new Error('Forbidden');
    },
    myBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Booking.find({ customerId: user.userId });
    },
    vendorBookings: async (_, __, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) throw new Error('Unauthorized');
      return await Booking.find({ vendorId: user.userId });
    },
    allBookings: async (_, { filter, search }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Unauthorized');

      let query = {};

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { confirmationCode: searchRegex },
          { 'customerInfo.firstName': searchRegex },
          { 'customerInfo.lastName': searchRegex },
          { 'customerInfo.email': searchRegex },
          { 'customerInfo.phone': searchRegex }
        ];
      }

      // Filter by 'admin' or 'vendor' listings requires resolving vendor role, which is in another service.
      // Ideally, we fetch all and filter in memory if dataset is small, or use aggregation if user data was local.
      // Since User is remote, we can't filter easily in MongoDB query level for 'vendor.role'.
      // We will return all matches for search, and let frontend filter by role, OR
      // we can fetch bookings, then map to get vendors, then filter.
      // Given simple implementation request, let's fetch matching bookings first.

      const bookings = await Booking.find(query).sort({ _id: -1 });
      return bookings;
    },
  },
  Mutation: {
    createBooking: async (_, { input }, { user }) => {
      const confirmationCode = await generateConfirmationCode();
      const booking = new Booking({
        ...input,
        customerId: user ? user.userId : null,
        confirmationCode,
      });
      await booking.save();
      return booking;
    },
    updateBookingStatus: async (_, { id, status }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }

      const booking = await Booking.findById(id);
      if (!booking) throw new Error('Booking not found');

      if (user.role !== 'admin' && booking.vendorId.toString() !== user.userId) {
        throw new Error('Forbidden');
      }

      return await Booking.findByIdAndUpdate(id, { status }, { new: true });
    },
    addBookingPhotos: async (_, { bookingId, photoUrls }, { user }) => {
      console.log('addBookingPhotos resolver called with:', { bookingId, photoUrls, user: user ? user.userId : 'none' });
      if (!user) throw new Error('Unauthorized');
      
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const isVendorOwner = user.role === 'vendor' && booking.vendorId.toString() === user.userId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin && !isVendorOwner) {
        throw new Error('Forbidden');
      }

      if (!booking.professionalPhotos) {
        booking.professionalPhotos = [];
      }
      booking.professionalPhotos.push(...photoUrls);
      await booking.save();
      return booking;
    },
    updateBookingDetails: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      
      const booking = await Booking.findById(id);
      if (!booking) throw new Error('Booking not found');

      const isVendorOwner = user.role === 'vendor' && booking.vendorId.toString() === user.userId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin && !isVendorOwner) {
        throw new Error('Forbidden');
      }

      // Update fields
      if (input.date) booking.date = input.date;
      if (input.persons) booking.persons = input.persons;
      if (input.totalPrice) booking.totalPrice = input.totalPrice;
      if (input.status) booking.status = input.status;
      if (input.customerInfo) {
          booking.customerInfo = { ...booking.customerInfo, ...input.customerInfo };
      }

      await booking.save();
      return booking;
    },
    deleteBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      
      const booking = await Booking.findById(id);
      if (!booking) throw new Error('Booking not found');

      const isVendorOwner = user.role === 'vendor' && booking.vendorId.toString() === user.userId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin && !isVendorOwner) {
        throw new Error('Forbidden');
      }

      await Booking.findByIdAndDelete(id);
      return true;
    },
  },
  Booking: {
    __resolveReference(bookingReference) {
      return Booking.findById(bookingReference.id);
    },
    activity(booking) {
      return { __typename: 'Activity', id: booking.activityId };
    },
    vendor(booking) {
      return { __typename: 'User', id: booking.vendorId };
    },
  },
};

module.exports = { resolvers };
