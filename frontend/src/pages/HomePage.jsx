import React from 'react';
import HeroSlider from '../features/home/HeroSlider';
import TrustBar from '../components/ui/TrustBar';
import TopCategories from '../features/home/TopCategories';
import NewArrivalsPage from './NewArrivalsPage';
import { TrendingDealsBand } from '../features/home/HomeSections';

export default function HomePage() {
  return (
    <main className="w-full max-w-none mx-0 pb-6">
      <HeroSlider />
      <TrustBar variant="panel" />
      <div className="space-y-4 pt-8">
        <TopCategories />
        <TrendingDealsBand />
        <div className="pt-2">
          <NewArrivalsPage />
        </div>
      </div>
    </main>
  );
}
