const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    payment(id: ID!): Payment
    myPayments: [Payment]
  }

  extend type Mutation {
    createPayment(input: CreatePaymentInput!): Payment
    updatePaymentStatus(id: ID!, status: String!): Payment
  }

  type Payment @key(fields: "id") {
    id: ID!
    bookingId: ID!
    amount: Float!
    currency: String!
    method: String!
    status: String!
    transactionId: String
    createdAt: String!
  }

  input CreatePaymentInput {
    bookingId: ID!
    amount: Float!
    currency: String
    method: String!
    transactionId: String
  }
`;

module.exports = { typeDefs };
