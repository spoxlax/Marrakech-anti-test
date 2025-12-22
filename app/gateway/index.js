const { ApolloServer } = require('apollo-server');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Manual dotenv loading
const dotenvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
  try {
    const envConfig = require('dotenv').parse(fs.readFileSync(dotenvPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  } catch (e) {
    console.error('Failed to parse .env:', e);
  }
}

// Fallback for critical variables if dotenv failed
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment, using default.');
  process.env.JWT_SECRET = 'supersecretkey123';
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

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

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    let user = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        if (!process.env.JWT_SECRET) {
          console.error("FATAL: JWT_SECRET is not defined.");
          throw new Error("Misconfiguration");
        }
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        user = null;
      }
      return { token: authHeader, user };
    }
    return { token: authHeader, user };
  },
});

const PORT = process.env.PORT || 5000;

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
