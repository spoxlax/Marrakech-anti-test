const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    booking(id: ID!): Booking
    myBookings: [Booking]
    vendorBookings: [Booking]
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking
    updateBookingStatus(id: ID!, status: String!): Booking
  }

  type Booking @key(fields: "id") {
    id: ID!
    activityId: ID!
    vendorId: ID!
    customerId: ID
    customerInfo: CustomerInfo
    date: String!
    persons: Persons!
    totalPrice: Float!
    status: String!
    paymentMethod: String
    activity: Activity
  }

  extend type Activity @key(fields: "id") {
    id: ID! @external
  }

  type CustomerInfo {
    firstName: String
    lastName: String
    email: String
    phone: String
  }

  type Persons {
    adults: Int
    children: Int
  }

  input CreateBookingInput {
    activityId: ID!
    vendorId: ID!
    customerInfo: CustomerInfoInput
    date: String!
    persons: PersonsInput!
    totalPrice: Float!
    paymentMethod: String
  }

  input CustomerInfoInput {
    firstName: String
    lastName: String
    email: String
    phone: String
  }

  input PersonsInput {
    adults: Int
    children: Int
  }
`;

module.exports = { typeDefs };
