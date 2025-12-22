const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    activities: [Activity]
    activity(id: ID!): Activity
    searchActivities(query: String, category: String, minPrice: Float, maxPrice: Float, city: String, minRating: Float): [Activity]
    searchSuggestions(query: String!): [String]
    myActivities: [Activity]
    categories: [Category!]!
  }

  extend type Mutation {
    createActivity(input: CreateActivityInput!): Activity
    updateActivity(id: ID!, input: CreateActivityInput!): Activity
    approveActivity(id: ID!): Activity
    deleteActivity(id: ID!): Boolean
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }

  type Activity @key(fields: "id") {
    id: ID!
    vendorId: ID!
    title: String!
    description: String!
    priceAdult: Float!
    priceChild: Float!
    duration: String!
    maxParticipants: Int!
    category: String!
    city: String
    averageRating: Float
    images: [String]
    status: String # PENDING, APPROVED
  }

  type Category @key(fields: "id") {
    id: ID!
    name: String!
    icon: String
    order: Int
    isActive: Boolean!
  }

  input CreateActivityInput {
    title: String!
    description: String!
    priceAdult: Float!
    priceChild: Float!
    duration: String!
    maxParticipants: Int!
    category: String!
    city: String
    images: [String]
  }

  input CategoryInput {
    name: String!
    icon: String
    order: Int
    isActive: Boolean
  }
`;

module.exports = { typeDefs };
