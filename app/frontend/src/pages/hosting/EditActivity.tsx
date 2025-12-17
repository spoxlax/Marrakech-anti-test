import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Upload, X, Loader } from 'lucide-react';

const GET_ACTIVITY = gql`
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

const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($id: ID!, $input: CreateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id
      title
    }
  }
`;

const EditActivity = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch existing data
    const { data, loading: fetchLoading, error: fetchError } = useQuery(GET_ACTIVITY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only' // Ensure fresh data
    });

    const [updateActivity, { loading: updateLoading }] = useMutation(UPDATE_ACTIVITY);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAdult: '',
        priceChild: '',
        duration: '',
        maxParticipants: '',
        category: 'Tours',
        images: [] as string[]
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (data?.activity) {
            const act = data.activity;
            setFormData({
                title: act.title,
                description: act.description,
                priceAdult: act.priceAdult.toString(),
                priceChild: act.priceChild.toString(),
                duration: act.duration,
                maxParticipants: act.maxParticipants.toString(),
                category: act.category,
                images: act.images || []
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Mock upload logic (replace with real upload service if needed, or use existing one)
        // For now, assuming direct upload to service or reusing logic from CreateActivity

        const uploadPromises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:4007/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                return data.url;
            } catch (error) {
                console.error("Upload failed", error);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...urls.filter((url): url is string => url !== null)]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateActivity({
                variables: {
                    id,
                    input: {
                        title: formData.title,
                        description: formData.description,
                        priceAdult: parseFloat(formData.priceAdult),
                        priceChild: parseFloat(formData.priceChild),
                        duration: formData.duration,
                        maxParticipants: parseInt(formData.maxParticipants),
                        category: formData.category,
                        images: formData.images
                    }
                }
            });
            // Go back
            navigate(-1);
        } catch (err) {
            console.error('Failed to update activity', err);
            alert('Failed to update activity');
        }
    };

    if (fetchLoading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;
    if (fetchError) return <div className="p-10 text-red-500">Error loading activity.</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold mb-8">Edit Activity</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
                            <option>Camping</option>
                            <option>Camel Tours</option>
                            <option>Quad Tours</option>
                            <option>Buggy Tours</option>
                            <option>Hiking</option>
                            <option>Tours</option>
                            <option>Desert</option>
                            <option>Cultural</option>
                            <option>Nature</option>
                            <option>Adventure</option>
                            <option>Food</option>
                            <option>Sport</option>
                            <option>Workshops</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-32" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Adult Price ($)</label>
                        <input type="number" name="priceAdult" value={formData.priceAdult} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Child Price ($)</label>
                        <input type="number" name="priceChild" value={formData.priceChild} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration</label>
                        <input name="duration" value={formData.duration} onChange={handleChange} className="w-full border p-2 rounded" required placeholder="e.g. 2 hours" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Max Participants</label>
                        <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                                <img src={url} alt="Activity" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black aspect-square">
                            <Upload className="mb-2 text-gray-400" />
                            <span className="text-xs text-gray-500">Upload</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={updateLoading} className="px-6 py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50">
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditActivity;
