import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Upload, X, Loader } from 'lucide-react';

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

type EditActivityQueryData = {
    activity: {
        id: string;
        title: string;
        description: string;
        priceAdult: number;
        priceChild: number;
        duration: string;
        maxParticipants: number;
        category: string;
        images?: string[] | null;
    };
};

const EditActivity = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: categoriesData } = useQuery(GET_CATEGORIES);

    // Fetch existing data
    const { loading: fetchLoading, error: fetchError } = useQuery<EditActivityQueryData>(GET_ACTIVITY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only',
        onCompleted: (result) => {
            const act = result?.activity;
            if (!act) return;
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
            setCategoryInput(act.category);
        }
    });

    const [updateActivity, { loading: updateLoading }] = useMutation(UPDATE_ACTIVITY);
    const [createCategory, { loading: creatingCategory }] = useMutation(CREATE_CATEGORY, {
        refetchQueries: [{ query: GET_CATEGORIES }],
    });

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
    const [categoryInput, setCategoryInput] = useState('');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [highlightedCategoryIndex, setHighlightedCategoryIndex] = useState(-1);
    const categoryPickerRef = useRef<HTMLDivElement | null>(null);

    const activeCategoryNames = useMemo(() => {
        return ((categoriesData?.categories ?? []) as Array<{ name: string }>).map((c) => c.name);
    }, [categoriesData]);

    const selectedCategoryName = useMemo(() => {
        const trimmed = categoryInput.trim();
        if (!trimmed) return '';
        const match = activeCategoryNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
        return match || '';
    }, [activeCategoryNames, categoryInput]);

    const isCategoryValid = activeCategoryNames.length === 0 || selectedCategoryName.length > 0;

    const displayCategoryNames = useMemo(() => {
        const trimmed = categoryInput.trim();
        const base = activeCategoryNames;
        const q = trimmed.toLowerCase();
        if (!q) return base;
        const startsWith: string[] = [];
        const contains: string[] = [];
        for (const name of base) {
            const lower = name.toLowerCase();
            if (lower.startsWith(q)) startsWith.push(name);
            else if (lower.includes(q)) contains.push(name);
        }
        return [...startsWith, ...contains];
    }, [activeCategoryNames, categoryInput]);

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
        const existing = activeCategoryNames.find((n) => n.toLowerCase() === name.toLowerCase());
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Mock upload logic (replace with real upload service if needed, or use existing one)
        // For now, assuming direct upload to service or reusing logic from CreateActivity

        const uploadPromises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:5007/upload', {
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
            if (activeCategoryNames.length > 0 && !selectedCategoryName) return;
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
                        category: selectedCategoryName || formData.category,
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
                                    const match = activeCategoryNames.find((n) => n.toLowerCase() === trimmed.toLowerCase());
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
                                            const max = displayCategoryNames.length - 1;
                                            if (max < 0) return -1;
                                            return Math.min(prev < 0 ? 0 : prev + 1, max);
                                        });
                                        return;
                                    }

                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setIsCategoryOpen(true);
                                        setHighlightedCategoryIndex((prev) => {
                                            const max = displayCategoryNames.length - 1;
                                            if (max < 0) return -1;
                                            return Math.max((prev < 0 ? max : prev - 1), 0);
                                        });
                                        return;
                                    }

                                    if (e.key === 'Enter') {
                                        const highlighted = displayCategoryNames[highlightedCategoryIndex];
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
                                className="w-full border p-2 rounded"
                                placeholder="Type to search or add a category"
                            />
                            {isCategoryOpen && (displayCategoryNames.length > 0 || categoryInput.trim().length > 0) && (
                                <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                    <div className="max-h-72 overflow-auto">
                                        {displayCategoryNames.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No matching categories.
                                            </div>
                                        ) : (
                                            displayCategoryNames.map((name, index) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onMouseDown={(ev) => {
                                                        ev.preventDefault();
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
                                                onMouseDown={(ev) => {
                                                    ev.preventDefault();
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
                    <button type="submit" disabled={updateLoading || !isCategoryValid} className="px-6 py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50">
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditActivity;
