const Review = require('./models/Review');

const resolvers = {
  Query: {
    reviews: async (_, { activityId }) => {
      return await Review.find({ activityId });
    },
    myReviews: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Review.find({ customerId: user.userId });
    },
  },
  Mutation: {
    createReview: async (_, { input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      
      // In a real app, we would verify that the booking exists and belongs to the user
      // and that the booking status is 'completed'.
      
      const review = new Review({
        ...input,
        customerId: user.userId,
      });
      await review.save();
      return review;
    },
  },
  Review: {
    __resolveReference(reviewReference) {
      return Review.findById(reviewReference.id);
    },
    user(review) {
      return { __typename: 'User', id: review.customerId };
    },
  },
};

module.exports = { resolvers };
