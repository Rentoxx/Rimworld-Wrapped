import { ParsedStats } from "@/lib/types";

export const IntroSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative">
    <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Kolonie-Bericht</p>
    <h1 className="text-5xl lg:text-6xl font-black text-white leading-none mb-6">{stats.colonyName}</h1>
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <p className="text-zinc-400 text-sm mb-1">In-Game verbracht</p>
      <p className="text-5xl font-black text-white">{(stats.playTimeTicks / 3600).toFixed(1)}<span className="text-2xl text-zinc-500">h</span></p>
    </div>
  </div>
);

export const KillStatsSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative">
    <p className="text-red-500 font-bold tracking-widest text-xs mb-2 uppercase">Blutzoll</p>
    <h2 className="text-5xl font-black text-white leading-tight mb-6">Die Große <br/>Säuberung</h2>
    <p className="text-zinc-300 mb-6">Insgesamt haben deine Leute <strong className="text-red-400 text-xl">{stats.global.killsTotal}</strong> Leben beendet.</p>
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-red-900/50">
        <span className="text-zinc-400">👤 Menschen</span>
        <span className="font-bold text-white text-xl">{stats.global.killsHuman}</span>
      </div>
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-orange-900/50">
        <span className="text-zinc-400">🐾 Tiere</span>
        <span className="font-bold text-white text-xl">{stats.global.killsAnimal}</span>
      </div>
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-blue-900/50">
        <span className="text-zinc-400">🤖 Mechanoiden</span>
        <span className="font-bold text-white text-xl">{stats.global.killsMech}</span>
      </div>
    </div>
  </div>
);

export const GraveyardSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-zinc-900">
    <p className="text-zinc-500 font-bold tracking-widest text-xs mb-2 uppercase">Der Friedhof</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-4">Wen hast du <br/>auf dem Gewissen?</h2>
    <p className="text-zinc-400 text-sm mb-8">Ein Blick auf die {stats.graveyard.total} Leichen von Raidern und Gästen, die den Weg kreuzten.</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-black/40 p-4 rounded-2xl text-center">
        <p className="text-3xl font-black text-blue-400">{stats.graveyard.male}</p>
        <p className="text-xs text-zinc-500 uppercase mt-1">Männer</p>
      </div>
      <div className="bg-black/40 p-4 rounded-2xl text-center">
        <p className="text-3xl font-black text-pink-400">{stats.graveyard.female}</p>
        <p className="text-xs text-zinc-500 uppercase mt-1">Frauen</p>
      </div>
    </div>
    {stats.graveyard.children > 0 && (
      <div className="mt-4 bg-red-950/40 border border-red-900/50 p-4 rounded-2xl text-center">
        <p className="text-4xl font-black text-red-500">{stats.graveyard.children}</p>
        <p className="text-sm text-red-300 font-medium mt-1">davon waren Kinder (U18)</p>
        <p className="text-xs text-red-500/50 mt-2">Du Monster.</p>
      </div>
    )}
  </div>
);

export const DamageSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative">
    <p className="text-orange-500 font-bold tracking-widest text-xs mb-2 uppercase">Fleischwolf</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-8">Gewalt in Zahlen</h2>
    <div className="space-y-4">
      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Schaden Ausgeteilt</p>
        <p className="text-4xl font-black text-orange-400">{Math.floor(stats.global.damageDealt).toLocaleString()}</p>
      </div>
      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Schaden Eingesteckt</p>
        <p className="text-4xl font-black text-red-400">{Math.floor(stats.global.damageTaken).toLocaleString()}</p>
      </div>
      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Kugeln gefeuert</p>
          <p className="text-2xl font-black text-zinc-200">{stats.global.shotsFired.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Headshots</p>
          <p className="text-2xl font-black text-yellow-500">{stats.global.headshots.toLocaleString()}</p>
        </div>
      </div>
    </div>
  </div>
);

export const LogisticsSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-indigo-950/30">
    <p className="text-indigo-400 font-bold tracking-widest text-xs mb-2 uppercase">Amazon Prime des Rim</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-6">Logistik-Hölle</h2>
    <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/20 text-center">
      <p className="text-6xl font-black text-indigo-400 mb-2">{stats.global.itemsHauled.toLocaleString()}</p>
      <p className="text-indigo-200 font-medium">Objekte von A nach B getragen.</p>
      <p className="text-xs text-indigo-400/50 mt-4">Kein Wunder, dass sie alle Rückenschmerzen haben.</p>
    </div>
  </div>
);

export const GluttonySlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-emerald-950/20">
    <p className="text-emerald-500 font-bold tracking-widest text-xs mb-2 uppercase">Völlerei</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-8">Die fressende Horde</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/20 text-center">
        <p className="text-3xl font-black text-emerald-400">{Math.floor(stats.global.foodEaten).toLocaleString()}</p>
        <p className="text-xs text-emerald-200 uppercase mt-2">Nahrungseinheiten <br/>verschlungen</p>
      </div>
      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/20 text-center">
        <p className="text-3xl font-black text-emerald-400">{stats.global.mealsCooked.toLocaleString()}</p>
        <p className="text-xs text-emerald-200 uppercase mt-2">Mahlzeiten <br/>gekocht</p>
      </div>
    </div>
  </div>
);

export const AwardsSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative">
    <p className="text-yellow-500 font-bold tracking-widest text-xs mb-2 uppercase">Die fragwürdigen MVPs</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-6">Zweifelhafter <br/>Ruhm</h2>
    <div className="space-y-4">
      {stats.awards.floorInspector && (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-zinc-500 uppercase font-bold mb-1">🪨 Der Boden-Inspektor</p>
          <p className="text-xl font-bold text-white">{stats.awards.floorInspector.name}</p>
          <p className="text-sm text-zinc-400 mt-1">Lag insgesamt <strong className="text-white">{stats.awards.floorInspector.val.toFixed(1)} Tage</strong> wehrlos auf dem Boden.</p>
        </div>
      )}
      {stats.awards.pacifistParasite && (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-zinc-500 uppercase font-bold mb-1">🍔 Der Parasit</p>
          <p className="text-xl font-bold text-white">{stats.awards.pacifistParasite.name}</p>
          <p className="text-sm text-zinc-400 mt-1">Hat genau 0 Feinde getötet, aber stolze <strong className="text-white">{Math.floor(stats.awards.pacifistParasite.eaten)} Mahlzeiten</strong> vernichtet.</p>
        </div>
      )}
      {stats.awards.mostMentalBreaks && (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-zinc-500 uppercase font-bold mb-1">🤯 Nerven aus Glas</p>
          <p className="text-xl font-bold text-white">{stats.awards.mostMentalBreaks.name}</p>
          <p className="text-sm text-zinc-400 mt-1">Hatte <strong className="text-white">{stats.awards.mostMentalBreaks.val}</strong> Nervenzusammenbrüche.</p>
        </div>
      )}
    </div>
  </div>
);

export const MedicalSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-cyan-950/20">
    <p className="text-cyan-500 font-bold tracking-widest text-xs mb-2 uppercase">Grey&apos;s Anatomy</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-8">Medizinische <br/>Wunder</h2>
    {stats.awards.mostTimeInBed && (
      <div className="bg-cyan-900/20 p-5 rounded-2xl border border-cyan-500/30 text-center mb-4">
        <p className="text-cyan-400 font-bold uppercase text-xs">Der Dauerpatient</p>
        <p className="text-2xl font-black text-white mt-1">{stats.awards.mostTimeInBed.name}</p>
        <p className="text-cyan-200 mt-1">Lag {stats.awards.mostTimeInBed.val.toFixed(1)} Tage im Krankenbett.</p>
      </div>
    )}
    {stats.records.organsHarvested > 0 && (
      <div className="bg-green-900/20 p-5 rounded-2xl border border-green-500/30 text-center mt-4">
        <p className="text-3xl font-black text-green-400">{stats.records.organsHarvested}</p>
        <p className="text-green-200 text-sm mt-1">Gesunde Organe &quot;umverteilt&quot;.</p>
      </div>
    )}
  </div>
);

export const WarCrimesSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col justify-center relative z-20 px-8 bg-red-950/40">
    <p className="text-red-500 font-bold tracking-widest text-xs mb-2 uppercase">Ethik-Kommission</p>
    <h2 className="text-5xl font-black text-white leading-tight mb-8">Kriegs-<br/>verbrechen</h2>
    <div className="space-y-3">
      {stats.records.butcheredHumanoids > 0 && (
        <div className="bg-white/5 rounded-2xl p-5 border border-red-500/20">
          <p className="text-red-400 font-black text-3xl">{stats.records.butcheredHumanoids}</p>
          <p className="text-white text-sm font-medium mt-1">Menschen an der Schlachtbank verarbeitet.</p>
        </div>
      )}
      {stats.records.cannibalismCount > 0 && (
        <div className="bg-white/5 rounded-2xl p-5 border border-red-500/20">
          <p className="text-red-400 font-black text-3xl">{stats.records.cannibalismCount}</p>
          <p className="text-white text-sm font-medium mt-1">Rohe Kannibalismus-Delikte.</p>
        </div>
      )}
    </div>
  </div>
);

export const ConclusionSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center text-center relative">
    <p className="text-orange-500 font-bold tracking-widest text-xs mb-4 uppercase">Zusammenfassung</p>
    <h2 className="text-4xl font-black text-white mb-6">Ein wilder Ritt.</h2>
    <p className="text-zinc-300 mb-8">Mit {stats.global.mentalBreaks} Nervenzusammenbrüchen, {stats.global.corpsesBuried} begrabenen Leichen und {stats.records.lovers} neuen Liebschaften.</p>
    {stats.wealthHistory.length > 0 && (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
        <p className="text-zinc-400 text-sm mb-2">Maximaler Reichtum</p>
        <p className="text-4xl font-black text-orange-400">
          ${Math.floor(Math.max(...stats.wealthHistory)).toLocaleString('de-DE')}
        </p>
      </div>
    )}
  </div>
);

export const ChaosChronikSlide = ({ stats }: { stats: ParsedStats }) => {
  const max = stats.topEvents[0]?.count || 1;
  return (
    <div className="flex-1 flex flex-col px-8 justify-center relative bg-purple-950/20">
      <p className="text-purple-400 font-bold tracking-widest text-xs mb-2 uppercase">🔮 Chaos-Chronik</p>
      <h2 className="text-4xl font-black text-white leading-tight mb-6">Deine Top Events</h2>
      <div className="space-y-3">
        {stats.topEvents.map((event, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 truncate max-w-[70%]">{event.name}</span>
              <span className="text-purple-400 font-bold">{event.count}×</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(event.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RaidReportSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-amber-950/20">
    <p className="text-amber-400 font-bold tracking-widest text-xs mb-2 uppercase">⚔️ Raid-Report</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-4">Überlebte Raids</h2>
    <div className="bg-amber-900/20 p-6 rounded-3xl border border-amber-500/20 text-center mb-6">
      <p className="text-7xl font-black text-amber-400">{stats.events.raidCount}</p>
      <p className="text-amber-200 font-medium mt-1">feindliche Überfälle</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-black/40 p-4 rounded-2xl text-center">
        <p className="text-3xl font-black text-white">{stats.records.prisonersCaptured}</p>
        <p className="text-xs text-zinc-400 uppercase mt-1">Gefangene</p>
      </div>
      <div className="bg-black/40 p-4 rounded-2xl text-center">
        <p className="text-3xl font-black text-white">{stats.records.prisonersRecruited}</p>
        <p className="text-xs text-zinc-400 uppercase mt-1">Rekrutiert</p>
      </div>
    </div>
  </div>
);

export const DisasterSlide = ({ stats }: { stats: ParsedStats }) => {
  const disasters = [
    { icon: "☣️", label: "Toxic Fallout", count: stats.events.toxicFalloutCount },
    { icon: "🔥", label: "Hitzewelle", count: stats.events.heatWaveCount },
    { icon: "❄️", label: "Cold Snap", count: stats.events.coldSnapCount },
    { icon: "⚡", label: "Solar Flare", count: stats.events.solarFlareCount },
    { icon: "🌑", label: "Eclipse", count: stats.events.eclipseCount },
    { icon: "🌋", label: "Volcanic Winter", count: stats.events.volcanicWinterCount },
    { icon: "🧠", label: "Psychic Drone", count: stats.events.psychicDroneCount },
  ].filter(d => d.count > 0);

  if (disasters.length === 0) return null;

  return (
    <div className="flex-1 flex flex-col px-8 justify-center relative bg-teal-950/20">
      <p className="text-teal-400 font-bold tracking-widest text-xs mb-2 uppercase">🌋 Naturkatastrophen</p>
      <h2 className="text-4xl font-black text-white leading-tight mb-6">Das Wetter meinte es ernst</h2>
      <div className="space-y-3">
        {disasters.map((d, i) => (
          <div key={i} className="flex justify-between items-center bg-teal-900/20 p-4 rounded-xl border border-teal-500/20">
            <span className="text-zinc-300">{d.icon} {d.label}</span>
            <span className="font-bold text-teal-400 text-xl">{d.count}×</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WildlifeSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-lime-950/20">
    <p className="text-lime-400 font-bold tracking-widest text-xs mb-2 uppercase">🐾 Tierleben</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-6">Freund oder Feind?</h2>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-lime-900/20 p-5 rounded-2xl border border-lime-500/20 text-center">
        <p className="text-3xl font-black text-lime-400">{stats.global.animalsTamed}</p>
        <p className="text-xs text-lime-200 uppercase mt-2">Gezähmt</p>
      </div>
      <div className="bg-lime-900/20 p-5 rounded-2xl border border-lime-500/20 text-center">
        <p className="text-3xl font-black text-lime-400">{stats.global.animalsSlaughtered}</p>
        <p className="text-xs text-lime-200 uppercase mt-2">Geschlachtet</p>
      </div>
    </div>
    {stats.events.manhunterCount > 0 && (
      <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl text-center">
        <p className="text-2xl font-black text-red-400">{stats.events.manhunterCount}× Manhunter-Pack</p>
        <p className="text-xs text-red-300 mt-1">Wütende Herden haben deine Kolonie gestürmt.</p>
      </div>
    )}
  </div>
);

export const MentalStateSlide = ({ stats }: { stats: ParsedStats }) => (
  <div className="flex-1 flex flex-col px-8 justify-center relative bg-fuchsia-950/20">
    <p className="text-fuchsia-400 font-bold tracking-widest text-xs mb-2 uppercase">🧠 Mentale Gesundheit</p>
    <h2 className="text-4xl font-black text-white leading-tight mb-6">Am Limit</h2>
    <div className="bg-fuchsia-900/20 p-6 rounded-3xl border border-fuchsia-500/20 text-center mb-4">
      <p className="text-7xl font-black text-fuchsia-400">{stats.global.mentalBreaks}</p>
      <p className="text-fuchsia-200 font-medium mt-1">Nervenzusammenbrüche</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {stats.records.heatstrokes > 0 && (
        <div className="bg-black/40 p-4 rounded-2xl text-center">
          <p className="text-2xl font-black text-orange-400">{stats.records.heatstrokes}</p>
          <p className="text-xs text-zinc-400 uppercase mt-1">Hitzschläge</p>
        </div>
      )}
      {stats.awards.pyromaniac && (
        <div className="bg-black/40 p-4 rounded-2xl text-center">
          <p className="text-sm font-bold text-red-400">🔥 Pyromaniac</p>
          <p className="text-xs text-white mt-1">{stats.awards.pyromaniac.name}</p>
          <p className="text-xs text-zinc-400">{stats.awards.pyromaniac.fires} Brände</p>
        </div>
      )}
    </div>
  </div>
);

const storytellerColors = {
  CassandraClassic: { bg: "bg-rose-950/20", border: "border-rose-500/20", accent: "text-rose-400", card: "bg-rose-900/20", cardBorder: "border-rose-500/30", quote: "\"Jede Entscheidung hat ihren Preis.\"" },
  RandyRandom:      { bg: "bg-amber-950/20", border: "border-amber-500/20", accent: "text-amber-400", card: "bg-amber-900/20", cardBorder: "border-amber-500/30", quote: "\"Ich hab' keine Ahnung, was als nächstes passiert.\"" },
  PhoebeChillax:    { bg: "bg-sky-950/20", border: "border-sky-500/20", accent: "text-sky-400", card: "bg-sky-900/20", cardBorder: "border-sky-500/30", quote: "\"Entspann dich. Meistens.\"" },
};
const defaultStorytellerColor = { bg: "bg-zinc-950/20", border: "border-zinc-500/20", accent: "text-zinc-400", card: "bg-zinc-900/20", cardBorder: "border-zinc-500/30", quote: "\"Das Rim hat seine eigenen Regeln.\"" };

export const StorytellerSlide = ({ stats }: { stats: ParsedStats }) => {
  const colors = storytellerColors[stats.storyteller as keyof typeof storytellerColors] ?? defaultStorytellerColor;
  return (
    <div className={`flex-1 flex flex-col px-8 justify-center relative ${colors.bg}`}>
      <p className={`${colors.accent} font-bold tracking-widest text-xs mb-2 uppercase`}>🎭 Dein Storyteller</p>
      <h2 className="text-4xl font-black text-white leading-tight mb-2">{stats.storyteller}</h2>
      <p className={`${colors.accent} italic text-sm mb-6`}>{colors.quote}</p>
      <div className={`${colors.card} p-5 rounded-2xl border ${colors.cardBorder} space-y-3`}>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Szenario</span>
          <span className="font-bold text-white">{stats.scenario}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Schwierigkeit</span>
          <span className="font-bold text-white">{stats.difficulty}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm">Überlebte Tage</span>
          <span className={`font-black text-xl ${colors.accent}`}>{stats.ending.daysLasted}</span>
        </div>
      </div>
    </div>
  );
};

const endingConfig = {
  ship_launched:  { bg: "bg-blue-950/20", accent: "text-blue-400", card: "bg-blue-900/20", cardBorder: "border-blue-500/30", emoji: "🚀", title: "Schiff gestartet!", desc: "Ihr habt es geschafft – Freiheit unter den Sternen." },
  royalty_ending: { bg: "bg-yellow-950/20", accent: "text-yellow-400", card: "bg-yellow-900/20", cardBorder: "border-yellow-500/30", emoji: "👑", title: "Königliches Ende", desc: "Adel verpflichtet – und rettet." },
  archonexus:     { bg: "bg-violet-950/20", accent: "text-violet-400", card: "bg-violet-900/20", cardBorder: "border-violet-500/30", emoji: "🌌", title: "Archonexus erreicht", desc: "Jenseits der menschlichen Vorstellung." },
  colony_lost:    { bg: "bg-red-950/20", accent: "text-red-400", card: "bg-red-900/20", cardBorder: "border-red-500/30", emoji: "💀", title: "Kolonie verloren", desc: "Das Rim hat gewonnen. Diesmal." },
  still_running:  { bg: "bg-emerald-950/20", accent: "text-emerald-400", card: "bg-emerald-900/20", cardBorder: "border-emerald-500/30", emoji: "⏳", title: "Noch am Laufen", desc: "Die Geschichte ist noch nicht zu Ende." },
  unknown:        { bg: "bg-zinc-950/20", accent: "text-zinc-400", card: "bg-zinc-900/20", cardBorder: "border-zinc-500/30", emoji: "❓", title: "Unbekanntes Ende", desc: "Was auch immer passiert ist – du hast es erlebt." },
};

export const EndingSlide = ({ stats }: { stats: ParsedStats }) => {
  const cfg = endingConfig[stats.ending.type] ?? endingConfig.unknown;
  return (
    <div className={`flex-1 flex flex-col px-8 justify-center relative ${cfg.bg}`}>
      <p className={`${cfg.accent} font-bold tracking-widest text-xs mb-2 uppercase`}>Kapitel-Ende</p>
      <div className="text-6xl mb-4">{cfg.emoji}</div>
      <h2 className="text-4xl font-black text-white leading-tight mb-2">{cfg.title}</h2>
      <p className={`${cfg.accent} text-sm mb-6`}>{cfg.desc}</p>
      <div className={`${cfg.card} p-5 rounded-2xl border ${cfg.cardBorder}`}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className={`text-3xl font-black ${cfg.accent}`}>{stats.ending.colonistsSurvived}</p>
            <p className="text-xs text-zinc-400 uppercase mt-1">Überlebende</p>
          </div>
          <div>
            <p className="text-3xl font-black text-red-400">{stats.ending.colonistsLost}</p>
            <p className="text-xs text-zinc-400 uppercase mt-1">Verloren</p>
          </div>
        </div>
      </div>
    </div>
  );
};