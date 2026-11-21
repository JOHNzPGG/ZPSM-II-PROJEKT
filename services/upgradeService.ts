import { BuildSlots } from '../components/BuildConfigurator';
import { Component, MOCK_COMPONENTS } from '../constants/mockComponents';

export type UpgradeTier = 'budget' | 'balance' | 'premium';

export type UpgradeOption = {
  tier: UpgradeTier;
  component: Component;
  scoreDelta: number;
  scorePercent: number;
  priceDelta: number;
  profitabilityScore: number;
  profitabilityLabel: string;
  profitabilityColor: string;
  requiresPlatformChange: boolean;
  note: string;
};

export type CategoryUpgrade = {
  slotKey: keyof BuildSlots;
  current: Component;
  options: UpgradeOption[];
  summary: string;
};

export function calculateProfitability(
  scoreDelta: number,
  priceDelta: number,
  currentPrice: number,
): number {
  if (scoreDelta <= 0) return 0;

  const priceRatio =
    priceDelta <= 0
      ? 10
      : Math.max(0, 10 - (priceDelta / Math.max(currentPrice, 100)) * 8);

  const perfBonus =
    scoreDelta >= 30 ? 1.5 : scoreDelta >= 20 ? 1.2 : scoreDelta >= 10 ? 1.0 : 0.7;

  const raw = Math.min(10, priceRatio * perfBonus);
  return Math.round(raw * 10) / 10;
}

export function getProfitabilityLabel(score: number): string {
  if (score >= 8.5) return 'Bardzo opłacalne';
  if (score >= 6.5) return 'Opłacalne';
  if (score >= 4.0) return 'Umiarkowane';
  if (score >= 2.0) return 'Mało opłacalne';
  return 'Nieopłacalne';
}

export function getProfitabilityColor(score: number): string {
  if (score >= 8.5) return '#2EC27E';
  if (score >= 6.5) return '#5EE8A8';
  if (score >= 4.0) return '#FFD100';
  if (score >= 2.0) return '#E8720C';
  return '#E83040';
}

function buildUpgradeNote(
  current: Component,
  candidate: Component,
  requiresPlatformChange: boolean,
): string {
  if (requiresPlatformChange) {
    const candidateSocket = String(candidate.specs['Socket'] ?? '');
    return `Wymaga nowej płyty głównej (${candidateSocket}). Rozważ koszt całej platformy.`;
  }

  const scoreDelta = candidate.score - current.score;
  if (scoreDelta >= 40) return 'Ogromny skok wydajności — wyraźnie odczuwalny w każdej sytuacji.';
  if (scoreDelta >= 25) return 'Znaczący upgrade — odczujesz różnicę zarówno w grach i w pracy.';
  if (scoreDelta >= 15) return 'Dobry krok naprzód, szczególnie w grach i wielowątkowych zadaniach.';
  if (scoreDelta >= 8) return 'Umiarkowana poprawa — warto jeśli masz okazję upolować dobrą cenę.';
  return 'Niewielka różnica — rozważ czy warto, może lepiej poczekać na lepszą ofertę.';
}

function buildUpgradeSummary(current: Component, options: UpgradeOption[]): string {
  if (options.length === 0) {
    return `${current.name} to już topowy procesor w bazie — nie ma lepszej opcji.`;
  }

  const best = options.find((o) => o.tier === 'balance') ?? options[0];
  if (best.profitabilityScore >= 8) {
    return 'Duży potencjał na upgrade — zmiana bardzo opłacalna.';
  }
  if (best.profitabilityScore >= 5) {
    return 'Umiarkowany potencjał — upgrade sensowny przy dobrej cenie.';
  }
  return 'Twój CPU jest dobry — upgrade przyniesie niewielką różnicę.';
}

export function getCpuUpgrades(
  current: Component,
  components: Component[] = MOCK_COMPONENTS,
): UpgradeOption[] {
  const currentSocket = String(current.specs['Socket'] ?? '');

  const candidates = components.filter(
    (c) => c.type === 'CPU' && c.id !== current.id && c.score > current.score,
  );

  if (candidates.length === 0) return [];

  const scored = candidates.map((candidate) => {
    const requiresPlatformChange = String(candidate.specs['Socket'] ?? '') !== currentSocket;
    const scoreDelta = candidate.score - current.score;
    const priceDelta = candidate.price - current.price;
    const profitabilityScore = calculateProfitability(scoreDelta, priceDelta, current.price);

    return {
      component: candidate,
      scoreDelta,
      scorePercent: Math.round((scoreDelta / Math.max(current.score, 1)) * 100),
      priceDelta,
      profitabilityScore,
      profitabilityLabel: getProfitabilityLabel(profitabilityScore),
      profitabilityColor: getProfitabilityColor(profitabilityScore),
      requiresPlatformChange,
      note: buildUpgradeNote(current, candidate, requiresPlatformChange),
    };
  });

  const budgetPool = scored
    .filter((s) => !s.requiresPlatformChange && s.scoreDelta >= 6)
    .sort((a, b) => a.component.price - b.component.price);
  const budgetPick = budgetPool[0] ?? null;

  const balancePool = scored
    .filter((s) => !s.requiresPlatformChange && s.scoreDelta >= 12)
    .sort((a, b) => b.profitabilityScore - a.profitabilityScore);
  const balancePick = balancePool.find((s) => s !== budgetPick) ?? balancePool[0] ?? null;

  const premiumPool = [...scored].sort((a, b) => b.component.score - a.component.score);
  const premiumPick =
    premiumPool.find((s) => s !== budgetPick && s !== balancePick) ?? premiumPool[0] ?? null;

  const result: UpgradeOption[] = [];

  if (budgetPick) {
    result.push({ tier: 'budget', ...budgetPick });
  }
  if (balancePick && balancePick !== budgetPick) {
    result.push({ tier: 'balance', ...balancePick });
  }
  if (premiumPick && premiumPick !== budgetPick && premiumPick !== balancePick) {
    result.push({ tier: 'premium', ...premiumPick });
  }

  return result;
}

export function getUpgradeSuggestions(
  slots: BuildSlots,
  components: Component[] = MOCK_COMPONENTS,
): CategoryUpgrade[] {
  const result: CategoryUpgrade[] = [];

  if (slots.cpu) {
    const options = getCpuUpgrades(slots.cpu, components);
    result.push({
      slotKey: 'cpu',
      current: slots.cpu,
      options,
      summary: buildUpgradeSummary(slots.cpu, options),
    });
  }

  return result;
}