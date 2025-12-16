import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import 'react-day-picker/style.css';

interface DateCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

const DateCalendar: React.FC<DateCalendarProps> = ({ selectedDate, onDateSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDateSelect = (date: Date | undefined) => {
        onDateSelect(date);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 border border-gray-300 rounded-xl bg-white hover:border-gray-900 transition flex items-center justify-between text-left"
            >
                <div>
                    <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Date</div>
                    <div className="text-sm font-medium text-gray-900">
                        {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Add date'}
                    </div>
                </div>
                <Calendar size={20} className="text-gray-500" />
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5"
                    style={{ minWidth: '320px' }}
                >
                    <style>{`
            .custom-calendar .rdp {
              --rdp-cell-size: 40px;
              margin: 0;
            }
            .custom-calendar .rdp-root {
              font-family: inherit;
            }
            .custom-calendar .rdp-month {
              width: 100%;
            }
            .custom-calendar .rdp-caption_label {
              font-size: 16px;
              font-weight: 600;
            }
            .custom-calendar .rdp-head_cell {
              font-size: 12px;
              font-weight: 600;
              color: #717171;
              text-transform: uppercase;
              width: 40px;
              padding: 8px 0;
            }
            .custom-calendar .rdp-cell {
              width: 40px;
              height: 40px;
              padding: 0;
            }
            .custom-calendar .rdp-day {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              font-size: 14px;
              font-weight: 500;
            }
            .custom-calendar .rdp-day:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: #f0f0f0;
            }
            .custom-calendar .rdp-day_selected {
              background-color: #222222 !important;
              color: white !important;
            }
            .custom-calendar .rdp-day_disabled {
              opacity: 0.25;
              text-decoration: line-through;
            }
            .custom-calendar .rdp-nav_button {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }
            .custom-calendar .rdp-nav_button:hover {
              background-color: #f7f7f7;
            }
            .custom-calendar .rdp-table {
              width: 100%;
              border-collapse: collapse;
            }
          `}</style>

                    <div className="custom-calendar">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={{ before: new Date() }}
                            showOutsideDays={false}
                            fixedWeeks
                            components={{
                                Chevron: ({ orientation }) =>
                                    orientation === 'left' ?
                                        <ChevronLeft size={16} /> :
                                        <ChevronRight size={16} />
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateCalendar;
