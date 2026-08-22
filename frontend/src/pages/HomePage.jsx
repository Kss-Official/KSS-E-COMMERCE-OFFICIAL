import React from 'react';
import HeroSlider from '../features/home/HeroSlider';
import FeatureHighlights from '../features/home/FeatureHighlights';
import TopCategories from '../features/home/TopCategories';

export default function HomePage() {
  return (
    <main className="w-full max-w-none mx-0">
      <HeroSlider />
      <FeatureHighlights />
      <TopCategories />
    </main>
  );
}
