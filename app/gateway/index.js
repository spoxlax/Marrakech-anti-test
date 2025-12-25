const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Critical Security Check
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined. Exiting.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

console.log('Gateway starting...');

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:5001/graphql' },
      { name: 'activities', url: 'http://localhost:5002/graphql' },
      { name: 'bookings', url: 'http://localhost:5005/graphql' },
      { name: 'reviews', url: 'http://localhost:5004/graphql' },
      { name: 'payments', url: 'http://localhost:5006/graphql' },
    ],
    pollIntervalInMs: 3000,
  }),
  buildService: ({ url }) =>
    new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.token) {
          request.http.headers.set('authorization', context.token);
        }
      },
    }),
});

async function startServer() {
  const app = express();

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // Allow GraphQL Playground in dev
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors()); // Configure strict CORS in production

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);

  const server = new ApolloServer({
    gateway,
    subscriptions: false, // Apollo Gateway doesn't support subscriptions by default in v3
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
        return { token: authHeader, user };
      }
      return { token: authHeader, user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Gateway ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error(err);
});
