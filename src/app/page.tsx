"use client";

import { useState, useRef } from "react";

// --- TYPES ---
type ParsedStats = {
  version: string;
  playTimeTicks: number;
  mods: string[];
  isPermadeath: boolean;
  scenario: string;
  storyteller: string;
  difficulty: string;
  endings: string[];
  colonyName: string;
  topEvents: { name: string; count: number }[]; // NEU HINZUGEFÜGT
};

export default function Home() {
  // --- STATE ---
  const [appState, setAppState] = useState<"upload" | "parsing" | "wrapped">("upload");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<ParsedStats | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DRAG & DROP HANDLER ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // --- DER PARSER ---
  const handleFile = async (file: File) => {
    setIsDragging(false);
    setAppState("parsing");
    console.log(`Starte Stream für: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const newStats: ParsedStats = {
      version: "",
      playTimeTicks: 0,
      mods: [],
      isPermadeath: false,
      scenario: "Unbekannt",
      storyteller: "Unbekannt",
      difficulty: "Normal",
      endings: [],
      colonyName: "Deine Kolonie",
      topEvents: [],
    };

    // Hier sammeln wir die smarten Events
    const eventCounts: Record<string, number> = {};

    try {
      const stream = file.stream();
      const decoder = new TextDecoderStream("utf-8");
      const reader = stream.pipeThrough(decoder).getReader();

      let isReadingMeta = false;
      let isReadingInfo = false;
      let isReadingScenario = false;
      let isReadingStoryteller = false;
      let isReadingArchivables = false; // NEU: Für die Events!
      
      let partialLine = ""; 

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = partialLine + value;
        const lines = chunkStr.split("\n");
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();

          // --- BLOCK ERKENNUNG ---
          if (trimmedLine.startsWith("<meta>")) isReadingMeta = true;
          if (trimmedLine.startsWith("</meta>")) isReadingMeta = false;
          if (trimmedLine.startsWith("<info>")) isReadingInfo = true;
          if (trimmedLine.startsWith("</info>")) isReadingInfo = false;
          if (trimmedLine.startsWith("<scenario>")) isReadingScenario = true;
          if (trimmedLine.startsWith("</scenario>")) isReadingScenario = false;
          if (trimmedLine.startsWith("<storyteller>")) isReadingStoryteller = true;
          if (trimmedLine.startsWith("</storyteller>")) isReadingStoryteller = false;
          if (trimmedLine.startsWith("<archivables>")) isReadingArchivables = true;
          if (trimmedLine.startsWith("</archivables>")) isReadingArchivables = false;

          // --- DATEN EXTRAKTION ---
          if (isReadingMeta && trimmedLine.startsWith("<gameVersion>")) {
            newStats.version = trimmedLine.replace(/<\/?gameVersion>/g, "");
          }
          if (isReadingInfo && trimmedLine.startsWith("<realPlayTimeInteracting>")) {
            newStats.playTimeTicks = parseFloat(trimmedLine.replace(/<\/?realPlayTimeInteracting>/g, ""));
          }
          if (isReadingScenario && trimmedLine.startsWith("<name>")) {
            newStats.scenario = trimmedLine.replace(/<\/?name>/g, "");
          }
          if (isReadingStoryteller && trimmedLine.startsWith("<def>")) {
            newStats.storyteller = trimmedLine.replace(/<\/?def>/g, "");
          }
          if (isReadingStoryteller && trimmedLine.startsWith("<difficulty>")) {
            newStats.difficulty = trimmedLine.replace(/<\/?difficulty>/g, "");
          }

          // --- ENDINGS ---
          if (trimmedLine.includes("Königlicher Aufstieg' erfolgreich abgeschlossen")) {
            if (!newStats.endings.includes("Königlicher Aufstieg")) newStats.endings.push("Königlicher Aufstieg");
          }

          // --- SMART EVENT TRACKING ---
          if (isReadingArchivables && trimmedLine.startsWith("<text>")) {
            let rawText = trimmedLine.replace(/<\/?text>/g, "");
            
            // 1. Farben entfernen: <color=#D09B61FF>Lina</color> -> Lina
            rawText = rawText.replace(/<color[^>]*>|<\/color>/g, "");
            // 2. Namens-Tags entfernen: (*Name)Lina(/Name) -> Lina
            rawText = rawText.replace(/\(\*[^)]+\)|\(\/[^)]+\)/g, "");
            // 3. Zahlen durch ein "X" ersetzen, um ähnliche Events zu gruppieren
            const groupedText = rawText.replace(/\d+/g, "X");

            // Wir ignorieren zu kurze oder generische Strings (optional)
            if (groupedText.length > 5) {
              eventCounts[groupedText] = (eventCounts[groupedText] || 0) + 1;
            }
          }
        }
      }

      // --- EVENTS AUSWERTEN ---
      // Wir sortieren das Dictionary nach Häufigkeit, filtern die Top 5 heraus (die mindestens 3x passiert sind)
      newStats.topEvents = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
        .filter(event => event.count >= 3 && !event.name.includes("Kritischer Alarm: Rettung benötigt")) // Unspannende Standard-Alarme ignorieren
        .slice(0, 4);

      setStats(newStats);
      setAppState("wrapped");

    } catch (error) {
      console.error("Fehler beim Streamen:", error);
      alert("Fehler beim Verarbeiten der Datei.");
      setAppState("upload");
    }
  };

  // --- NAVIGATION ---
  const nextSlide = () => setCurrentSlide((prev) => Math.min(5, prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(0, prev - 1));

  // --- RENDER: PARSING ---
  if (appState === "parsing") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-medium text-zinc-300">Analysiere Savegame...</h2>
        </div>
      </div>
    );
  }

  // --- RENDER: WRAPPED (SLIDES) ---
  if (appState === "wrapped" && stats) {
    const playTimeHours = (stats.playTimeTicks / 3600).toFixed(1);
    const totalSlides = 6;

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 lg:py-10 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* CONTAINER IM STORY-FORMAT (9:16) - Größer auf Desktop! */}
        <main className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[9/16] bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-700 flex flex-col">
          
          {/* Progress Bar Top */}
          <div className="absolute top-0 inset-x-0 z-50 flex gap-1 p-4">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div key={index} className="h-1 flex-1 bg-zinc-600/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-white transition-all duration-300 ${index <= currentSlide ? 'w-full' : 'w-0'}`} 
                />
              </div>
            ))}
          </div>

          {/* SICHTBARE NAVIGATION (Pfeile) */}
          <div className="absolute bottom-6 inset-x-0 px-6 flex justify-between items-center z-50 pointer-events-none">
            {currentSlide > 0 ? (
              <button 
                onClick={prevSlide} 
                className="pointer-events-auto flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="text-sm font-bold tracking-wider">ZURÜCK</span>
              </button>
            ) : <div />}
            
            {currentSlide < totalSlides - 1 ? (
              <button 
                onClick={nextSlide} 
                className="pointer-events-auto flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all ml-auto"
              >
                <span className="text-sm font-bold tracking-wider">WEITER</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : <div />}
          </div>

          {/* --- SLIDE 1: ÜBERBLICK --- */}
          {currentSlide === 0 && (
            <div className="flex-1 flex flex-col px-8 pt-16 pb-12 relative animate-in fade-in zoom-in-95 duration-500">
              
              <div className="flex-1 flex flex-col justify-center relative z-20">
                <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Kolonie-Bericht</p>
                <h1 className="text-5xl lg:text-6xl font-black text-white leading-none mb-8 tracking-tight break-words">
                  {stats.colonyName}
                </h1>

                <div className="space-y-4">
                  {/* Spielzeit Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                    <p className="text-zinc-400 text-sm font-medium mb-1">In-Game verbracht</p>
                    <p className="text-5xl lg:text-6xl font-black text-white">
                      {playTimeHours}<span className="text-2xl lg:text-3xl text-zinc-500 font-bold ml-1">h</span>
                    </p>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                      <p className="text-zinc-500 text-[10px] lg:text-xs uppercase tracking-wider mb-1 font-bold">Szenario</p>
                      <p className="text-white font-medium truncate">{stats.scenario}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
                      <p className="text-zinc-500 text-[10px] lg:text-xs uppercase tracking-wider mb-1 font-bold">Storyteller</p>
                      <p className="text-white font-medium truncate">{stats.storyteller}</p>
                      <p className="text-orange-400 text-xs mt-1 font-semibold">{stats.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MEDAILLE FÜR KÖNIGLICHER AUFSTIEG (Royalty DLC) */}
              {stats.endings.includes("Königlicher Aufstieg") && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 animate-in fade-in zoom-in-50 slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rounded-full p-1 shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center">
                    <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border-2 border-yellow-400/50">
                      {/* Krone SVG als Royalty Symbol */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-400 drop-shadow-md">
                        <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 01.334.896l-2.45 8.01a.75.75 0 01-.715.529H4.725a.75.75 0 01-.715-.53l-2.45-8.01a.75.75 0 01.334-.895l9.75-5.25z" />
                        <path d="M4.5 17.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-yellow-400 font-bold text-xs lg:text-sm tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Königlicher Aufstieg
                  </p>
                </div>
              )}

            </div>
          )}

          {/* --- SLIDE 2: DIE VERRÜCKTESTEN EVENTS --- */}
          {currentSlide === 1 && (
            <div className="flex-1 flex flex-col px-8 pt-16 pb-20 relative animate-in fade-in zoom-in-95 duration-500">
              <div className="flex-1 flex flex-col justify-center relative z-20">
                <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Kolonie-Wahnsinn</p>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
                  Dinge gerieten <br/>außer Kontrolle.
                </h2>

                <div className="space-y-3">
                  {stats.topEvents.length > 0 ? (
                    stats.topEvents.map((event, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg flex items-center gap-4">
                        <div className="bg-orange-500/20 text-orange-400 font-black text-2xl lg:text-3xl rounded-xl w-14 h-14 flex items-center justify-center shrink-0">
                          {event.count}x
                        </div>
                        <p className="text-white font-medium text-sm lg:text-base leading-snug line-clamp-3">
                          {event.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400">Es war ein ungewöhnlich friedlicher Run. (Keine verrückten Events gefunden)</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PLATZHALTER: WEITERE SLIDES (ab Slide 3) */}
          {currentSlide > 1 && (
            <div className="flex-1 flex items-center justify-center text-center p-8 relative z-20">
              <p className="text-zinc-500 font-medium">Slide {currentSlide + 1}<br/>Hier kommen bald die Kolonisten-Stats hin.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- RENDER: UPLOAD ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* CSS Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Der main Tag braucht ein 'relative z-10', damit er ÜBER dem Grid liegt */}
      <main className="max-w-2xl w-full flex flex-col items-center text-center gap-8 relative z-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            RimWorld <span className="text-orange-500">Wrapped</span>
          </h1>
          <p className="text-lg text-zinc-400">
            Relive the highlights, the tragedies, and the questionable moral choices of your colony. 
            Drop your savegame below to generate your personal infographic.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`w-full p-12 mt-4 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-4 cursor-pointer
            ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Unsichtbares Input-Feld für den normalen Datei-Picker */}
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept=".rws,.xml"
            onChange={handleFileChange}
          />
          
          {/* Upload Icon */}
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-zinc-200">
            Click to upload or drag and drop
          </h3>
          <p className="text-sm text-zinc-500">
            Select your RimWorld savegame (.rws)
          </p>
          
          {/* Vertrauens-Bonus: Wichtig bei Savegames! */}
          <div className="mt-6 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              100% Secure: All processing happens locally in your browser. No data is uploaded to any server.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}