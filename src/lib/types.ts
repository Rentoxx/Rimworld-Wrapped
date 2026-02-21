export type ParsedStats = {
  colonyName: string;
  playTimeTicks: number;
  scenario: string;
  storyteller: string;
  difficulty: string;
  topEvents: { name: string; count: number }[];
  records: {
    cannibalismCount: number;
    butcheredHumanoids: number;
    heatstrokes: number;
    lovers: number;
    raids: number;
    organsHarvested: number;
    prisonersRecruited: number;
    prisonersCaptured: number;
    firesFought: number;
    timesSetOnFire: number;
    researchPoints: number;
    plantsHarvested: number;
    plantsGrown: number;
    artifactsActivated: number;
    containersOpened: number;
  };

  events: {
    raidCount: number;
    infestationCount: number;
    solarFlareCount: number;
    eclipseCount: number;
    toxicFalloutCount: number;
    coldSnapCount: number;
    heatWaveCount: number;
    manhunterCount: number;
    traderCount: number;
    transportPodCrashCount: number;
    psychicDroneCount: number;
    volcanicWinterCount: number;
  };

  ending: {
    type: "ship_launched" | "royalty_ending" | "archonexus" | "colony_lost" | "still_running" | "unknown";
    colonistsSurvived: number;
    colonistsLost: number;
    daysLasted: number;
  };
  wealthHistory: number[];
  
  global: {
    killsTotal: number; killsHuman: number; killsAnimal: number; killsMech: number;
    damageDealt: number; damageTaken: number;
    shotsFired: number; headshots: number;
    mealsCooked: number; foodEaten: number;
    itemsHauled: number; dirtCleaned: number;
    mentalBreaks: number;
    animalsTamed: number; animalsSlaughtered: number;
    corpsesBuried: number;
  };
  
  graveyard: {
    male: number; female: number; children: number; total: number;
  };

  awards: {
    totalColonists: number;
    bestShooter: { name: string; level: number; wounds: number } | null;
    bestMelee: { name: string; level: number; wounds: number } | null;
    bestDoctor: { name: string; level: number; wounds: number } | null;
    mostKills: { name: string; val: number } | null;
    mostDamageTaken: { name: string; val: number } | null;
    mostMentalBreaks: { name: string; val: number } | null;
    mostTimeInBed: { name: string; val: number } | null;
    mostDirtCleaned: { name: string; val: number } | null;
    mostMealsCooked: { name: string; val: number } | null;
    floorInspector: { name: string; val: number } | null;
    pacifistParasite: { name: string; eaten: number } | null;
    pyromaniac: { name: string; fires: number } | null;
  };
};