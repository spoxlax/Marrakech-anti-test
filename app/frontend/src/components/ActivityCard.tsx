import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';

export type Activity = {
    id: string;
    title: string;
    description: string;
    priceAdult: number;
    priceChild: number;
    vendorId: string;
    duration: string;
    images?: string[];
    category?: string;
};

interface ActivityCardProps {
    activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
    return (
        <Link to={`/activities/${activity.id}/book`} className="group cursor-pointer block h-full">
            <div className="flex flex-col gap-2 w-full h-full">
                {/* Image Container with Heart */}
                <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-gray-200">
                    <img
                        src={activity.images?.[0] || `https://source.unsplash.com/random/800x800/?vacation,${activity.title.split(' ')[0]}`}
                        alt={activity.title}
                        className="object-cover h-full w-full group-hover:scale-110 transition h-full w-full"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x800?text=Activity';
                        }}
                    />
                    <div className="absolute top-3 right-3">
                        <Heart size={24} className="fill-black/50 text-white hover:scale-110 transition" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1">
                    <div className="font-semibold text-base flex flex-row items-start justify-between">
                        <div className="line-clamp-1 pr-2">{activity.title}</div>
                        <div className="flex flex-row items-center gap-1 whitespace-nowrap">
                            <Star size={14} className="fill-black text-black" />
                            <span>4.9</span>
                        </div>
                    </div>

                    <div className="font-light text-neutral-500 text-sm">
                        {activity.duration ? activity.duration : 'Flexible duration'}
                    </div>
                    <div className="font-light text-neutral-500 text-sm">
                        Antigravity Host
                    </div>

                    <div className="flex flex-row items-center gap-1 mt-1 text-sm">
                        <div className="font-semibold">$ {activity.priceAdult}</div>
                        <div className="font-light">night</div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ActivityCard;
