import React from 'react';

export default function SkeletonCard({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-3 border border-gray-200 shadow-2xs flex flex-col justify-between animate-pulse min-w-0 w-full"
        >
          <div>
            {/* Badge & Heart Placeholder */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-4 bg-gray-200 rounded-md" />
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            </div>

            {/* Image Placeholder */}
            <div className="w-full h-28 sm:h-36 bg-gray-100 rounded-xl mb-2 flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-gray-200/60" />
            </div>

            {/* Title Placeholder */}
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />

            {/* Price & Rating Placeholder */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-8" />
            </div>
          </div>

          {/* Button Placeholder */}
          <div className="mt-3 w-full h-7 bg-gray-200 rounded-full" />
        </div>
      ))}
    </>
  );
}
