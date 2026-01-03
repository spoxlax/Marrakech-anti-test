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

const checkPermission = (user, resource, action) => {
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'admin') return true;

  const permissions = user.permissions || [];
  if (permissions.includes('*')) return true;

  if (permissions.includes(`${resource}:${action}`)) return true;

  return false;
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
        const ownerId = user.ownerId || user.userId;

        // Customer check (employee acting as customer)
        if (booking.customerId && booking.customerId.toString() === user.userId) return booking;

        // Vendor check
        if (booking.vendorId && booking.vendorId.toString() === ownerId) {
          const permissions = user.permissions || [];
          // Check permission for employees
          if (user.role !== 'vendor' && !permissions.includes('bookings:view') && !permissions.includes('*')) {
            throw new Error('Forbidden: Insufficient permissions');
          }
          return booking;
        }
      }

      // Allow if it's a guest booking (no customerId associated)
      if (!booking.customerId) return booking;

      throw new Error('Forbidden');
    },
    myBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      // "myBookings" usually refers to bookings I made as a customer
      return await Booking.find({ customerId: user.userId });
    },
    vendorBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');

      // Check if they are vendor side (admin, vendor, employee)
      if (user.role === 'customer') throw new Error('Unauthorized');

      if (!checkPermission(user, 'bookings', 'view')) throw new Error('Forbidden');

      const ownerId = user.ownerId || user.userId;
      return await Booking.find({ vendorId: ownerId });
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

      const bookings = await Booking.find(query).sort({ _id: -1 });
      return bookings;
    },
  },
  Booking: {
    activity: (booking) => {
      return { __typename: 'Activity', id: booking.activityId };
    },
    vendor: (booking) => {
      return { __typename: 'User', id: booking.vendorId };
    },
    customerInfo: (booking) => booking.customerInfo || {},
    persons: (booking) => booking.persons || { adults: 0, children: 0 }
  },
  Mutation: {
    createBooking: async (_, { input }, { user }) => {
      const confirmationCode = await generateConfirmationCode();

      let guestToken = null;
      if (!user) {
        guestToken = input.guestToken || crypto.randomBytes(32).toString('hex');
      }

      const booking = new Booking({
        ...input,
        customerId: user ? user.userId : null,
        confirmationCode,
        guestToken
      });
      await booking.save();
      return booking;
    },
    updateBookingStatus: async (_, { id, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(id);
      if (!booking) throw new Error('Booking not found');

      const ownerId = user.ownerId || user.userId;

      if (user.role !== 'admin') {
        if (booking.vendorId.toString() !== ownerId) throw new Error('Forbidden');
        if (!checkPermission(user, 'bookings', 'edit')) throw new Error('Forbidden');
      }

      return await Booking.findByIdAndUpdate(id, { status }, { new: true });
    },
    addBookingPhotos: async (_, { bookingId, photoUrls }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const ownerId = user.ownerId || user.userId;
      const isVendorOwner = booking.vendorId.toString() === ownerId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin) {
        if (!isVendorOwner) throw new Error('Forbidden');
        if (!checkPermission(user, 'bookings', 'edit')) throw new Error('Forbidden');
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

      const ownerId = user.ownerId || user.userId;
      const isVendorOwner = booking.vendorId.toString() === ownerId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin) {
        if (!isVendorOwner) throw new Error('Forbidden');
        if (!checkPermission(user, 'bookings', 'edit')) throw new Error('Forbidden');
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

      const ownerId = user.ownerId || user.userId;
      const isVendorOwner = booking.vendorId.toString() === ownerId;
      const isAdmin = user.role === 'admin';

      if (!isAdmin) {
        if (!isVendorOwner) throw new Error('Forbidden');
        if (!checkPermission(user, 'bookings', 'delete')) throw new Error('Forbidden');
      }

      await Booking.findByIdAndDelete(id);
      return true;
    },
    associateGuestBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');

      // Find bookings with matching email and no customerId
      const result = await Booking.updateMany(
        {
          'customerInfo.email': user.email,
          customerId: null
        },
        {
          $set: { customerId: user.userId }
        }
      );

      return result.modifiedCount;
    }
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
    activityId: (booking) => booking.activityId.toString(),
    vendorId: (booking) => booking.vendorId.toString(),
    customerId: (booking) => booking.customerId ? booking.customerId.toString() : null,
  },
};

module.exports = { resolvers };
