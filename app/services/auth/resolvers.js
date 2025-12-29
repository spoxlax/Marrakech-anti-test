const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Profile = require('./models/Profile');
const AuditLog = require('./models/AuditLog');
const { sendAuthEmail } = require('./utils/mailer');

const PERMISSIONS_LIST = [
  { resource: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'bookings', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'reviews', actions: ['view', 'respond', 'delete'] },
  { resource: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'finance', actions: ['view', 'export'] },
  { resource: 'reports', actions: ['view'] },
  { resource: 'settings', actions: ['view', 'edit'] }
];

// Helper: Get permissions for a user (Recursive for vertical inheritance)
const getEffectivePermissions = async (user) => {
  if (['admin', 'vendor'].includes(user.role)) {
    // Admins and Vendors are currently superusers in their scope
    return ['*'];
  }

  if (user.role === 'employee' && user.profileId) {
    const profile = await Profile.findById(user.profileId);
    const profilePerms = profile ? profile.permissions : [];

    // Vertical Inheritance: Intersect with Parent's permissions
    if (user.parentId) {
      const parent = await User.findById(user.parentId);
      if (parent) {
        const parentPerms = await getEffectivePermissions(parent);

        // If parent has all access, child gets full profile permissions
        if (parentPerms.includes('*')) return profilePerms;

        // Otherwise, intersection
        if (profilePerms.includes('*')) return parentPerms; // Should rarely happen for employee profile but logical

        return profilePerms.filter(p => parentPerms.includes(p));
      }
    }
    // If no parent, orphan employee? Safe to return profile perms or empty.
    // Assuming 2-level hierarchy mainly, returning profile perms.
    return profilePerms;
  }
  return [];
};

// Helper: Check for privilege escalation
const canAssignPermissions = async (actor, permissionsToAssign) => {
  const actorPerms = await getEffectivePermissions(actor);
  if (actorPerms.includes('*')) return true;

  if (permissionsToAssign.includes('*')) return false; // Non-super user cannot assign super access

  const missing = permissionsToAssign.filter(p => !actorPerms.includes(p));
  return missing.length === 0;
};

// Helper: Log Audit
const logAudit = async (action, actor, targetId, targetResource, details, status = 'SUCCESS') => {
  try {
    await AuditLog.create({
      action,
      actorId: actor.id || actor.userId,
      actorRole: actor.role,
      targetId,
      targetResource,
      details,
      status
    });
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await User.findById(user.userId);
    },
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Forbidden');
      }
      return await User.find();
    },
    // --- Profile Management ---
    myProfiles: async (_, __, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }
      const ownerId = user.id || user.userId;
      return await Profile.find({ ownerId });
    },
    profile: async (_, { id }, { user }) => {
      if (!user) throw new Error('Forbidden');
      const ownerId = user.id || user.userId;
      // Allow access if owner or if assigned to the user (for reading own profile)
      const profile = await Profile.findById(id);
      if (!profile) return null;

      if (user.role === 'employee') {
        if (user.profileId !== id) throw new Error('Forbidden');
      } else {
        if (profile.ownerId.toString() !== ownerId) throw new Error('Forbidden');
      }
      return profile;
    },
    availablePermissions: () => PERMISSIONS_LIST,

    // --- Employee Management ---
    myEmployees: async (_, __, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }
      const ownerId = user.id || user.userId;
      return await User.find({ parentId: ownerId, role: 'employee' });
    }
  },
  Mutation: {
    createUser: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Forbidden: Admins only');
      }

      const { firstName, lastName, email, password, role } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });

      await newUser.save();

      // Create Default Profile for new Admin or Vendor
      if (['admin', 'vendor'].includes(role)) {
        const masterProfile = new Profile({
          name: role === 'admin' ? 'System Administrator' : 'Master Profile',
          description: 'Default profile with full permissions',
          permissions: ['*'],
          ownerId: newUser.id
        });
        await masterProfile.save();
        newUser.profileId = masterProfile.id;
        await newUser.save();
      }

      await logAudit('CREATE_USER', user, newUser.id, 'User', { role, email });

      return newUser;
    },
    updateUser: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Forbidden: Admins only');
      }

      const updateData = { ...input };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      } else {
        delete updateData.password;
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedUser) {
        throw new Error('User not found');
      }

      await logAudit('UPDATE_USER', user, id, 'User', { updates: Object.keys(input) });
      return updatedUser;
    },
    signup: async (_, { input }) => {
      console.log('Signup called with:', input);
      const { firstName, lastName, email, password, role = 'customer' } = input;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');
      if (password.length < 8) throw new Error('Password must be at least 8 characters long');

      if (role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount > 0) throw new Error('Admin signup is disabled');
      } else if (!['customer', 'vendor'].includes(role)) {
        throw new Error('Invalid role');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();

      if (['vendor', 'admin'].includes(role)) {
        const masterProfile = new Profile({
          name: role === 'admin' ? 'System Administrator' : 'Master Profile',
          description: 'Default profile with full permissions',
          permissions: ['*'],
          ownerId: user.id
        });
        await masterProfile.save();
        user.profileId = masterProfile.id;
        await user.save();
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      try {
        await sendAuthEmail(email, 'WELCOME', { name: firstName });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }

      // No audit log for public signup (no actor)
      return { token, user };
    },
    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');

      // Payload enrichment with permissions
      const payload = {
        userId: user.id,
        role: user.role,
      };

      if (user.role === 'employee') {
        payload.ownerId = user.parentId;
        payload.profileId = user.profileId;

        // Calculate Effective Permissions (Inheritance)
        payload.permissions = await getEffectivePermissions(user);

      } else if (['admin', 'vendor'].includes(user.role)) {
        payload.ownerId = user.id;
        payload.profileId = user.profileId;
        payload.permissions = await getEffectivePermissions(user);
      } else {
        // Customer
        payload.permissions = [];
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user };
    },

    // --- Profile Management ---
    createProfile: async (_, { input }, { user }) => {
      console.log('createProfile User Context:', user);
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }

      const ownerId = user.id || user.userId;
      if (!ownerId) throw new Error('User ID not found in context');

      // Privilege Escalation Check
      const allowed = await canAssignPermissions({ id: ownerId, role: user.role }, input.permissions);
      if (!allowed) {
        await logAudit('CREATE_PROFILE', user, null, 'Profile', { input, error: 'Privilege Escalation' }, 'FAILURE');
        throw new Error('Cannot assign permissions you do not possess');
      }

      const existingProfile = await Profile.findOne({ name: input.name, ownerId });
      if (existingProfile) throw new Error('Profile with this name already exists');

      const profile = new Profile({
        ...input,
        ownerId
      });
      await profile.save();

      await logAudit('CREATE_PROFILE', user, profile.id, 'Profile', { name: input.name });
      return profile;
    },
    updateProfile: async (_, { id, input }, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }
      const ownerId = user.id || user.userId;
      const profile = await Profile.findOne({ _id: id, ownerId });
      if (!profile) throw new Error('Profile not found');

      if (input.permissions) {
        const allowed = await canAssignPermissions({ id: ownerId, role: user.role }, input.permissions);
        if (!allowed) {
          await logAudit('UPDATE_PROFILE', user, id, 'Profile', { input, error: 'Privilege Escalation' }, 'FAILURE');
          throw new Error('Cannot assign permissions you do not possess');
        }
      }

      if (input.name) profile.name = input.name;
      if (input.description) profile.description = input.description;
      if (input.permissions) profile.permissions = input.permissions;

      await profile.save();
      await logAudit('UPDATE_PROFILE', user, id, 'Profile', { updates: Object.keys(input) });
      return profile;
    },
    deleteProfile: async (_, { id }, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }
      const ownerId = user.id || user.userId;
      const assignedUsers = await User.countDocuments({ profileId: id });
      if (assignedUsers > 0) throw new Error('Cannot delete profile assigned to active employees');

      const result = await Profile.findOneAndDelete({ _id: id, ownerId });

      if (result) {
        await logAudit('DELETE_PROFILE', user, id, 'Profile', {});
      }
      return !!result;
    },

    // --- Employee Management ---
    createEmployee: async (_, { input }, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }

      const { firstName, lastName, email, password, profileId } = input;
      const ownerId = user.id || user.userId;

      const profile = await Profile.findOne({ _id: profileId, ownerId });
      if (!profile) throw new Error('Invalid Profile ID');

      // Privilege Escalation Check (Redundant if profile creation is checked, but safe)
      const allowed = await canAssignPermissions({ id: ownerId, role: user.role }, profile.permissions);
      if (!allowed) {
        await logAudit('CREATE_EMPLOYEE', user, null, 'User', { email, error: 'Privilege Escalation via Profile' }, 'FAILURE');
        throw new Error('Cannot assign profile with permissions you do not possess');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);

      const employee = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'employee',
        parentId: ownerId,
        profileId: profile.id
      });

      await employee.save();
      await logAudit('CREATE_EMPLOYEE', user, employee.id, 'User', { email, profileId });
      return employee;
    },
    updateEmployee: async (_, { id, input }, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }

      const ownerId = user.id || user.userId;
      const employee = await User.findOne({ _id: id, parentId: ownerId });
      if (!employee) throw new Error('Employee not found');

      if (input.profileId) {
        const profile = await Profile.findOne({ _id: input.profileId, ownerId });
        if (!profile) throw new Error('Invalid Profile ID');

        const allowed = await canAssignPermissions({ id: ownerId, role: user.role }, profile.permissions);
        if (!allowed) {
          await logAudit('UPDATE_EMPLOYEE', user, id, 'User', { error: 'Privilege Escalation via Profile' }, 'FAILURE');
          throw new Error('Cannot assign profile with permissions you do not possess');
        }
        employee.profileId = input.profileId;
      }

      if (input.firstName) employee.firstName = input.firstName;
      if (input.lastName) employee.lastName = input.lastName;
      if (input.email) employee.email = input.email;
      if (input.password) employee.password = await bcrypt.hash(input.password, 10);

      await employee.save();
      await logAudit('UPDATE_EMPLOYEE', user, id, 'User', { updates: Object.keys(input) });
      return employee;
    },
    deleteEmployee: async (_, { id }, { user }) => {
      if (!user || !['admin', 'vendor'].includes(user.role)) {
        throw new Error('Forbidden');
      }
      const ownerId = user.id || user.userId;
      const result = await User.findOneAndDelete({ _id: id, parentId: ownerId });

      if (result) {
        await logAudit('DELETE_EMPLOYEE', user, id, 'User', {});
      }
      return !!result;
    }
  },
  User: {
    __resolveReference(userReference) {
      return User.findById(userReference.id);
    },
    id: (user) => user._id.toString(),
    createdAt: (user) => {
      if (!user.createdAt) return null;
      return new Date(user.createdAt).toISOString();
    },
    profileId: (user) => user.profileId ? user.profileId.toString() : null,
    parentId: (user) => user.parentId ? user.parentId.toString() : null,
    ownerId: (user) => user.ownerId ? user.ownerId.toString() : null,
    profile: async (user) => {
      if (user.profileId) {
        return await Profile.findById(user.profileId);
      }
      return null;
    },
    permissions: async (user) => {
      return await getEffectivePermissions(user);
    },
    ownerId: (user) => {
      if (['admin', 'vendor'].includes(user.role)) return user.id;
      if (user.role === 'employee') return user.parentId;
      return null;
    }
  },
};

module.exports = resolvers;
