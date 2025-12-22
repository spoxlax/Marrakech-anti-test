import React from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const MY_ACTIVITIES = gql`
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

const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

type HostingActivityRow = {
    id: string;
    title: string;
    priceAdult: number;
    status?: string | null;
    images?: string[] | null;
};

const HostingActivities: React.FC = () => {
    const { loading, error, data } = useQuery(MY_ACTIVITIES);
    const [deleteActivity] = useMutation(DELETE_ACTIVITY, {
        refetchQueries: [{ query: MY_ACTIVITIES }]
    });

    if (loading) return <div className="p-8">Loading your listings...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message} (Are you logged in as an Admin/Vendor?)</div>;

    const activities: HostingActivityRow[] = data?.myActivities || [];

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            // Delete Activity from DB (Backend handles image deletion now)
            await deleteActivity({ variables: { id } });
        } catch (err) {
            console.error("Failed to delete activity", err);
            alert("Failed to delete activity");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Listings</h1>
                <Link to="/hosting/create" className="bg-[#FF385C] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-[#d90b3e] transition">
                    <Plus size={18} />
                    Create New
                </Link>
            </div>

            {activities.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                    <h3 className="text-lg font-medium text-gray-900">No listings yet</h3>
                    <p className="text-gray-500 mt-1 mb-6">It looks like you haven't posted any activities yet.</p>
                    <Link to="/hosting/create" className="text-[#FF385C] font-semibold hover:underline">
                        Create your first listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activities.map((activity) => (
                        <div key={activity.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                            <div className="aspect-[4/3] bg-gray-100 relative">
                                {activity.images?.[0] ? (
                                    <img src={activity.images[0]} alt={activity.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                        ${activity.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                     `}>
                                        {activity.status || 'PENDING'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate">{activity.title}</h3>
                                <p className="text-gray-500 text-sm mt-1">${activity.priceAdult} / person</p>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <Link to={`/hosting/activities/edit/${activity.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                        <Edit2 size={16} /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HostingActivities;
