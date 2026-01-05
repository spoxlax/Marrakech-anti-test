require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

const app = express();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourism-bookings')
  .then(() => console.log('MongoDB connected'))
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
          user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
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
    console.log(`🚀 Bookings Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
// Forced restart for schema update (v2)
