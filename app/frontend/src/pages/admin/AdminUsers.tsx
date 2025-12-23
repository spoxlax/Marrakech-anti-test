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
    const [createUser] = useMutation(gql`
        mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) { id }
        }
    `);
    const [updateUser] = useMutation(gql`
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
            updateUser(id: $id, input: $input) { id }
        }
    `);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<AdminUserRow | null>(null);
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'customer'
    });

    const handleOpenModal = (user: AdminUserRow | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '', // Don't fill password on edit
                role: user.role || 'customer'
            });
        } else {
            setEditingUser(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'customer'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const input: any = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    role: formData.role
                };
                if (formData.password) {
                    input.password = formData.password;
                }
                await updateUser({ variables: { id: editingUser.id, input } });
            } else {
                await createUser({ variables: { input: formData } });
            }
            setIsModalOpen(false);
            refetch();
        } catch (err: any) {
            console.error('Save error:', err);
            const message = err.graphQLErrors?.[0]?.message || err.message;
            alert('Error saving user: ' + message);
        }
    };

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
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    Add User
                </button>
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
                                        onClick={() => handleOpenModal(user)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors mr-2"
                                    >
                                        Edit
                                    </button>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add User'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Password {editingUser && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
                                >
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
