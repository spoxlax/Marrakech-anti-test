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
      // Add authorization check here (user owns booking or is vendor/admin)
      return booking;
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
      // Add check to ensure vendor owns the booking
      return await Booking.findByIdAndUpdate(id, { status }, { new: true });
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
