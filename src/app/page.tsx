"use client";

import { useState, useRef, JSX } from "react";
import pako from "pako";

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
  topEvents: { name: string; count: number }[];
  records: {
    cannibalismCount: number;
    butcheredHumanoids: number;
    heatstrokes: number;
    lovers: number;
    raids: number;
    organsHarvested: number;
  };
  wealthHistory: number[];
  awards: {
    totalColonists: number;
    bestShooter: { name: string; level: number; wounds: number } | null;
    bestMelee: { name: string; level: number; wounds: number } | null;
    bestDoctor: { name: string; level: number; wounds: number } | null;
  };
};

export default function Home() {
  const [appState, setAppState] = useState<"upload" | "parsing" | "wrapped">("upload");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<ParsedStats | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFile(files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  // --- DER PARSER ---
  const handleFile = async (file: File) => {
    setIsDragging(false);
    setAppState("parsing");
    console.log(`Starte Stream für: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const newStats: ParsedStats = {
      version: "", playTimeTicks: 0, mods: [], isPermadeath: false,
      scenario: "Unbekannt", storyteller: "Unbekannt", difficulty: "Normal",
      endings: [], colonyName: "Deine Kolonie", topEvents: [],
      records: { cannibalismCount: 0, butcheredHumanoids: 0, heatstrokes: 0, lovers: 0, raids: 0, organsHarvested: 0 },
      wealthHistory: [],
      awards: { totalColonists: 0, bestShooter: null, bestMelee: null, bestDoctor: null }
    };

    const eventCounts: Record<string, number> = {};

    let recentlySawWealthTotal = false;
    let isReadingWealthBlock = false;
    let isWealthDeflated = false;
    let wealthBase64 = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentColonist: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allColonists: any[] = [];
    let currentSkill = "";

    try {
      const stream = file.stream();
      const decoder = new TextDecoderStream("utf-8");
      const reader = stream.pipeThrough(decoder).getReader();

      let isReadingMeta = false, isReadingInfo = false, isReadingScenario = false, isReadingStoryteller = false;
      let isReadingArchivables = false, isReadingTaleManager = false; 
      let partialLine = ""; 

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = partialLine + value;
        const lines = chunkStr.split("\n");
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();

          // BLOCK ERKENNUNG
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
          if (trimmedLine.startsWith("<taleManager>")) isReadingTaleManager = true;
          if (trimmedLine.startsWith("</taleManager>")) isReadingTaleManager = false;

          // DATEN EXTRAKTION
          if (isReadingMeta && trimmedLine.startsWith("<gameVersion>")) newStats.version = trimmedLine.replace(/<\/?gameVersion>/g, "");
          if (isReadingInfo && trimmedLine.startsWith("<realPlayTimeInteracting>")) newStats.playTimeTicks = parseFloat(trimmedLine.replace(/<\/?realPlayTimeInteracting>/g, ""));
          if (isReadingScenario && trimmedLine.startsWith("<name>")) newStats.scenario = trimmedLine.replace(/<\/?name>/g, "");
          if (isReadingStoryteller && trimmedLine.startsWith("<def>")) newStats.storyteller = trimmedLine.replace(/<\/?def>/g, "");
          if (isReadingStoryteller && trimmedLine.startsWith("<difficulty>")) newStats.difficulty = trimmedLine.replace(/<\/?difficulty>/g, "");

          if (trimmedLine.includes("Königlicher Aufstieg' erfolgreich abgeschlossen")) {
            if (!newStats.endings.includes("Königlicher Aufstieg")) newStats.endings.push("Königlicher Aufstieg");
          }

          // --- SMART EVENT GROUPING (NEU & VERBESSERT) ---
          if (isReadingArchivables && trimmedLine.startsWith("<text>")) {
            let rawText = trimmedLine.replace(/<\/?text>/g, "").replace(/<color[^>]*>|<\/color>/g, "").replace(/\(\*[^)]+\)|\(\/[^)]+\)/g, "");
            
            // 1. Unwichtigen Spam komplett ignorieren
            if (rawText.includes("ist voll verheilt") || 
                rawText.includes("Rettung benötigt") || 
                rawText.includes("Medizinischer Notfall") || 
                rawText.includes("ist wieder bei Verstand") ||
                rawText.includes("ist nicht länger unfähig zu laufen")) {
              continue;
            }

            // 2. Smarte Gruppierung
            if (rawText.includes("zur Welt gebracht") || rawText.includes("trächtig") || rawText.includes("ist schwanger") || rawText.includes("hat ein Junges")) {
              rawText = "Tierhaltung eskaliert (Trächtigkeit & Nachwuchs)";
            } else if (rawText.includes("schweren Zusammenbruchs") || rawText.includes("extremen Zusammenbruchs") || rawText.includes("Risiko eines")) {
              rawText = "Kritischer Alarm: Nervenzusammenbruch droht";
            } else if (rawText.includes("Feuer!")) {
              rawText = "Kritischer Alarm: Feuer in der Kolonie";
            } else if (rawText.includes("Überfall") || rawText.includes("Greifen sofort an")) {
              rawText = "Feindlicher Überfall";
            } else if (rawText.includes("ist verrückt geworden")) {
              rawText = "Ein Tier ist verrückt geworden";
            } else {
              // Alle Zahlen rauswerfen, um saubere Strings ohne "X" zu haben
              rawText = rawText.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
            }

            if (rawText.length > 5) {
              eventCounts[rawText] = (eventCounts[rawText] || 0) + 1;
            }
          }

          if (isReadingTaleManager && trimmedLine.startsWith("<def>")) {
            const defName = trimmedLine.replace(/<\/?def>/g, "");
            if (defName === "AteRawHumanlikeMeat" || defName === "AteHumanlikeMeatDirect") newStats.records.cannibalismCount++;
            if (defName === "ButcheredHumanlikeCorpse") newStats.records.butcheredHumanoids++;
            if (defName === "HeatstrokeRevealed") newStats.records.heatstrokes++;
            if (defName === "BecameLover") newStats.records.lovers++;
            if (defName === "Raid" || defName === "MajorThreat") newStats.records.raids++;
            if (defName === "SurgeryExtractOrgan") newStats.records.organsHarvested++;
          }

          // WEALTH TRACKING
          if (trimmedLine === "<def>Wealth_Total</def>") {
            recentlySawWealthTotal = true;
          } else if (recentlySawWealthTotal && trimmedLine.startsWith("<records>")) {
            isReadingWealthBlock = true; isWealthDeflated = false; recentlySawWealthTotal = false;
            wealthBase64 += trimmedLine.replace("<records>", "").replace("</records>", "");
            if (trimmedLine.includes("</records>")) isReadingWealthBlock = false;
          } else if (recentlySawWealthTotal && trimmedLine.startsWith("<recordsDeflate>")) {
            isReadingWealthBlock = true; isWealthDeflated = true; recentlySawWealthTotal = false;
            wealthBase64 += trimmedLine.replace("<recordsDeflate>", "").replace("</recordsDeflate>", "");
            if (trimmedLine.includes("</recordsDeflate>")) isReadingWealthBlock = false;
          } else if (isReadingWealthBlock) {
            if (trimmedLine.includes("</records>") || trimmedLine.includes("</recordsDeflate>")) {
              isReadingWealthBlock = false;
              wealthBase64 += trimmedLine.replace(/<\/?records(Deflate)?>/g, "");
            } else {
              wealthBase64 += trimmedLine;
            }
          }

          // --- COLONIST & DEEP STATS TRACKING ---
          if (trimmedLine.includes("<def>Human</def>")) {
            currentColonist = { 
              first: "", nick: "", last: "", 
              skills: {}, 
              wounds: 0,
              isReadingHediffs: false
            };
          }
          if (currentColonist) {
            if (trimmedLine.includes("<kindDef>Colonist</kindDef>")) {
              allColonists.push(currentColonist);
            }
            
            // Namen
            const firstMatch = trimmedLine.match(/<first>(.*?)<\/first>/);
            if (firstMatch) currentColonist.first = firstMatch[1];
            const nickMatch = trimmedLine.match(/<nick>(.*?)<\/nick>/);
            if (nickMatch) currentColonist.nick = nickMatch[1];
            const lastMatch = trimmedLine.match(/<last>(.*?)<\/last>/);
            if (lastMatch) currentColonist.last = lastMatch[1];

            // Skills
            const skillDefMatch = trimmedLine.match(/<def>(Shooting|Melee|Medicine|Intellectual|Cooking|Construction|Plants|Mining|Animals|Crafting|Artistic|Social)<\/def>/);
            if (skillDefMatch) currentSkill = skillDefMatch[1];
            const levelMatch = trimmedLine.match(/<level>(\d+)<\/level>/);
            if (levelMatch && currentSkill) {
              currentColonist.skills[currentSkill] = parseInt(levelMatch[1], 10);
              currentSkill = "";
            }

            // Wunden & Medizinisches tracken
            if (trimmedLine.startsWith("<hediffs>")) currentColonist.isReadingHediffs = true;
            if (trimmedLine.startsWith("</hediffs>")) currentColonist.isReadingHediffs = false;
            
            if (currentColonist.isReadingHediffs && trimmedLine.startsWith("<def>")) {
                const hediff = trimmedLine.replace(/<\/?def>/g, "");
                // Tracke klassische Kampf-Wunden und fehlende Teile
                if (["Gunshot", "Cut", "Stab", "Bite", "Scratch", "Bruise", "Crush", "Crack", "Shred", "Burn", "MissingBodyPart"].includes(hediff)) {
                    currentColonist.wounds++;
                }
            }
          }
        }
      }

      newStats.topEvents = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
        .slice(0, 4);

      // --- AUSWERTUNG DER KOLONISTEN ---
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validColonists = allColonists.filter((c: any) => c.first || c.nick);
      newStats.awards.totalColonists = validColonists.length;

      const getBest = (skill: string) => {
        let best = null;
        let maxLvl = -1;
        for (const c of validColonists) {
          const lvl = c.skills[skill] || 0;
          if (lvl > maxLvl) { maxLvl = lvl; best = c; }
        }
        return best && maxLvl > 0 ? { name: best.nick || best.first || best.last, level: maxLvl, wounds: best.wounds } : null;
      };

      newStats.awards.bestShooter = getBest("Shooting");
      newStats.awards.bestMelee = getBest("Melee");
      newStats.awards.bestDoctor = getBest("Medicine");

      if (wealthBase64) {
        try {
          const binaryString = atob(wealthBase64.trim());
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          let bufferToRead = bytes.buffer;
          if (isWealthDeflated) {
            const uncompressed = pako.inflateRaw(bytes); 
            bufferToRead = uncompressed.buffer;
          }
          newStats.wealthHistory = Array.from(new Float32Array(bufferToRead));
        } catch (err) {
          console.error("Wealth decode error:", err);
        }
      }

      setStats(newStats);
      setCurrentSlide(0);
      setAppState("wrapped");

    } catch (error) {
      console.error("Fehler beim Streamen:", error);
      alert("Fehler beim Verarbeiten der Datei.");
      setAppState("upload");
    }
  };

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
    const slides: JSX.Element[] = [];

    // SLIDE 1: ÜBERBLICK
    slides.push(
      <div key="overview" className="flex-1 flex flex-col px-8 pt-16 pb-12 relative animate-in fade-in zoom-in-95 duration-500">
        <div className="flex-1 flex flex-col justify-center relative z-20">
          <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Kolonie-Bericht</p>
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-none mb-8 tracking-tight break-words">
            {stats.colonyName}
          </h1>

          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
              <p className="text-zinc-400 text-sm font-medium mb-1">In-Game verbracht</p>
              <p className="text-5xl lg:text-6xl font-black text-white">
                {playTimeHours}<span className="text-2xl lg:text-3xl text-zinc-500 font-bold ml-1">h</span>
              </p>
            </div>

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
      </div>
    );

    // SLIDE 2: WEALTH
    if (stats.wealthHistory.length > 0) {
      const wLen = stats.wealthHistory.length;
      const wMax = Math.max(...stats.wealthHistory) || 1;
      const wMin = Math.min(...stats.wealthHistory);
      const wRange = wMax - wMin || 1;
      const points = stats.wealthHistory.map((w, i) => {
        const x = wLen > 1 ? (i / (wLen - 1)) * 100 : 50;
        const y = 100 - (((w - wMin) / wRange) * 100);
        return `${x},${y}`;
      }).join(" ");

      slides.push(
        <div key="wealth" className="flex-1 flex flex-col px-8 pt-16 pb-12 relative animate-in fade-in zoom-in-95 duration-500">
          <div className="flex-1 flex flex-col justify-center relative z-20">
            <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Der Aufstieg</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
              Kolonie-Reichtum
            </h2>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg relative">
              <div className="w-full h-40 relative border-b border-zinc-700">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none overflow-visible">
                  <defs>
                    <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={`0,100 ${points} 100,100`} fill="url(#wealthGradient)" />
                  <polyline points={points} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="absolute bottom-6 right-6 text-orange-400 font-black text-2xl drop-shadow-lg bg-zinc-900/90 px-3 py-1 rounded-lg">
                ${Math.floor(wMax).toLocaleString('de-DE')}
              </p>
            </div>
            <p className="text-zinc-400 text-sm mt-6 text-center">So viel war dein Hab und Gut zu Hochzeiten wert.</p>
          </div>
        </div>
      );
    }

    // SLIDE 3: KOLONISTEN HALL OF FAME (MIT DEEP STATS)
    if (stats.awards.totalColonists > 0) {
      slides.push(
        <div key="awards" className="flex-1 flex flex-col px-8 pt-16 pb-12 relative animate-in fade-in zoom-in-95 duration-500">
          <div className="flex-1 flex flex-col justify-center relative z-20">
            <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Hall of Fame</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Deine Legenden
            </h2>
            <p className="text-zinc-400 text-sm font-medium mb-6">Von {stats.awards.totalColonists} verzeichneten Kolonisten stachen diese besonders hervor:</p>
            
            <div className="space-y-4">
              {stats.awards.bestShooter && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-300 font-medium">🎯 Bester Schütze</span>
                    <div className="text-right">
                      <p className="text-white font-bold">{stats.awards.bestShooter.name}</p>
                      <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">Lvl {stats.awards.bestShooter.level}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 bg-black/30 p-2 rounded-lg leading-relaxed">
                    Überlebte im Dienst der Kolonie <strong className="text-zinc-200">{stats.awards.bestShooter.wounds} schwere Wunden & Narben</strong>.
                  </div>
                </div>
              )}
              {stats.awards.bestMelee && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-300 font-medium">⚔️ Bester Nahkämpfer</span>
                    <div className="text-right">
                      <p className="text-white font-bold">{stats.awards.bestMelee.name}</p>
                      <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">Lvl {stats.awards.bestMelee.level}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 bg-black/30 p-2 rounded-lg leading-relaxed">
                    War sich für nichts zu schade und steckte <strong className="text-zinc-200">{stats.awards.bestMelee.wounds} Verletzungen</strong> ein.
                  </div>
                </div>
              )}
              {stats.awards.bestDoctor && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-300 font-medium">⚕️ Bester Arzt</span>
                    <div className="text-right">
                      <p className="text-white font-bold">{stats.awards.bestDoctor.name}</p>
                      <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">Lvl {stats.awards.bestDoctor.level}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 bg-black/30 p-2 rounded-lg leading-relaxed">
                    Flickte die anderen zusammen, musste aber selbst <strong className="text-zinc-200">{stats.awards.bestDoctor.wounds} Wunden</strong> überleben.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // SLIDE 4: WAHNSINN (MIT SAUBEREN EVENTS)
    slides.push(
      <div key="events" className="flex-1 flex flex-col px-8 pt-16 pb-20 relative animate-in fade-in zoom-in-95 duration-500">
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
              <p className="text-zinc-400">Es war ein ungewöhnlich friedlicher Run. (Keine wiederholten Events gefunden)</p>
            )}
          </div>
        </div>
      </div>
    );

    // SLIDE 5: KRIEGSVERBRECHEN
    if (stats.records.cannibalismCount > 0 || stats.records.butcheredHumanoids > 0) {
      slides.push(
        <div key="crimes" className="flex-1 flex flex-col justify-center relative z-20 px-8 bg-red-950/40">
          <p className="text-red-500 font-bold tracking-widest text-xs mb-2 uppercase">Hannibal-Lecter-Preis</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            Feine <br/>Gesellschaft...
          </h2>
          <p className="text-zinc-300 mb-6">Ethische Grenzen wurden in diesem Playthrough eher als &quot;Vorschläge&quot; betrachtet.</p>
          <div className="space-y-3">
            {stats.records.butcheredHumanoids > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-red-500/20 shadow-lg">
                <p className="text-red-400 font-black text-2xl">{stats.records.butcheredHumanoids}x</p>
                <p className="text-white text-sm font-medium mt-1">Menschen geschlachtet</p>
              </div>
            )}
            {stats.records.cannibalismCount > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-red-500/20 shadow-lg">
                <p className="text-red-400 font-black text-2xl">{stats.records.cannibalismCount}x</p>
                <p className="text-white text-sm font-medium mt-1">Menschenfleisch konsumiert</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // SLIDE 6: ORGANE
    if (stats.records.organsHarvested > 0) {
      slides.push(
        <div key="organs" className="flex-1 flex flex-col justify-center relative z-20 px-8">
          <p className="text-green-500 font-bold tracking-widest text-xs mb-2 uppercase">Freier Markt</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            Das Organ-Business boomte.
          </h2>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-green-500/20 shadow-lg">
            <p className="text-6xl font-black text-green-400 mb-2">{stats.records.organsHarvested}</p>
            <p className="text-white font-medium text-lg leading-snug">Organe erfolgreich entnommen.</p>
            <p className="text-zinc-400 text-sm mt-2">RimWorld-Kapitalismus in Bestform.</p>
          </div>
        </div>
      );
    }

    // SLIDE 7: ROMANZEN
    if (stats.records.lovers > 0) {
      slides.push(
        <div key="romance" className="flex-1 flex flex-col justify-center relative z-20 px-8">
          <p className="text-pink-500 font-bold tracking-widest text-xs mb-2 uppercase">RimWorld Romance</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            Liebe liegt <br/>in der Luft.
          </h2>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-pink-500/20 shadow-lg text-center">
            <p className="text-6xl font-black text-pink-400 mb-2">{stats.records.lovers}</p>
            <p className="text-white font-medium">neue Liebschaften</p>
            <p className="text-zinc-400 text-sm mt-2">Trotz der ständigen Todesgefahr haben sich deine Kolonisten gefunden.</p>
          </div>
        </div>
      );
    }

    // SLIDE 8: STRUGGLE
    if (stats.records.heatstrokes > 0 || stats.records.raids > 0) {
      slides.push(
        <div key="struggle" className="flex-1 flex flex-col justify-center relative z-20 px-8">
          <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Überlebenskampf</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            Es war nicht <br/>immer einfach.
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.records.raids > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-orange-500/20 shadow-lg text-center">
                <p className="text-3xl lg:text-4xl font-black text-orange-400">{stats.records.raids}</p>
                <p className="text-zinc-300 text-xs font-medium uppercase mt-2">Raids &<br/>Bedrohungen</p>
              </div>
            )}
            {stats.records.heatstrokes > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-orange-500/20 shadow-lg text-center">
                <p className="text-3xl lg:text-4xl font-black text-orange-400">{stats.records.heatstrokes}</p>
                <p className="text-zinc-300 text-xs font-medium uppercase mt-2">schwere<br/>Hitzeschläge</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    const totalSlides = slides.length;

    // --- DYNAMISCHE NAVIGATION ---
    const handleNextSlide = () => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
    const handlePrevSlide = () => setCurrentSlide((prev) => Math.max(0, prev - 1));

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 lg:py-10 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <main className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[9/16] bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-700 flex flex-col">
          
          <div className="absolute top-0 inset-x-0 z-50 flex gap-1 p-4">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div key={index} className="h-1 flex-1 bg-zinc-600/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-white transition-all duration-300 ${index <= currentSlide ? 'w-full' : 'w-0'}`} 
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 inset-x-0 px-6 flex justify-between items-center z-50 pointer-events-none">
            {currentSlide > 0 ? (
              <button 
                onClick={handlePrevSlide} 
                className="pointer-events-auto flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="text-sm font-bold tracking-wider">ZURÜCK</span>
              </button>
            ) : <div />}
            
            {currentSlide < totalSlides - 1 ? (
              <button 
                onClick={handleNextSlide} 
                className="pointer-events-auto flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all ml-auto"
              >
                <span className="text-sm font-bold tracking-wider">WEITER</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : <div />}
          </div>

          {/* RENDERING DES AKTUELLEN SLIDES */}
          {slides[currentSlide]}
          
        </main>
      </div>
    );
  }

  // --- RENDER: UPLOAD ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="max-w-2xl w-full flex flex-col items-center text-center gap-8 relative z-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            RimWorld <span className="text-orange-500">Wrapped</span>
          </h1>
          <p className="text-lg text-zinc-400">
            Relive the highlights, the tragedies, and the questionable moral choices of your colony. 
            Drop your savegame below to generate your personal infographic.
          </p>
        </div>

        <div
          className={`w-full p-12 mt-4 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-4 cursor-pointer
            ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept=".rws,.xml"
            onChange={handleFileChange}
          />
          
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