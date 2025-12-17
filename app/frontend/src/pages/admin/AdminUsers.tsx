import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Trash2, User as UserIcon } from 'lucide-react';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

type AdminUserRow = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string | null;
};

const AdminUsers: React.FC = () => {
    const { loading, error, data, refetch } = useQuery(GET_USERS);
    const [deleteUser] = useMutation(DELETE_USER);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser({ variables: { id } });
                refetch();
            } catch {
                alert('Error deleting user');
            }
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-gray-500 text-sm">Manage user accounts and roles.</p>
                </div>
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed opacity-50">
                    Add User
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(data?.users as AdminUserRow[] | undefined)?.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <UserIcon size={16} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`
                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                                    `}>
                                        {user.role || 'customer'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(data?.users?.length || 0) === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
