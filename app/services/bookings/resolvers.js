const Booking = require('./models/Booking');

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
  },
  Mutation: {
    createBooking: async (_, { input }, { user }) => {
      const booking = new Booking({
        ...input,
        customerId: user ? user.userId : null,
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
  },
};

module.exports = { resolvers };
