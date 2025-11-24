import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      title
      description
      priceAdult
    }
  }
`;

const ActivityList: React.FC = () => {
    const { loading, error, data } = useQuery(GET_ACTIVITIES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.activities.map((activity: any) => (
                    <div key={activity.id} className="border p-4 rounded shadow">
                        <h3 className="text-xl font-semibold">{activity.title}</h3>
                        <p className="text-gray-600">{activity.description}</p>
                        <p className="text-green-600 font-bold mt-2">${activity.priceAdult}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;
