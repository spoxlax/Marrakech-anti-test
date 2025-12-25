const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());

// Critical Security Check
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined. Using insecure default for development only.");
  // In production, you might want to exit: process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourism-auth')
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
          user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
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
    console.log(`🚀 Auth Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
