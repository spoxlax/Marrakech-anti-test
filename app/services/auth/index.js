require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const { typeDefs } = require('./schema');
const resolvers = require('./resolvers');
const seedAdmin = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());

// Critical Security Check
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourism-auth')
  .then(async () => {
    console.log('MongoDB connected');
    // Ensure admin exists
    try {
      await seedAdmin();
    } catch (e) {
      console.error("Seeding failed", e);
    }
  })
  .catch(err => console.error(err));

async function startServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    introspection: process.env.NODE_ENV !== 'production', // Disable introspection in production
    context: ({ req }) => {
      const authHeader = req.headers.authorization || '';
      let user = null;
      let token = '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
        try {
          user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        } catch (e) {
          user = null;
        }
      }
      return { user, token };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Auth Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
