const Activity = require('./models/Activity');

const resolvers = {
  Query: {
    activities: async () => {
      return await Activity.find();
    },
    activity: async (_, { id }) => {
      return await Activity.findById(id);
    },
    searchActivities: async (_, { query, category, minPrice, maxPrice, city, minRating }) => {
      const filter = {};
      
      // Text Search
      if (query) {
         filter.$text = { $search: query };
      }
      
      // Category Filter
      if (category && category !== 'All') {
        filter.category = category;
      }

      // City Filter
      if (city && city !== 'All') {
          filter.city = city;
      }
      
      // Price Filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.priceAdult = {};
        if (minPrice !== undefined) filter.priceAdult.$gte = minPrice;
        if (maxPrice !== undefined) filter.priceAdult.$lte = maxPrice;
      }

      // Rating Filter
      if (minRating !== undefined) {
          filter.averageRating = { $gte: minRating };
      }
      
      // If no query but filters exist, text search won't work alone like this easily if mixed with other filters in some mongo versions without specific index setups, 
      // but standard find works. However, $text requires $search. 
      // If query IS provided, use $text. If NOT, use regex or just matches.
      
      if (!query && Object.keys(filter).length > 0) {
          // If purely filtering without text search
          return await Activity.find(filter);
      } else if (query) {
         return await Activity.find(filter);
      } else {
         return await Activity.find().limit(20); // Default recent/all
      }
    },
    searchSuggestions: async (_, { query }) => {
      if (!query || query.length < 2) return [];
      const activities = await Activity.find({ title: { $regex: query, $options: 'i' } }).limit(5).select('title');
      return activities.map(a => a.title);
    },
    myActivities: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Activity.find({ vendorId: user.userId });
    },
  },
  Mutation: {
    createActivity: async (_, { input }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      const activity = new Activity({
        ...input,
        vendorId: user.userId,
        status: user.role === 'admin' ? 'APPROVED' : 'PENDING'
      });
      await activity.save();
      return activity;
    },
    updateActivity: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      
      const activity = await Activity.findById(id);
      if (!activity) throw new Error('Activity not found');

      // Admin or Owner check
      if (user.role !== 'admin' && activity.vendorId.toString() !== user.userId) {
        throw new Error('Forbidden');
      }

      Object.assign(activity, input);
      // If vendor updates, maybe reset to pending? For now keeping same status or forcing pending if critical fields change.
      // activity.status = user.role === 'admin' ? activity.status : 'PENDING'; 
      
      await activity.save();
      return activity;
    },
    approveActivity: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');
      return await Activity.findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true });
    },
    deleteActivity: async (_, { id }, { user }) => {
       if (!user) throw new Error('Unauthorized');
       
       const activity = await Activity.findById(id);
       if (!activity) return false;

       // Admin or Owner check
       if (user.role !== 'admin' && activity.vendorId.toString() !== user.userId) {
         throw new Error('Forbidden');
       }

       await Activity.findByIdAndDelete(id);
       return true;
    },
  },
  Activity: {
    __resolveReference(activityReference) {
      return Activity.findById(activityReference.id);
    },
  },
};

module.exports = { resolvers };
