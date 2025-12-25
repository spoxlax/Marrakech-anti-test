import React, { useRef, useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import axios from 'axios';

interface PhotoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (photoUrls: string[]) => Promise<void>;
    bookingId: string;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setSelectedFiles(Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/')));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        setIsUploading(true);
        setUploadError(null);

        try {
            const uploadedUrls: string[] = [];
            const token = localStorage.getItem('token');

            // Upload files sequentially or in parallel
            // For simplicity and error handling, using Promise.all might fail all if one fails.
            // Let's do parallel but robustly.

            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const res = await axios.post('http://localhost:5007/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return res.data.url;
            });

            const results = await Promise.all(uploadPromises);
            const validUrls = results.filter((url): url is string => typeof url === 'string' && url.length > 0);
            uploadedUrls.push(...validUrls);

            if (uploadedUrls.length === 0) {
                throw new Error("No valid photo URLs received from upload service.");
            }

            await onUpload(uploadedUrls);
            onClose();
            setSelectedFiles([]);
        } catch (err: any) {
            console.error("Upload error", err);
            // Extract error message from JSON response if available
            let errorMessage = "Failed to upload photos. Please try again.";

            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            // Fallback for HTML error responses (e.g., from unhandled server crashes)
            if (errorMessage.trim().startsWith('<') || errorMessage.includes('<!DOCTYPE html>')) {
                console.error("Server returned HTML error:", errorMessage);
                errorMessage = "Server Error: The upload service encountered an unexpected problem. Please try again later.";
            }

            setUploadError(errorMessage);
            // alert(`Upload Error: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4">Upload Professional Photos</h2>

                {/* Drag Drop Area */}
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Upload size={32} />
                    </div>
                    <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <ImageIcon size={16} className="text-gray-400" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ))}
                    </div>
                )}

                {uploadError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {uploadError}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || isUploading}
                        className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading && <Loader size={16} className="animate-spin" />}
                        {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photos`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhotoUploadModal;
