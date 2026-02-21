import pako from "pako";
import { ParsedStats } from "./types";
import { RIMWORLD_STATS_MAPPER } from "./constants";

export async function parseRimworldSave(file: File): Promise<ParsedStats> {
  const newStats: ParsedStats = {
    colonyName: "Deine Kolonie", playTimeTicks: 0, scenario: "Unbekannt", storyteller: "Unbekannt", difficulty: "Normal",
    topEvents: [],
    records: { cannibalismCount: 0, butcheredHumanoids: 0, heatstrokes: 0, lovers: 0, raids: 0, organsHarvested: 0, prisonersRecruited: 0, prisonersCaptured: 0, firesFought: 0, timesSetOnFire: 0, researchPoints: 0, plantsHarvested: 0, plantsGrown: 0, artifactsActivated: 0, containersOpened: 0 },
    events: { raidCount: 0, infestationCount: 0, solarFlareCount: 0, eclipseCount: 0, toxicFalloutCount: 0, coldSnapCount: 0, heatWaveCount: 0, manhunterCount: 0, traderCount: 0, transportPodCrashCount: 0, psychicDroneCount: 0, volcanicWinterCount: 0 },
    ending: { type: "still_running", colonistsSurvived: 0, colonistsLost: 0, daysLasted: 0 },
    wealthHistory: [],
    global: { killsTotal: 0, killsHuman: 0, killsAnimal: 0, killsMech: 0, damageDealt: 0, damageTaken: 0, shotsFired: 0, headshots: 0, mealsCooked: 0, foodEaten: 0, itemsHauled: 0, dirtCleaned: 0, mentalBreaks: 0, animalsTamed: 0, animalsSlaughtered: 0, corpsesBuried: 0 },
    graveyard: { male: 0, female: 0, children: 0, total: 0 },
    awards: { totalColonists: 0, bestShooter: null, bestMelee: null, bestDoctor: null, mostKills: null, mostDamageTaken: null, mostMentalBreaks: null, mostTimeInBed: null, mostDirtCleaned: null, mostMealsCooked: null, floorInspector: null, pacifistParasite: null, pyromaniac: null }
  };

  const eventCounts: Record<string, number> = {};
  const archivableDefCounts: Record<string, number> = {};
  let wealthBase64 = "";
  let isWealthDeflated = false;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allColonists: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentPawn: any = null;

  const stream = file.stream();
  const decoder = new TextDecoderStream("utf-8");
  const reader = stream.pipeThrough(decoder).getReader();

  let isReadingInfo = false, isReadingScenario = false, isReadingStoryteller = false;
  let isReadingArchivables = false, isReadingTaleManager = false;
  let recentlySawWealthTotal = false, isReadingWealthBlock = false;
  
  let isRecordsBlock = false, isValsBlock = false;
  let recordIndex = 0;
  let currentSkill = "";
  let partialLine = ""; 
  let isReadingDeadPawns = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunkStr = partialLine + value;
    const lines = chunkStr.split("\n");
    partialLine = lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      // BLÖCKE
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
      if (trimmedLine.startsWith("<pawnsDead>")) isReadingDeadPawns = true;
      if (trimmedLine.startsWith("</pawnsDead>")) isReadingDeadPawns = false;

      // META
      if (isReadingInfo && trimmedLine.startsWith("<realPlayTimeInteracting>")) newStats.playTimeTicks = parseFloat(trimmedLine.replace(/<\/?realPlayTimeInteracting>/g, ""));
      if (isReadingScenario && trimmedLine.startsWith("<name>")) newStats.scenario = trimmedLine.replace(/<\/?name>/g, "");
      if (isReadingStoryteller && trimmedLine.startsWith("<def>")) newStats.storyteller = trimmedLine.replace(/<\/?def>/g, "");
      if (isReadingStoryteller && trimmedLine.startsWith("<difficulty>")) newStats.difficulty = trimmedLine.replace(/<\/?difficulty>/g, "");

      // PAWN PARSER
      if (trimmedLine === "<def>Human</def>") {
        if (currentPawn && currentPawn.isColonist) allColonists.push(currentPawn);
        
        currentPawn = {
          first: "", nick: "", last: "", fullName: "",
          isColonist: false, isDead: isReadingDeadPawns,
          gender: "Male", age: 0,
          skills: {}, records: {}, wounds: 0, isReadingHediffs: false
        };
      }

      if (currentPawn) {
        if (trimmedLine === "<kindDef>Colonist</kindDef>") currentPawn.isColonist = true;
        if (trimmedLine === "<healthState>Dead</healthState>") currentPawn.isDead = true;
        
        if (trimmedLine.startsWith("<gender>")) currentPawn.gender = trimmedLine.replace(/<\/?gender>/g, "");
        if (trimmedLine.startsWith("<ageBiologicalTicks>")) {
            const ticks = parseFloat(trimmedLine.replace(/<\/?ageBiologicalTicks>/g, ""));
            currentPawn.age = ticks / 3600000; 
            
            if (currentPawn.isDead && !currentPawn.isColonist) {
                newStats.graveyard.total++;
                if (currentPawn.gender === "Female") newStats.graveyard.female++;
                else newStats.graveyard.male++;
                if (currentPawn.age < 18) newStats.graveyard.children++;
            }
        }

        if (trimmedLine.startsWith("<first>")) currentPawn.first = trimmedLine.replace(/<\/?first>/g, "");
        if (trimmedLine.startsWith("<nick>")) currentPawn.nick = trimmedLine.replace(/<\/?nick>/g, "");

        const skillDefMatch = trimmedLine.match(/<def>(Shooting|Melee|Medicine|Intellectual|Cooking|Construction|Plants|Mining|Animals|Crafting|Artistic|Social)<\/def>/);
        if (skillDefMatch) currentSkill = skillDefMatch[1];
        const levelMatch = trimmedLine.match(/<level>(\d+)<\/level>/);
        if (levelMatch && currentSkill) {
          currentPawn.skills[currentSkill] = parseInt(levelMatch[1], 10);
          currentSkill = "";
        }

        if (trimmedLine.startsWith("<hediffs>")) currentPawn.isReadingHediffs = true;
        if (trimmedLine.startsWith("</hediffs>")) currentPawn.isReadingHediffs = false;
        if (currentPawn.isReadingHediffs && trimmedLine.startsWith("<def>")) {
            const hediff = trimmedLine.replace(/<\/?def>/g, "");
            if (["Gunshot", "Cut", "Stab", "Bite", "Scratch", "Bruise", "Crush", "MissingBodyPart"].includes(hediff)) {
                currentPawn.wounds++;
            }
        }

        if (trimmedLine === "<records>") isRecordsBlock = true;
        if (trimmedLine === "</records>") isRecordsBlock = false;
        if (isRecordsBlock && trimmedLine === "<vals>") { isValsBlock = true; recordIndex = 0; }
        if (isRecordsBlock && trimmedLine === "</vals>") isValsBlock = false;

        if (isValsBlock && trimmedLine.startsWith("<li>")) {
          let val = parseFloat(trimmedLine.replace(/<\/?li>/g, "")) || 0;
          if (RIMWORLD_STATS_MAPPER[recordIndex]) {
            const statName = RIMWORLD_STATS_MAPPER[recordIndex];
            if (recordIndex >= 43) val = val / 60000.0;
            if (val > 0) currentPawn.records[statName] = val;
          }
          recordIndex++;
        }
      }

      // EVENTS & TALES
      if (isReadingArchivables && trimmedLine.startsWith("<def>")) {
        const defName = trimmedLine.replace(/<\/?def>/g, "");
        archivableDefCounts[defName] = (archivableDefCounts[defName] || 0) + 1;
      }
      if (isReadingArchivables && trimmedLine.startsWith("<text>")) {
        let rawText = trimmedLine.replace(/<\/?text>/g, "").replace(/<color[^>]*>|<\/color>/g, "").replace(/\(\*[^)]+\)|\(\/[^)]+\)/g, "");
        if (!rawText.includes("ist voll verheilt") && !rawText.includes("Rettung benötigt")) {
          if (rawText.includes("Überfall")) rawText = "Feindlicher Überfall";
          else if (rawText.includes("Karawane")) rawText = "Händler/Karawane eingetroffen";
          else rawText = rawText.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
          if (rawText.length > 5) eventCounts[rawText] = (eventCounts[rawText] || 0) + 1;
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

      // WEALTH
      if (trimmedLine === "<def>Wealth_Total</def>") recentlySawWealthTotal = true;
      else if (recentlySawWealthTotal && trimmedLine.startsWith("<records>")) {
        isReadingWealthBlock = true; isWealthDeflated = false; recentlySawWealthTotal = false;
        wealthBase64 += trimmedLine.replace("<records>", "").replace("</records>", "");
      } else if (recentlySawWealthTotal && trimmedLine.startsWith("<recordsDeflate>")) {
        isReadingWealthBlock = true; isWealthDeflated = true; recentlySawWealthTotal = false;
        wealthBase64 += trimmedLine.replace("<recordsDeflate>", "").replace("</recordsDeflate>", "");
      } else if (isReadingWealthBlock) {
        if (trimmedLine.includes("</records>") || trimmedLine.includes("</recordsDeflate>")) {
          isReadingWealthBlock = false;
          wealthBase64 += trimmedLine.replace(/<\/?records(Deflate)?>/g, "");
        } else wealthBase64 += trimmedLine;
      }
    }
  }
  
  if (currentPawn && currentPawn.isColonist) allColonists.push(currentPawn);

  newStats.topEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })).slice(0, 5);

  // AGGREGATION
  const validColonists = allColonists.filter(c => c.first || c.nick).map(c => {
    c.fullName = c.nick ? `${c.first} '${c.nick}'` : c.first;
    return c;
  });
  newStats.awards.totalColonists = validColonists.length;

  validColonists.forEach(c => {
    newStats.global.killsTotal += c.records["Tötungen"] || 0;
    newStats.global.killsHuman += c.records["Tötungen (menschlich)"] || 0;
    newStats.global.killsAnimal += c.records["Tötungen (Tiere)"] || 0;
    newStats.global.killsMech += c.records["Tötungen (Mechs)"] || 0;
    newStats.global.damageDealt += c.records["Schaden verursacht"] || 0;
    newStats.global.damageTaken += c.records["Schaden erlitten"] || 0;
    newStats.global.shotsFired += c.records["Schüsse abgegeben"] || 0;
    newStats.global.headshots += c.records["Kopfschüsse"] || 0;
    newStats.global.mealsCooked += c.records["Mahlzeiten gekocht"] || 0;
    newStats.global.foodEaten += c.records["Nahrung gegessen"] || 0;
    newStats.global.itemsHauled += c.records["Objekte weggetragen"] || 0;
    newStats.global.dirtCleaned += c.records["Schmutz entfernt"] || 0;
    newStats.global.mentalBreaks += c.records["Nervenzusammenbrüche"] || 0;
    newStats.global.animalsTamed += c.records["Wildtiere gezähmt"] || 0;
    newStats.global.animalsSlaughtered += c.records["Haustiere geschlachtet"] || 0;
    newStats.global.corpsesBuried += c.records["Leichen beerdigt"] || 0;
  });

  const getHighestRecord = (recordName: string) => {
    let best = null, maxVal = 0;
    for (const c of validColonists) {
      const val = c.records[recordName] || 0;
      if (val > maxVal) { maxVal = val; best = c; }
    }
    return best && maxVal > 0 ? { name: best.fullName, val: maxVal } : null;
  };

  newStats.awards.mostKills = getHighestRecord("Tötungen");
  newStats.awards.mostDamageTaken = getHighestRecord("Schaden erlitten");
  newStats.awards.mostMentalBreaks = getHighestRecord("Nervenzusammenbrüche");
  newStats.awards.mostTimeInBed = getHighestRecord("Zeit im Bett");
  newStats.awards.mostDirtCleaned = getHighestRecord("Schmutz entfernt");
  newStats.awards.mostMealsCooked = getHighestRecord("Mahlzeiten gekocht");
  newStats.awards.floorInspector = getHighestRecord("Zeit am Boden");
  const pyromaniacRecord = getHighestRecord("Anzahl gebrannt");
  newStats.awards.pyromaniac = pyromaniacRecord ? { name: pyromaniacRecord.name, fires: pyromaniacRecord.val } : null;

  let worstParasite = null; let maxEatenByPacifist = 0;
  for (const c of validColonists) {
      const kills = c.records["Tötungen"] || 0;
      const eaten = c.records["Nahrung gegessen"] || 0;
      if (kills === 0 && eaten > maxEatenByPacifist) {
          maxEatenByPacifist = eaten; worstParasite = c;
      }
  }
  if (worstParasite) newStats.awards.pacifistParasite = { name: worstParasite.fullName, eaten: maxEatenByPacifist };

  // NEW: Aggregate new records fields
  validColonists.forEach(c => {
    newStats.records.firesFought += c.records["Feuer gelöscht"] || 0;
    newStats.records.timesSetOnFire += c.records["Anzahl gebrannt"] || 0;
    newStats.records.prisonersCaptured += c.records["Personen eingefangen"] || 0;
    newStats.records.prisonersRecruited += c.records["Gefangene rekrutiert"] || 0;
    newStats.records.researchPoints += c.records["Forschungspunkte generiert"] || 0;
    newStats.records.plantsHarvested += c.records["Pflanzen geerntet"] || 0;
    newStats.records.plantsGrown += c.records["Pflanzen angebaut"] || 0;
    newStats.records.artifactsActivated += c.records["Artefakte aktiviert"] || 0;
    newStats.records.containersOpened += c.records["Behälter geöffnet"] || 0;
  });

  // NEW: Map archivable defs to events fields
  newStats.events.raidCount = archivableDefCounts["RaidEnemy"] || 0;
  newStats.events.infestationCount = archivableDefCounts["Infestation"] || 0;
  newStats.events.solarFlareCount = archivableDefCounts["SolarFlare"] || 0;
  newStats.events.eclipseCount = archivableDefCounts["Eclipse"] || 0;
  newStats.events.toxicFalloutCount = archivableDefCounts["ToxicFallout"] || 0;
  newStats.events.coldSnapCount = archivableDefCounts["ColdSnap"] || 0;
  newStats.events.heatWaveCount = archivableDefCounts["HeatWave"] || 0;
  newStats.events.manhunterCount = archivableDefCounts["ManhunterPack"] || 0;
  newStats.events.traderCount = archivableDefCounts["TraderCaravanArrival"] || 0;
  newStats.events.transportPodCrashCount = archivableDefCounts["ResourcePodCrash"] || 0;
  newStats.events.psychicDroneCount = archivableDefCounts["PsychicDrone"] || 0;
  newStats.events.volcanicWinterCount = archivableDefCounts["VolcanicWinter"] || 0;

  // NEW: Calculate ending fields
  newStats.ending.daysLasted = Math.floor(newStats.playTimeTicks / 60000);
  newStats.ending.colonistsSurvived = newStats.awards.totalColonists;
  newStats.ending.colonistsLost = newStats.graveyard.total;
  const defNames = Object.keys(archivableDefCounts);
  if (defNames.some(d => d.toLowerCase().includes("archonexus"))) newStats.ending.type = "archonexus";
  else if (defNames.some(d => d === "RoyalAscent" || d.toLowerCase().includes("royal"))) newStats.ending.type = "royalty_ending";
  else if (defNames.some(d => d === "GameOverLost" || d.toLowerCase().includes("gameover"))) newStats.ending.type = "colony_lost";
  else if (defNames.some(d => d === "ShipLaunchNotification" || d.toLowerCase().includes("ship"))) newStats.ending.type = "ship_launched";

  // Wealth Decoding
  if (wealthBase64) {
    try {
      const binaryString = atob(wealthBase64.trim());
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      let bufferToRead = bytes.buffer;
      if (isWealthDeflated) bufferToRead = pako.inflateRaw(bytes).buffer;
      newStats.wealthHistory = Array.from(new Float32Array(bufferToRead));
    } catch (err) {}
  }

  return newStats;
}