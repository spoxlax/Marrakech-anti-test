import { gql } from '@apollo/client';

export const GET_ALL_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      title
      description
      priceAdult
      priceChild
      status
      vendorId
      duration
      images
      category
    }
  }
`;

export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!) {
    searchSuggestions(query: $query)
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id
      title
    }
  }
`;

export const GET_ACTIVITY = gql`
  query GetActivity($id: ID!) {
    activity(id: $id) {
      id
      title
      description
      priceAdult
      priceChild
      duration
      maxParticipants
      category
      images
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($id: ID!, $input: CreateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const SEARCH_ACTIVITIES = gql`
  query SearchActivities($query: String, $category: String, $minPrice: Float, $maxPrice: Float, $city: String, $minRating: Float) {
    searchActivities(query: $query, category: $category, minPrice: $minPrice, maxPrice: $maxPrice, city: $city, minRating: $minRating) {
      id
      title
      priceAdult
      duration
      images
    }
  }
`;

export const GET_ACTIVITY_AND_REVIEWS = gql`
  query GetActivityAndReviews($id: ID!) {
    activity(id: $id) {
      id
      title
      description
      priceAdult
      priceChild
      duration
      maxParticipants
      category
      images
    }
    reviews(activityId: $id) {
      id
      rating
      comment
      createdAt
      user {
        firstName
        lastName
      }
    }
  }
`;

export const MY_ACTIVITIES = gql`
  query MyActivities {
    myActivities {
      id
      title
      priceAdult
      status
      images
    }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

export const APPROVE_ACTIVITY = gql`
  mutation ApproveActivity($id: ID!) {
    approveActivity(id: $id) {
      id
      status
    }
  }
`;
