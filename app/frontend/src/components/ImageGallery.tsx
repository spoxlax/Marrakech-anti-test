import React, { useState } from 'react';
import { X, Grid, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: string[] | null | undefined;
    title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fallback if no images
    const displayImages = images && images.length > 0
        ? images
        : [`https://source.unsplash.com/random/1200x800/?travel,${title.split(' ')[0]}`];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    // Keyboard Navigation
    React.useEffect(() => {
        if (!showAllPhotos) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
            } else if (e.key === 'ArrowLeft') {
                setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
            } else if (e.key === 'Escape') {
                setShowAllPhotos(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAllPhotos, displayImages.length]);

    // Modal View
    if (showAllPhotos) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-[#222222]">
                <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden relative select-none" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <button
                            onClick={() => setShowAllPhotos(false)}
                            className="p-2 hover:bg-neutral-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                        <div className="font-semibold text-sm">
                            {currentImageIndex + 1} / {displayImages.length}
                        </div>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>

                    {/* Main Gallery */}
                    <div className="flex-1 flex items-center justify-center relative bg-black select-none">
                        <img
                            src={displayImages[currentImageIndex]}
                            alt={`Gallery ${currentImageIndex + 1}`}
                            className="max-h-full max-w-full object-contain select-none pointer-events-none"
                        />

                        {displayImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition z-10"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition z-10"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="h-24 bg-white border-t p-4 flex gap-2 overflow-x-auto justify-center">
                        {displayImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`relative h-full aspect-[4/3] rounded-md overflow-hidden border-2 transition shrink-0 ${currentImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Grid View (1, 2, 3, 4, or 5+ images)
    const renderGrid = () => {
        if (displayImages.length === 1) {
            return (
                <div className="relative rounded-xl overflow-hidden aspect-[2/1] md:aspect-[3/1] group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                    <img src={displayImages[0]} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                </div>
            );
        }

        if (displayImages.length < 5) {
            return (
                <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden aspect-[2/1] cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                    {displayImages.map((img, idx) => (
                        <div key={idx} className="relative group overflow-hidden bg-gray-100">
                            <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                    ))}
                </div>
            )
        }

        // 5+ images (Airbnb style)
        return (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden aspect-[2/1] cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                {/* Main large image */}
                <div className="col-span-2 row-span-2 relative group bg-gray-100">
                    <img src={displayImages[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                {/* Secondary images */}
                {displayImages.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative group bg-gray-100">
                        <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="mb-8 relative">
            {renderGrid()}

            <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 bg-white border border-black px-4 py-1.5 text-sm font-semibold rounded-lg hover:scale-105 transition shadow-sm flex items-center gap-2"
            >
                <Grid size={16} />
                Show all photos
            </button>
        </section>
    );
};

export default ImageGallery;
