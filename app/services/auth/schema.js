const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
  }

  extend type Mutation {
    signup(input: SignupInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    deleteUser(id: ID!): Boolean
  }

  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
  }

  input SignupInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String # Optional, defaults to customer
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = { typeDefs };
