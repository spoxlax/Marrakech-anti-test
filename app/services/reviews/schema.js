const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    reviews(activityId: ID!): [Review]
    myReviews: [Review]
  }

  extend type Mutation {
    createReview(input: CreateReviewInput!): Review
  }

  type Review @key(fields: "id") {
    id: ID!
    bookingId: ID!
    activityId: ID!
    vendorId: ID!
    customerId: ID!
    rating: Int!
    comment: String!
    createdAt: String!
    user: User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  input CreateReviewInput {
    bookingId: ID!
    activityId: ID!
    vendorId: ID!
    rating: Int!
    comment: String!
  }
`;

module.exports = { typeDefs };
