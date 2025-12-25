const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const resolvers = {
  Query: {
    me: async (_, __, { token }) => {
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        return await User.findById(decoded.userId);
      } catch (err) {
        return null;
      }
    },
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Forbidden: Admins only');
      }
      return await User.find();
    },
  },
  Mutation: {
    deleteUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Forbidden: Admins only');
      }
      await User.findByIdAndDelete(id);
      return true;
    },
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

      return await newUser.save();
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
      return updatedUser;
    },
    signup: async (_, { input }) => {
      const { firstName, lastName, email, password, role } = input;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'customer',
      });

      await user.save();

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user };
    },
    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user };
    },
  },
  User: {
    __resolveReference(userReference) {
      return User.findById(userReference.id);
    },
  },
};

module.exports = { resolvers };
