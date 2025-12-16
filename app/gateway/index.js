const { ApolloServer } = require('apollo-server');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:4001/graphql' },
      { name: 'activities', url: 'http://localhost:4002/graphql' },
      { name: 'bookings', url: 'http://localhost:4005/graphql' },
      { name: 'reviews', url: 'http://localhost:4004/graphql' },
      { name: 'payments', url: 'http://localhost:4006/graphql' },
    ],
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

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
