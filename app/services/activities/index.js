const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
const Activity = require('./models/Activity');
const Category = require('./models/Category');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

async function seedCategoriesIfEmpty() {
  const count = await Category.countDocuments();
  if (count > 0) {
    return;
  }

  const categories = [
    { name: 'Camping', icon: 'tent', order: 10 },
    { name: 'Camel Tours', icon: 'palmtree', order: 20 },
    { name: 'Quad Tours', icon: 'mountain', order: 30 },
    { name: 'Buggy Tours', icon: 'car', order: 40 },
    { name: 'Hiking', icon: 'mountain', order: 50 },
    { name: 'Tours', icon: 'camera', order: 60 },
  ];

  await Category.insertMany(categories);
}

async function seedActivitiesIfEmpty() {
  const count = await Activity.countDocuments();
  if (count > 0) {
    return;
  }

  const vendorId = new mongoose.Types.ObjectId();

  const activities = [
    {
      vendorId,
      title: 'Sunset Camel Ride in the Desert',
      description: 'Guided camel trek during golden hour with a mint tea stop at a desert camp.',
      priceAdult: 45,
      priceChild: 25,
      duration: '2h',
      maxParticipants: 12,
      category: 'Camel Tours',
      images: [
        'https://images.pexels.com/photos/2403205/pexels-photo-2403205.jpeg',
      ],
    },
    {
      vendorId,
      title: 'Half‑Day Quad Adventure on Sand Dunes',
      description: 'Off‑road quad biking through desert dunes with safety briefing and photo stops.',
      priceAdult: 75,
      priceChild: 40,
      duration: '4h',
      maxParticipants: 16,
      category: 'Quad Tours',
      images: [
        'https://images.pexels.com/photos/3185485/pexels-photo-3185485.jpeg',
      ],
    },
    {
      vendorId,
      title: 'Early Morning Buggy Experience',
      description: 'Thrilling buggy ride at sunrise with panoramic viewpoints and light breakfast.',
      priceAdult: 90,
      priceChild: 50,
      duration: '3h',
      maxParticipants: 10,
      category: 'Buggy Tours',
      images: [
        'https://images.pexels.com/photos/804128/pexels-photo-804128.jpeg',
      ],
    },
    {
      vendorId,
      title: 'Sahara Luxury Camp with Dinner & Show',
      description: 'Overnight stay in a desert camp with traditional dinner, live music, and stargazing.',
      priceAdult: 150,
      priceChild: 80,
      duration: '1 night',
      maxParticipants: 20,
      category: 'Camping',
      images: [
        'https://images.pexels.com/photos/2403204/pexels-photo-2403204.jpeg',
      ],
    },
  ];

  await Activity.insertMany(activities);
  console.log(`Seeded ${activities.length} demo activities`);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourism-activities')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      await seedCategoriesIfEmpty();
      await seedActivitiesIfEmpty();
    } catch (error) {
      console.error('Failed to seed demo activities', error);
    }
  })
  .catch(err => console.error(err));

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    introspection: true,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || '';
      let user = null;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        } catch (e) {
          user = null;
        }
      }
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Activities Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
