import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, User, X, Mail, Shield } from 'lucide-react';
import { GET_MY_EMPLOYEES, CREATE_EMPLOYEE, GET_MY_PROFILES } from '../../graphql/company';

const HostingTeam: React.FC = () => {
  const { data: employeesData, loading: employeesLoading, error: employeesError } = useQuery(GET_MY_EMPLOYEES);
  const { data: profilesData } = useQuery(GET_MY_PROFILES);
  
  const [createEmployee, { loading: creating }] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_MY_EMPLOYEES }],
    onCompleted: () => {
      setIsCreating(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', profileId: '' });
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profileId: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createEmployee({ variables: { input: formData } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create employee');
    }
  };

  if (employeesLoading) return <div className="p-8">Loading...</div>;
  if (employeesError) return <div className="p-8 text-red-500">Error: {employeesError.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Management</h1>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#FF385C] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-[#d90b3e] transition"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">New Employee</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{errorMsg}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Profile</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none bg-white"
                value={formData.profileId}
                onChange={e => setFormData({ ...formData, profileId: e.target.value })}
              >
                <option value="">Select a profile...</option>
                {profilesData?.myProfiles?.map((profile: any) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              {profilesData?.myProfiles?.length === 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  You need to create a profile first.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-[#FF385C] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d90b3e] transition disabled:opacity-50"
              >
                {creating ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Employee</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Email</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Role/Profile</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employeesData?.myEmployees?.map((employee: any) => {
                 const profileName = profilesData?.myProfiles?.find((p: any) => p.id === employee.profileId)?.name || 'Unknown Profile';
                 return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-gray-400" />
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {profileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(parseInt(employee.createdAt)).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {employeesData?.myEmployees?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No employees added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HostingTeam;
