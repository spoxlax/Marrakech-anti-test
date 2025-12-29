const Activity = require('./models/Activity');
const Category = require('./models/Category');

const checkPermission = (user, resource, action) => {
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'admin') return true;

  const permissions = user.permissions || [];
  if (permissions.includes('*')) return true; // Vendor owner or super admin

  // Check specific permission
  if (permissions.includes(`${resource}:${action}`)) return true;

  return false;
};

const resolvers = {
  Query: {
    activities: async () => {
      // Public access: No permission check needed
      return await Activity.find();
    },
    activity: async (_, { id }) => {
      // Public access: No permission check needed
      return await Activity.findById(id);
    },
    categories: async () => {
      // Public access: No permission check needed
      return await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    },
    searchActivities: async (_, { query, category, minPrice, maxPrice, city, minRating }) => {
      // Public access: No permission check needed
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

      if (!checkPermission(user, 'activities', 'view')) {
        throw new Error('Forbidden');
      }

      const ownerId = user.ownerId || user.userId;
      return await Activity.find({ vendorId: ownerId });
    },
  },
  Mutation: {
    createCategory: async (_, { input }, { user }) => {
      if (!checkPermission(user, 'activities', 'create')) {
        throw new Error('Forbidden');
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
      if (!checkPermission(user, 'activities', 'edit')) {
        throw new Error('Forbidden');
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
      if (!checkPermission(user, 'activities', 'delete')) {
        throw new Error('Forbidden');
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
      if (!checkPermission(user, 'activities', 'create')) {
        throw new Error('Forbidden');
      }
      const hasCategories = await Category.exists({});
      if (hasCategories) {
        const valid = await Category.findOne({ name: input.category, isActive: true }).select('_id');
        if (!valid) throw new Error('Invalid category');
      }
      const activity = new Activity({
        ...input,
        vendorId: user.ownerId || user.userId,
        status: user.role === 'admin' ? 'APPROVED' : 'PENDING'
      });
      await activity.save();
      return activity;
    },
    updateActivity: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const activity = await Activity.findById(id);
      if (!activity) throw new Error('Activity not found');

      const ownerId = user.ownerId || user.userId;

      // Admin or Owner check
      if (user.role !== 'admin') {
        if (activity.vendorId.toString() !== ownerId) throw new Error('Forbidden');
        if (!checkPermission(user, 'activities', 'edit')) throw new Error('Forbidden');
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

      const ownerId = user.ownerId || user.userId;

      // Admin or Owner check
      if (user.role !== 'admin') {
        if (activity.vendorId.toString() !== ownerId) throw new Error('Forbidden');
        if (!checkPermission(user, 'activities', 'delete')) throw new Error('Forbidden');
      }

      // Delete images from Upload Service
      if (activity.images && activity.images.length > 0) {
        const uploadServiceUrl = process.env.UPLOADS_SERVICE_URL || 'http://localhost:5007';

        // Use Promise.allSettled to ensure all deletion attempts run even if one fails
        await Promise.allSettled(activity.images.map(async (imageUrl) => {
          try {
            // Extract filename from URL (assuming format http://.../uploads/filename.ext)
            const filename = imageUrl.split('/').pop();
            if (!filename) return;

            // Global fetch is available in Node 18+
            await fetch(`${uploadServiceUrl}/file`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.UPLOADS_API_KEY
              },
              body: JSON.stringify({ filename })
            });
          } catch (e) {
            console.error('Failed to delete image:', imageUrl, e);
          }
        }));
      }

      await Activity.findByIdAndDelete(id);
      return true;
    },
  },
  Activity: {
    __resolveReference(activityReference) {
      return Activity.findById(activityReference.id);
    },
    vendorId: (activity) => activity.vendorId ? activity.vendorId.toString() : "000000000000000000000000",
    title: (activity) => activity.title || "Untitled Activity",
    priceAdult: (activity) => activity.priceAdult || 0,
    status: (activity) => activity.status || "PENDING",
  },
};

module.exports = { resolvers };
