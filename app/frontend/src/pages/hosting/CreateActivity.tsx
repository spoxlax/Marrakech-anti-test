import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Loader } from 'lucide-react';

const CREATE_ACTIVITY = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id
      title
    }
  }
`;

const CreateActivity: React.FC = () => {
    const navigate = useNavigate();
    const [createActivity, { loading, error }] = useMutation(CREATE_ACTIVITY);
    const [uploading, setUploading] = useState(false);

    // Simple state management for form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Cultural',
        priceAdult: '',
        priceChild: '0',
        duration: '2 hours',
        maxParticipants: '10',
        imageUrl: '' // Only supporting one image URL for simplicity initially
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createActivity({
                variables: {
                    input: {
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        priceAdult: parseFloat(formData.priceAdult),
                        priceChild: parseFloat(formData.priceChild),
                        duration: formData.duration,
                        maxParticipants: parseInt(formData.maxParticipants),
                        images: formData.imageUrl ? [formData.imageUrl] : []
                    }
                }
            });
            navigate('/hosting/listings');
        } catch (err) {
            console.error("Failed to create activity", err);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create a New Activity</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                        placeholder="e.g. Sunset Camel Ride in the Desert"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                            value={formData.category}
                            onChange={handleChange}
                        >
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
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                            type="text"
                            name="duration"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                            placeholder="e.g. 3 hours"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                        placeholder="Describe your activity..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Adult ($)</label>
                        <input
                            type="number"
                            name="priceAdult"
                            required
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                            placeholder="0.00"
                            value={formData.priceAdult}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Child ($)</label>
                        <input
                            type="number"
                            name="priceChild"
                            required
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                            placeholder="0.00"
                            value={formData.priceChild}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                        <input
                            type="number"
                            name="maxParticipants"
                            required
                            min="1"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="space-y-3">
                        {/* Image Preview */}
                        {formData.imageUrl && (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-gray-600 hover:text-red-500 shadow-sm"
                                >
                                    <ImagePlus size={16} className="rotate-45" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="url"
                                name="imageUrl"
                                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={handleChange}
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setUploading(true);
                                        const uploadData = new FormData();
                                        uploadData.append('file', file);

                                        try {
                                            const response = await fetch('http://localhost:4007/upload', {
                                                method: 'POST',
                                                body: uploadData,
                                            });

                                            if (!response.ok) throw new Error('Upload failed');

                                            const data = await response.json();
                                            setFormData({ ...formData, imageUrl: data.url });
                                        } catch (error) {
                                            console.error('Error uploading file:', error);
                                            alert('Failed to upload image. Please try again.');
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {uploading ? <Loader className="animate-spin" size={20} /> : <ImagePlus size={20} />}
                                    <span className="ml-2 hidden sm:inline">Upload</span>
                                </label>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Enter a URL or upload an image directly.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error.message}
                    </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/hosting/listings')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#FF385C] text-white rounded-lg font-bold hover:bg-[#d90b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C] disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : 'Publish Activity'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateActivity;
