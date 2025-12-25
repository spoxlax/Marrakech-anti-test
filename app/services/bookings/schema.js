const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type Query {
    booking(id: ID!): Booking
    myBookings: [Booking]
    vendorBookings: [Booking]
    allBookings(filter: String, search: String): [Booking]
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
    confirmationCode: String
    activity: Activity
    vendor: User
    professionalPhotos: [String]
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking
    updateBookingStatus(id: ID!, status: String!): Booking
    addBookingPhoto(bookingId: ID!, photoUrl: String!): Booking
    addBookingPhotos(bookingId: ID!, photoUrls: [String!]!): Booking
    updateBookingDetails(id: ID!, input: UpdateBookingInput!): Booking
    deleteBooking(id: ID!): Boolean
  }

  extend type Activity @key(fields: "id") {
    id: ID! @external
  }

  extend type User @key(fields: "id") {
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

  input UpdateBookingInput {
    date: String
    persons: PersonsInput
    totalPrice: Float
    status: String
    customerInfo: CustomerInfoInput
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
