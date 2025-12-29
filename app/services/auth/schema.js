const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
    myProfiles: [Profile]
    myEmployees: [User]
    availablePermissions: [PermissionGroup]
    profile(id: ID!): Profile
  }

  extend type Mutation {
    signup(input: SignupInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    deleteUser(id: ID!): Boolean
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
    
    # Profile Management
    createProfile(input: CreateProfileInput!): Profile
    updateProfile(id: ID!, input: UpdateProfileInput!): Profile
    deleteProfile(id: ID!): Boolean
    
    # Employee Management
    createEmployee(input: CreateEmployeeInput!): User
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): User
    deleteEmployee(id: ID!): Boolean
  }

  type PermissionGroup {
    resource: String!
    actions: [String!]!
  }

  type Profile @key(fields: "id") {
    id: ID!
    name: String!
    description: String
    permissions: [String]!
    ownerId: ID!
    createdAt: String
  }

  input CreateProfileInput {
    name: String!
    description: String
    permissions: [String]!
  }

  input UpdateProfileInput {
    name: String
    description: String
    permissions: [String]
  }

  input CreateEmployeeInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    profileId: ID!
  }

  input UpdateEmployeeInput {
    firstName: String
    lastName: String
    email: String
    password: String
    profileId: ID
    active: Boolean
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
    parentId: ID
    profileId: ID
    profile: Profile
    permissions: [String]
    ownerId: ID
    createdAt: String
  }

  input SignupInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String
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
