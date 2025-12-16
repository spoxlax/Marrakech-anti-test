const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const resolvers = {
  Query: {
    me: async (_, __, { token }) => {
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        return await User.findById(decoded.userId);
      } catch (err) {
        return null;
      }
    },
    users: async (_, __, { user }) => {
      // Basic admin check - optional: if (user?.role !== 'admin') throw new Error('Forbidden');
      return await User.find();
    },
  },
  Mutation: {
    deleteUser: async (_, { id }, { user }) => {
      // if (user?.role !== 'admin') throw new Error('Forbidden');
      await User.findByIdAndDelete(id);
      return true;
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
        process.env.JWT_SECRET || 'secret_key',
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
        process.env.JWT_SECRET || 'secret_key',
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
