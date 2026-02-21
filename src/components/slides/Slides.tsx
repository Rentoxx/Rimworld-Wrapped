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