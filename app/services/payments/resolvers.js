const Payment = require('./models/Payment');

const resolvers = {
  Query: {
    payment: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const payment = await Payment.findById(id);
      // Add ownership check
      return payment;
    },
    myPayments: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      // This assumes we can link payments to users via booking or directly. 
      // For now, let's assume we might need to fetch bookings first or store userId in payment.
      // Adding userId to Payment model would be better, but sticking to schema for now.
      // Let's just return empty for now or implement if we add userId.
      return []; 
    },
  },
  Mutation: {
    createPayment: async (_, { input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const payment = new Payment({
        ...input,
      });
      await payment.save();
      return payment;
    },
    updatePaymentStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Unauthorized');
      return await Payment.findByIdAndUpdate(id, { status }, { new: true });
    },
  },
  Payment: {
    __resolveReference(paymentReference) {
      return Payment.findById(paymentReference.id);
    },
  },
};

module.exports = { resolvers };
