import { Player, Position } from '../models/player.model';
import { AvailabilityStatus } from '../models/availability.model';
import {
  GeneratedTeams,
  TeamGenerationOutcome,
  TeamSide,
} from '../models/team.model';

export const ALGORITHM_VERSION = '1.0.0';
export const MIN_PLAYERS_ABSOLUTE = 4;
export const MIN_PLAYERS_RECOMMENDED = 8;

const POSITION_WEIGHT: Record<Position, number> = {
  Goalkeeper: 2.5,
  Defender: 1.5,
  Midfielder: 1.2,
  Forward: 1.0,
};

const emptyPositionCounts = (): Record<Position, number> => ({
  Goalkeeper: 0,
  Defender: 0,
  Midfielder: 0,
  Forward: 0,
});

export interface BalancingPlayer extends Player {
  availabilityStatus: AvailabilityStatus;
  weight: number;
}

function ageFactor(age: number): number {
  if (age >= 22 && age <= 32) return 1;
  if (age < 18 || age > 40) return 0.6;
  return 0.85;
}

export function computePlayerWeight(player: Player): number {
  const boost = player.achievementBoost ?? 0;
  return (
    0.55 * player.skillRating +
    0.2 * Math.min(player.yearsExperience, 15) +
    0.15 * POSITION_WEIGHT[player.position] * 2 +
    0.1 * ageFactor(player.age) * 10 +
    boost
  );
}

function buildTeamSide(playerIds: string[], players: Map<string, Player>): TeamSide {
  const positionCounts = emptyPositionCounts();
  let totalSkill = 0;
  for (const id of playerIds) {
    const p = players.get(id);
    if (!p) continue;
    totalSkill += p.skillRating;
    positionCounts[p.position]++;
  }
  const avgSkill = playerIds.length ? totalSkill / playerIds.length : 0;
  return { playerIds, totalSkill, avgSkill, positionCounts };
}

function sumSkills(ids: string[], players: Map<string, Player>): number {
  return ids.reduce((s, id) => s + (players.get(id)?.skillRating ?? 0), 0);
}

function positionPenalty(a: TeamSide, b: TeamSide): number {
  let penalty = 0;
  const positions: Position[] = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  for (const pos of positions) {
    penalty += Math.abs(a.positionCounts[pos] - b.positionCounts[pos]) * 3;
  }
  return penalty;
}

function computeBalanceScore(
  teamA: TeamSide,
  teamB: TeamSide,
  players: Map<string, Player>
): number {
  const skillDiff = Math.abs(teamA.totalSkill - teamB.totalSkill);
  const ages = (ids: string[]) =>
    ids.map((id) => players.get(id)?.age ?? 0).filter(Boolean);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const ageDiff = Math.abs(avg(ages(teamA.playerIds)) - avg(ages(teamB.playerIds))) * 2;
  return skillDiff + ageDiff + positionPenalty(teamA, teamB);
}

function localSwapImprove(
  teamA: string[],
  teamB: string[],
  players: Map<string, Player>,
  passes = 3
): [string[], string[]] {
  let a = [...teamA];
  let b = [...teamB];
  for (let p = 0; p < passes; p++) {
    let improved = false;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        const pa = players.get(a[i]);
        const pb = players.get(b[j]);
        if (!pa || !pb || pa.position !== pb.position) continue;
        const newA = [...a];
        const newB = [...b];
        newA[i] = b[j];
        newB[j] = a[i];
        const sideA = buildTeamSide(newA, players);
        const sideB = buildTeamSide(newB, players);
        const oldScore = computeBalanceScore(buildTeamSide(a, players), buildTeamSide(b, players), players);
        const newScore = computeBalanceScore(sideA, sideB, players);
        if (newScore < oldScore) {
          a = newA;
          b = newB;
          improved = true;
        }
      }
    }
    if (!improved) break;
  }
  return [a, b];
}

function snakeAssign(sorted: BalancingPlayer[], seed: number): [string[], string[]] {
  const teamA: string[] = [];
  const teamB: string[] = [];
  let toggle = seed % 2 === 0;
  for (const player of sorted) {
    if (toggle) teamA.push(player.id);
    else teamB.push(player.id);
    toggle = !toggle;
  }
  return [teamA, teamB];
}

function assignByPositionBuckets(players: BalancingPlayer[], seed: number): [string[], string[]] {
  const positions: Position[] = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  let teamA: string[] = [];
  let teamB: string[] = [];
  let flip = seed % 2 === 0;

  for (const pos of positions) {
    const bucket = players
      .filter((p) => p.position === pos)
      .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
    if (bucket.length === 0) continue;

    if (pos === 'Goalkeeper' && bucket.length >= 2) {
      const [gkA, gkB] = snakeAssign(bucket, seed);
      teamA = [...teamA, ...gkA];
      teamB = [...teamB, ...gkB];
      continue;
    }

    bucket.sort((a, b) => {
      const tie = b.weight - a.weight;
      if (tie !== 0) return tie;
      return (seed + a.id.charCodeAt(0)) % 2 === 0 ? -1 : 1;
    });

    for (const p of bucket) {
      const sumA = teamA.reduce((s, id) => s + (players.find((x) => x.id === id)?.weight ?? 0), 0);
      const sumB = teamB.reduce((s, id) => s + (players.find((x) => x.id === id)?.weight ?? 0), 0);
      if (sumA <= sumB) teamA.push(p.id);
      else teamB.push(p.id);
    }
    flip = !flip;
  }
  return [teamA, teamB];
}

export function generateBalancedTeams(
  allPlayers: Player[],
  availabilityMap: Map<string, AvailabilityStatus>,
  options?: { seed?: number; minimum?: number }
): TeamGenerationOutcome {
  const minimum = options?.minimum ?? MIN_PLAYERS_ABSOLUTE;
  const seed = options?.seed ?? Date.now();

  const available: BalancingPlayer[] = allPlayers
    .filter((p) => availabilityMap.get(p.id) === 'available')
    .map((p) => ({
      ...p,
      availabilityStatus: 'available' as const,
      weight: computePlayerWeight(p),
    }));

  if (available.length < minimum) {
    return {
      success: false,
      message: `Need at least ${minimum} confirmed (Available) players. Currently ${available.length}.`,
      minimumRequired: minimum,
    };
  }

  let working = [...available];
  let substituteId: string | undefined;

  if (working.length % 2 !== 0) {
    working.sort((a, b) => a.weight - b.weight);
    const sub = working.shift();
    substituteId = sub?.id;
  }

  let [teamAIds, teamBIds] = assignByPositionBuckets(working, seed);
  [teamAIds, teamBIds] = localSwapImprove(teamAIds, teamBIds, new Map(working.map((p) => [p.id, p])));

  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));
  const teamA = buildTeamSide(teamAIds, playerMap);
  const teamB = buildTeamSide(teamBIds, playerMap);
  const balanceScore = computeBalanceScore(teamA, teamB, playerMap);

  const teams: GeneratedTeams = {
    teamA,
    teamB,
    balanceScore,
    generatedAt: new Date().toISOString(),
    algorithmVersion: ALGORITHM_VERSION,
    substitutePlayerId: substituteId,
  };

  let message: string | undefined;
  if (available.length < MIN_PLAYERS_RECOMMENDED) {
    message = `Teams generated with ${available.length} players (${MIN_PLAYERS_RECOMMENDED} recommended for full match).`;
  }
  if (substituteId) {
    message = (message ? message + ' ' : '') + 'One player assigned as substitute (odd count).';
  }

  return { success: true, teams, message };
}