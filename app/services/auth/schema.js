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
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    password: String
    role: String
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
