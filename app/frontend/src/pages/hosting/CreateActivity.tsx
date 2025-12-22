import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Loader } from 'lucide-react';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

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
    const [createCategory, { loading: creatingCategory }] = useMutation(CREATE_CATEGORY, {
        refetchQueries: [{ query: GET_CATEGORIES }],
    });
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
        images: [] as string[]
    });

    const [categoryInput, setCategoryInput] = useState(formData.category);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [highlightedCategoryIndex, setHighlightedCategoryIndex] = useState(-1);
    const categoryPickerRef = useRef<HTMLDivElement | null>(null);

    const { data: categoriesData } = useQuery(GET_CATEGORIES, {
        onCompleted: (result) => {
            const names = (result?.categories ?? []).map((c: { name: string }) => c.name);
            if (names.length === 0) return;
            setFormData((prev) => {
                const nextCategory = names.includes(prev.category) ? prev.category : names[0];
                setCategoryInput(nextCategory);
                return { ...prev, category: nextCategory };
            });
        }
    });

    const categoryNames = useMemo(() => {
        return ((categoriesData?.categories ?? []) as Array<{ name: string }>).map((c) => c.name);
    }, [categoriesData]);

    const selectedCategoryName = useMemo(() => {
        const trimmed = categoryInput.trim();
        if (!trimmed) return '';
        const match = categoryNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
        return match || '';
    }, [categoryInput, categoryNames]);

    const isCategoryValid = categoryNames.length === 0 || selectedCategoryName.length > 0;

    const filteredCategoryNames = useMemo(() => {
        const q = categoryInput.trim().toLowerCase();
        if (!q) return categoryNames;
        const startsWith: string[] = [];
        const contains: string[] = [];
        for (const name of categoryNames) {
            const lower = name.toLowerCase();
            if (lower.startsWith(q)) startsWith.push(name);
            else if (lower.includes(q)) contains.push(name);
        }
        return [...startsWith, ...contains];
    }, [categoryInput, categoryNames]);

    useEffect(() => {
        if (!isCategoryOpen) return;

        const handleMouseDown = (ev: MouseEvent) => {
            const el = categoryPickerRef.current;
            if (!el) return;
            if (ev.target instanceof Node && !el.contains(ev.target)) {
                setIsCategoryOpen(false);
                setHighlightedCategoryIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isCategoryOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectCategory = (name: string) => {
        setCategoryInput(name);
        setFormData((prev) => ({ ...prev, category: name }));
        setIsCategoryOpen(false);
        setHighlightedCategoryIndex(-1);
    };

    const handleAddCategory = async () => {
        const name = categoryInput.trim();
        if (!name) return;
        const existing = categoryNames.find((n) => n.toLowerCase() === name.toLowerCase());
        if (existing) {
            handleSelectCategory(existing);
            return;
        }
        try {
            await createCategory({ variables: { input: { name } } });
            handleSelectCategory(name);
        } catch {
            return;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (categoryNames.length > 0 && !selectedCategoryName) return;
            await createActivity({
                variables: {
                    input: {
                        title: formData.title,
                        description: formData.description,
                        category: selectedCategoryName || formData.category,
                        priceAdult: parseFloat(formData.priceAdult),
                        priceChild: parseFloat(formData.priceChild),
                        duration: formData.duration,
                        maxParticipants: parseInt(formData.maxParticipants),
                        images: formData.images
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

            {categoriesData?.categories?.length === 0 && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    No categories found. Create one as an admin/vendor to continue.
                </div>
            )}

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
                        <div ref={categoryPickerRef} className="relative">
                            <input
                                name="category"
                                value={categoryInput}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setCategoryInput(next);
                                    setIsCategoryOpen(true);
                                    setHighlightedCategoryIndex(0);
                                    const trimmed = next.trim();
                                    const match = categoryNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
                                    setFormData((prev) => ({ ...prev, category: match || trimmed }));
                                }}
                                onFocus={() => {
                                    setIsCategoryOpen(true);
                                    setHighlightedCategoryIndex(0);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsCategoryOpen(false);
                                        setHighlightedCategoryIndex(-1);
                                        return;
                                    }

                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setIsCategoryOpen(true);
                                        setHighlightedCategoryIndex((prev) => {
                                            const max = filteredCategoryNames.length - 1;
                                            if (max < 0) return -1;
                                            return Math.min(prev < 0 ? 0 : prev + 1, max);
                                        });
                                        return;
                                    }

                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setIsCategoryOpen(true);
                                        setHighlightedCategoryIndex((prev) => {
                                            const max = filteredCategoryNames.length - 1;
                                            if (max < 0) return -1;
                                            return Math.max((prev < 0 ? max : prev - 1), 0);
                                        });
                                        return;
                                    }

                                    if (e.key === 'Enter') {
                                        const highlighted = filteredCategoryNames[highlightedCategoryIndex];
                                        const typed = categoryInput.trim();
                                        if (isCategoryOpen && highlighted) {
                                            e.preventDefault();
                                            handleSelectCategory(highlighted);
                                            return;
                                        }
                                        if (!selectedCategoryName && typed.length > 0) {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }
                                }}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF385C] focus:ring-[#FF385C] sm:text-sm p-2.5 border"
                                placeholder="Type to search or add a category"
                            />

                            {isCategoryOpen && (filteredCategoryNames.length > 0 || categoryInput.trim().length > 0) && (
                                <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                    <div className="max-h-72 overflow-auto">
                                        {filteredCategoryNames.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No matching categories.
                                            </div>
                                        ) : (
                                            filteredCategoryNames.map((name, index) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSelectCategory(name);
                                                    }}
                                                    onMouseEnter={() => setHighlightedCategoryIndex(index)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 ${index === highlightedCategoryIndex ? 'bg-neutral-50' : ''}`}
                                                >
                                                    {name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    {!selectedCategoryName && categoryInput.trim().length > 0 && (
                                        <div className="border-t border-gray-100 p-2">
                                            <button
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleAddCategory();
                                                }}
                                                disabled={creatingCategory}
                                                className="w-full px-4 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                                            >
                                                {creatingCategory ? 'Adding…' : `Add "${categoryInput.trim()}"`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isCategoryValid && (
                            <div className="mt-2 text-xs text-red-600">
                                Select an existing category or add it first.
                            </div>
                        )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {(formData.images || []).map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                    className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-gray-600 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ImagePlus size={16} className="rotate-45" />
                                </button>
                            </div>
                        ))}

                        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF385C] aspect-square transition-colors">
                            {uploading ? (
                                <Loader className="animate-spin text-[#FF385C]" />
                            ) : (
                                <>
                                    <ImagePlus className="mb-2 text-gray-400" />
                                    <span className="text-xs text-gray-500">Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;

                                    setUploading(true);

                                    const uploadPromises = Array.from(files).map(async (file) => {
                                        const uploadData = new FormData();
                                        uploadData.append('file', file);

                                        try {
                                            const response = await fetch('http://localhost:5007/upload', {
                                                method: 'POST',
                                                body: uploadData,
                                            });
                                            if (!response.ok) throw new Error('Upload failed');
                                            const data = await response.json();
                                            return data.url;
                                        } catch (error) {
                                            console.error("Upload failed", error);
                                            return null;
                                        }
                                    });

                                    const urls = await Promise.all(uploadPromises);
                                    const validUrls = urls.filter((url): url is string => url !== null);

                                    setFormData(prev => ({
                                        ...prev,
                                        images: [...prev.images, ...validUrls]
                                    }));
                                    setUploading(false);
                                }}
                            />
                        </label>
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
                        disabled={loading || !isCategoryValid}
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
