import React from 'react';
import { useQuery, gql } from '@apollo/client';
import ActivityCard, { type Activity } from './ActivityCard';

const GET_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      title
      description
      priceAdult
      priceChild
      vendorId
      duration
      images
    }
  }
`;

interface ActivityListProps {
  limit?: number;
  className?: string;
  activities?: Activity[]; // Optional prop to pass generic activities
}

const ActivityList: React.FC<ActivityListProps> = ({ limit, className, activities: propActivities }) => {
  const { loading, error, data } = useQuery(GET_ACTIVITIES, {
    skip: !!propActivities
  });

  const activities = propActivities || data?.activities;

  if (!propActivities && loading) return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 pt-24 px-4 sm:px-8 ${className}`}>
      {[...Array(limit || 10)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="bg-gray-200 rounded-xl aspect-square"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  if (!propActivities && error) return (
    <div className="pt-24 text-center text-red-500">
      Error loading activities: {error.message}
    </div>
  );

  const displayActivities = limit ? activities?.slice(0, limit) : activities;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 ${className}`}>
      {displayActivities?.map((activity: Activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivityList;
