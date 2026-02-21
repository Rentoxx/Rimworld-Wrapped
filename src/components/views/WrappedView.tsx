"use client";

import { JSX, useState } from "react";
import { ParsedStats } from "@/lib/types";
import {
  IntroSlide, KillStatsSlide, GraveyardSlide, DamageSlide, LogisticsSlide,
  GluttonySlide, AwardsSlide, MedicalSlide, WarCrimesSlide, ConclusionSlide,
  StorytellerSlide, ChaosChronikSlide, RaidReportSlide, DisasterSlide,
  WildlifeSlide, MentalStateSlide, EndingSlide
} from "../slides/Slides";

export default function WrappedView({ stats }: { stats: ParsedStats }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filtert automatisch alle Slides aus, die null/false ergeben
  const slides = [
    <IntroSlide key="intro" stats={stats} />,
    <StorytellerSlide key="storyteller" stats={stats} />,
    stats.global.killsTotal > 0 && <KillStatsSlide key="kills" stats={stats} />,
    stats.graveyard.total > 0 && <GraveyardSlide key="graveyard" stats={stats} />,
    <DamageSlide key="damage" stats={stats} />,
    stats.topEvents.length > 0 && <ChaosChronikSlide key="chaos" stats={stats} />,
    stats.events.raidCount > 0 && <RaidReportSlide key="raids" stats={stats} />,
    (stats.events.toxicFalloutCount > 0 || stats.events.heatWaveCount > 0 || stats.events.coldSnapCount > 0 || stats.events.solarFlareCount > 0 || stats.events.eclipseCount > 0 || stats.events.volcanicWinterCount > 0 || stats.events.psychicDroneCount > 0) && <DisasterSlide key="disaster" stats={stats} />,
    (stats.global.animalsTamed > 0 || stats.global.animalsSlaughtered > 0) && <WildlifeSlide key="wildlife" stats={stats} />,
    stats.global.mentalBreaks > 0 && <MentalStateSlide key="mental" stats={stats} />,
    <LogisticsSlide key="logistics" stats={stats} />,
    <GluttonySlide key="gluttony" stats={stats} />,
    <AwardsSlide key="awards" stats={stats} />,
    <MedicalSlide key="medical" stats={stats} />,
    (stats.records.cannibalismCount > 0 || stats.records.butcheredHumanoids > 0) && <WarCrimesSlide key="warcrimes" stats={stats} />,
    <EndingSlide key="ending" stats={stats} />,
    <ConclusionSlide key="conclusion" stats={stats} />
  ].filter(Boolean) as JSX.Element[];

  const totalSlides = slides.length;
  const handleNextSlide = () => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
  const handlePrevSlide = () => setCurrentSlide((prev) => Math.max(0, prev - 1));

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 lg:py-10 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[9/16] bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-700 flex flex-col">
        
        {/* Progress Bar */}
        <div className="absolute top-0 inset-x-0 z-50 flex gap-1 p-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div key={index} className="h-1 flex-1 bg-zinc-600/50 rounded-full overflow-hidden">
              <div className={`h-full bg-white transition-all duration-300 ${index <= currentSlide ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="absolute bottom-6 inset-x-0 px-6 flex justify-between items-center z-50 pointer-events-none">
          {currentSlide > 0 ? (
            <button onClick={handlePrevSlide} className="pointer-events-auto flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-bold tracking-wider">ZURÜCK</span>
            </button>
          ) : <div />}
          
          {currentSlide < totalSlides - 1 ? (
            <button onClick={handleNextSlide} className="pointer-events-auto flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all ml-auto">
              <span className="text-sm font-bold tracking-wider">WEITER</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : <div />}
        </div>

        {/* Current Slide */}
        {slides[currentSlide]}
        
      </main>
    </div>
  );
}