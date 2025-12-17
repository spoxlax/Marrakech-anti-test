import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Check, Edit2, Trash2, Clock, Plus } from 'lucide-react';

const GET_ALL_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      title
      priceAdult
      status
      vendorId
    }
  }
`;

const APPROVE_ACTIVITY = gql`
  mutation ApproveActivity($id: ID!) {
    approveActivity(id: $id) {
      id
      status
    }
  }
`;

const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

type AdminActivityRow = {
    id: string;
    title: string;
    priceAdult: number;
    status?: string | null;
    vendorId?: string | null;
};

const AdminActivities: React.FC = () => {
    const { loading, error, data, refetch } = useQuery(GET_ALL_ACTIVITIES);
    const [approveActivity] = useMutation(APPROVE_ACTIVITY);
    const [deleteActivity] = useMutation(DELETE_ACTIVITY);

    const handleApprove = async (id: string) => {
        try {
            await approveActivity({ variables: { id } });
            refetch();
        } catch {
            alert('Error approving activity');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this activity permanently?')) {
            try {
                await deleteActivity({ variables: { id } });
                refetch();
            } catch {
                alert('Error deleting activity');
            }
        }
    };

    if (loading) return <div className="p-8">Loading activities...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const activities: AdminActivityRow[] = data?.activities || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Activity Moderation</h1>
                    <p className="text-gray-500 text-sm">Approve or reject vendor submissions.</p>
                </div>
                <Link to="/admin/activities/create" className="bg-black text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:opacity-80 transition">
                    <Plus size={18} />
                    Create Activity
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{activity.title}</td>
                                <td className="px-6 py-4 text-gray-600">${activity.priceAdult}</td>
                                <td className="px-6 py-4">
                                    {activity.status === 'APPROVED' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Check size={12} /> Approved
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Clock size={12} /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    {activity.status !== 'APPROVED' && (
                                        <button
                                            onClick={() => handleApprove(activity.id)}
                                            className="p-1 px-3 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    <Link
                                        to={`/admin/activities/edit/${activity.id}`}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {activities.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No activities found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivities;
