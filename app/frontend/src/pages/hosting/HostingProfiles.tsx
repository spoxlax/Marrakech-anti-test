import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Users, Check, X } from 'lucide-react';
import { GET_MY_PROFILES, GET_PERMISSIONS_LIST, CREATE_PROFILE } from '../../graphql/company';

const HostingProfiles: React.FC = () => {
  const { data: profilesData, loading: profilesLoading, error: profilesError } = useQuery(GET_MY_PROFILES);
  const { data: permissionsData, loading: permissionsLoading } = useQuery(GET_PERMISSIONS_LIST);
  const [createProfile, { loading: creating }] = useMutation(CREATE_PROFILE, {
    refetchQueries: [{ query: GET_MY_PROFILES }],
    onCompleted: () => {
      setIsCreating(false);
      setFormData({ name: '', description: '', permissions: [] });
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleTogglePermission = (resource: string, action: string) => {
    const permString = `${resource}:${action}`;
    setFormData(prev => {
      const exists = prev.permissions.includes(permString);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permString) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permString] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createProfile({ variables: { input: formData } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create profile');
    }
  };

  if (profilesLoading || permissionsLoading) return <div className="p-8">Loading...</div>;
  if (profilesError) return <div className="p-8 text-red-500">Error: {profilesError.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Profiles</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#FF385C] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-[#d90b3e] transition"
          >
            <Plus size={18} />
            Create Profile
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">New Profile</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{errorMsg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Manager, Sales Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
              <div className="space-y-4">
                {permissionsData?.availablePermissions?.map((group: any) => (
                  <div key={group.resource} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 capitalize mb-3">{group.resource}</h3>
                    <div className="flex flex-wrap gap-3">
                      {group.actions.map((action: string) => {
                        const permString = `${group.resource}:${action}`;
                        const isChecked = formData.permissions.includes(permString);
                        return (
                          <label key={action} className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-colors
                            ${isChecked
                              ? 'bg-[#FF385C]/10 border-[#FF385C] text-[#FF385C]'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}
                          `}>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(group.resource, action)}
                            />
                            {isChecked && <Check size={14} />}
                            <span className="capitalize">{action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
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
                {creating ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profilesData?.myProfiles?.map((profile: any) => (
            <div key={profile.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#FF385C]/10 text-[#FF385C] rounded-lg">
                  <Users size={24} />
                </div>
                {/* Could add edit/delete actions here */}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">{profile.description || 'No description'}</p>

              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Permissions</div>
                <div className="flex flex-wrap gap-1">
                  {profile.permissions.slice(0, 5).map((p: string) => (
                    <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {p.split(':')[1]} ({p.split(':')[0]})
                    </span>
                  ))}
                  {profile.permissions.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      +{profile.permissions.length - 5} more
                    </span>
                  )}
                  {profile.permissions.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No permissions</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {profilesData?.myProfiles?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No profiles created yet. Create one to start adding employees.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostingProfiles;
