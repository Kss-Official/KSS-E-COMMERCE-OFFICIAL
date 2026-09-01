import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose, category = 'fashion' }) {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [selectedSize, setSelectedSize] = useState('M');

  if (!isOpen) return null;

  const clothingSizes = [
    { size: 'S', chestIn: '36 - 38', chestCm: '91 - 96', lengthIn: '27', lengthCm: '68.5', shoulderIn: '16.5', shoulderCm: '42' },
    { size: 'M', chestIn: '38 - 40', chestCm: '96 - 101', lengthIn: '28', lengthCm: '71', shoulderIn: '17.5', shoulderCm: '44.5' },
    { size: 'L', chestIn: '40 - 42', chestCm: '101 - 106', lengthIn: '29', lengthCm: '73.5', shoulderIn: '18.5', shoulderCm: '47' },
    { size: 'XL', chestIn: '42 - 44', chestCm: '106 - 111', lengthIn: '30', lengthCm: '76', shoulderIn: '19.5', shoulderCm: '49.5' },
    { size: 'XXL', chestIn: '44 - 46', chestCm: '111 - 116', lengthIn: '31', lengthCm: '78.5', shoulderIn: '20.5', shoulderCm: '52' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Official Size Guide & Fit Assistant</h3>
              <p className="text-xs text-gray-500 font-medium">Standard Indian Apparel & Footwear Sizing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unit Switcher & Selector */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-2xl border border-gray-200/80">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
            <span>Select Size:</span>
            {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedSize === sz
                    ? 'bg-brand-800 text-white shadow-2xs'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setUnit('in')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                unit === 'in' ? 'bg-brand-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                unit === 'cm' ? 'bg-brand-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CM (cm)
            </button>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-900 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-gray-200">Size</th>
                <th className="p-3 border-b border-gray-200">Chest ({unit})</th>
                <th className="p-3 border-b border-gray-200">Length ({unit})</th>
                <th className="p-3 border-b border-gray-200">Shoulder ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {clothingSizes.map((row) => (
                <tr
                  key={row.size}
                  className={`transition-colors ${
                    selectedSize === row.size ? 'bg-emerald-50/70 font-extrabold text-brand-900' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-3 flex items-center space-x-1.5 font-black">
                    <span>{row.size}</span>
                    {selectedSize === row.size && (
                      <span className="text-[10px] bg-brand-800 text-white px-1.5 py-0.2 rounded-md">Selected</span>
                    )}
                  </td>
                  <td className="p-3">{unit === 'in' ? row.chestIn : row.chestCm}</td>
                  <td className="p-3">{unit === 'in' ? row.lengthIn : row.lengthCm}</td>
                  <td className="p-3">{unit === 'in' ? row.shoulderIn : row.shoulderCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
          <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Pro Tip for Best Fit:</strong> Measure around the fullest part of your chest keeping the tape horizontal. If you are between two sizes, choose the larger size for a relaxed fit.
          </p>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-2xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
