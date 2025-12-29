import { gql } from '@apollo/client';

export const GET_PERMISSIONS_LIST = gql`
  query GetPermissionsList {
    availablePermissions {
      resource
      actions
    }
  }
`;

export const GET_MY_PROFILES = gql`
  query GetMyProfiles {
    myProfiles {
      id
      name
      description
      permissions
      createdAt
    }
  }
`;

export const CREATE_PROFILE = gql`
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      name
      description
      permissions
    }
  }
`;

export const GET_MY_EMPLOYEES = gql`
  query GetMyEmployees {
    myEmployees {
      id
      firstName
      lastName
      email
      role
      profileId
      createdAt
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      firstName
      lastName
      email
      role
      profileId
    }
  }
`;
