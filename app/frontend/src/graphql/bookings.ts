import { gql } from '@apollo/client';

export const ADMIN_BOOKINGS = gql`
  query AdminBookings($search: String) {
    allBookings(search: $search) {
        id
        activityId
        date
        confirmationCode
      persons {
            adults
            children
        }
        totalPrice
        status
      customerInfo {
            firstName
            lastName
            email
            phone
        }
      activity {
            title
        }
      vendor {
            id
            role
        }
        professionalPhotos
    }
}
`;

export const VENDOR_BOOKINGS = gql`
  query VendorBookings {
    vendorBookings {
        id
        activityId
        date
        confirmationCode
      persons {
            adults
            children
        }
        totalPrice
        status
      customerInfo {
            firstName
            lastName
            email
            phone
        }
      activity {
            title
        }
        professionalPhotos
    }
}
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
        id
        status
    }
}
`;

export const ADD_BOOKING_PHOTOS = gql`
  mutation AddBookingPhotos($bookingId: ID!, $photoUrls: [String!]!) {
    addBookingPhotos(bookingId: $bookingId, photoUrls: $photoUrls) {
        id
        professionalPhotos
    }
}
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
}
`;

export const UPDATE_BOOKING_DETAILS = gql`
  mutation UpdateBookingDetails($id: ID!, $input: UpdateBookingInput!) {
    updateBookingDetails(id: $id, input: $input) {
        id
        date
      persons {
            adults
            children
        }
        totalPrice
        status
    }
}
`;

export const GET_MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      date
      status
      totalPrice
      paymentMethod
      confirmationCode
      activity {
        id
        title
        images
        city
      }
      professionalPhotos
    }
  }
`;

export const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($id: ID!) {
    booking(id: $id) {
      id
      date
      status
      totalPrice
      paymentMethod
      confirmationCode
      persons {
          adults
          children
      }
      customerInfo {
          firstName
          lastName
          email
          phone
      }
      activity {
        id
        title
        images
        city
        description
      }
      professionalPhotos
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      paymentMethod
    }
  }
`;

export const GET_ACTIVITY_AND_USER = gql`
  query GetActivityAndUser($id: ID!) {
    activity(id: $id) {
      id
      title
      priceAdult
      priceChild
      images
      vendorId
    }
    me {
      id
      email
      firstName
      lastName
    }
  }
`;

