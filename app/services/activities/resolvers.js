const Activity = require('./models/Activity');
const Category = require('./models/Category');

const resolvers = {
  Query: {
    activities: async () => {
      return await Activity.find();
    },
    activity: async (_, { id }) => {
      return await Activity.findById(id);
    },
    categories: async () => {
      return await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
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
    createCategory: async (_, { input }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      const category = new Category({
        name: input.name,
        icon: input.icon || '',
        order: typeof input.order === 'number' ? input.order : 0,
        isActive: input.isActive !== false,
        createdBy: user.userId,
        createdByRole: user.role,
      });
      await category.save();
      return category;
    },
    updateCategory: async (_, { id, input }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      const category = await Category.findById(id);
      if (!category) throw new Error('Category not found');

      if (user.role !== 'admin') {
        if (!category.createdBy || category.createdBy.toString() !== user.userId) {
          throw new Error('Forbidden');
        }
      }

      category.name = input.name;
      category.icon = input.icon || '';
      if (typeof input.order === 'number') {
        category.order = input.order;
      }
      if (typeof input.isActive === 'boolean') {
        category.isActive = input.isActive;
      }
      await category.save();
      return category;
    },
    deleteCategory: async (_, { id }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      const category = await Category.findById(id);
      if (!category) return false;

      if (user.role !== 'admin') {
        if (!category.createdBy || category.createdBy.toString() !== user.userId) {
          throw new Error('Forbidden');
        }
      }

      category.isActive = false;
      await category.save();
      return true;
    },
    createActivity: async (_, { input }, { user }) => {
      if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      const hasCategories = await Category.exists({});
      if (hasCategories) {
        const valid = await Category.findOne({ name: input.category, isActive: true }).select('_id');
        if (!valid) throw new Error('Invalid category');
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

      const hasCategories = await Category.exists({});
      if (hasCategories) {
        const valid = await Category.findOne({ name: input.category, isActive: true }).select('_id');
        if (!valid) throw new Error('Invalid category');
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
  Category: {
    __resolveReference(categoryReference) {
      return Category.findById(categoryReference.id);
    },
  },
};

module.exports = { resolvers };
