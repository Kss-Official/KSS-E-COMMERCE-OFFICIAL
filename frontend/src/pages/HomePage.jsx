import React from 'react';
import HeroSlider from '../features/home/HeroSlider';
import FeatureHighlights from '../features/home/FeatureHighlights';
import TopCategories from '../features/home/TopCategories';
import NewArrivalsPage from './NewArrivalsPage';

export default function HomePage() {
  return (
    <main className="w-full max-w-none mx-0 pb-6">
      <HeroSlider />
      <FeatureHighlights />
      <div className="space-y-6 pt-6">
        <TopCategories />
        <div className="pt-2">
          <NewArrivalsPage />
        </div>
      </div>
    </main>
  );
}
