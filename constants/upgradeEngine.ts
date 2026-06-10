// constants/upgradeEngine.ts
// Silnik rekomendacji ulepszen — na razie CPU, latwo rozszerzalny o GPU/RAM

import { Component, MOCK_COMPONENTS } from './mockComponents';
import { BuildSlots } from '../components/BuildConfigurator';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UpgradeTier = 'budget' | 'balance' | 'premium';

export type UpgradeOption = {
  tier: UpgradeTier;
  component: Component;
  scoreDelta: number;       // ile punktow score wyzej niz obecny
  scorePercent: number;     // % wzrost wydajnosci
  priceDelta: number;       // roznica ceny (moze byc ujemna!)
  profitabilityScore: number; // 1-10
  profitabilityLabel: string;
  profitabilityColor: string;
  requiresPlatformChange: boolean; // czy trzeba zmienic plyte/socket
  note: string;             // krotka wskazowka dla uzytkownika
};

export type CategoryUpgrade = {
  slotKey: keyof BuildSlots;
  current: Component;
  options: UpgradeOption[];
  summary: string; // np. "Twoj CPU jest juz topowy" albo "Duzy potencjal na upgrade"
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcProfitability(scoreDelta: number, priceDelta: number, currentPrice: number): number {
  if (scoreDelta <= 0) return 0;

  // Bazowa opłacalnosc: ile % wydajnosci za ile % ceny
  const perfGain = scoreDelta; // punkty score (skala 1-100)
  const priceRatio = priceDelta <= 0
    ? 10 // jesli taniej lub tyle samo — max oplacalnosc
    : Math.max(0, 10 - (priceDelta / Math.max(currentPrice, 100)) * 8);

  // Premiuj duze skoki wydajnosci
  const perfBonus = perfGain >= 30 ? 1.5 : perfGain >= 20 ? 1.2 : perfGain >= 10 ? 1.0 : 0.7;

  const raw = Math.min(10, (priceRatio * perfBonus));
  return Math.round(raw * 10) / 10;
}

function profitabilityLabel(score: number): string {
  if (score >= 8.5) return 'Bardzo opłacalne';
  if (score >= 6.5) return 'Opłacalne';
  if (score >= 4.0) return 'Umiarkowane';
  if (score >= 2.0) return 'Mało opłacalne';
  return 'Nieopłacalne';
}

function profitabilityColor(score: number): string {
  if (score >= 8.5) return '#2EC27E';
  if (score >= 6.5) return '#5EE8A8';
  if (score >= 4.0) return '#FFD100';
  if (score >= 2.0) return '#E8720C';
  return '#E83040';
}

function upgradeNote(
  current: Component,
  candidate: Component,
  requiresPlatformChange: boolean,
  tier: UpgradeTier,
): string {
  const sameSocket = current.specs['Socket'] === candidate.specs['Socket'];
  const currentSocket = String(current.specs['Socket'] || '');
  const candidateSocket = String(candidate.specs['Socket'] || '');

  if (requiresPlatformChange) {
    return `Wymaga nowej płyty głównej (${candidateSocket}). Rozważ koszt całej platformy.`;
  }

  const scoreDelta = candidate.score - current.score;
  if (scoreDelta >= 40) return 'Ogromny skok wydajności — wyraźnie odczuwalny w każdej sytuacji.';
  if (scoreDelta >= 25) return 'Znaczący upgrade — odczujesz różnicę zarówno w grach jak i w pracy.';
  if (scoreDelta >= 15) return 'Dobry krok naprzód, szczególnie w grach i wielowątkowych zadaniach.';
  if (scoreDelta >= 8)  return 'Umiarkowana poprawa — warto jeśli masz okazję upolować dobrą cenę.';
  return 'Niewielka różnica — rozważ czy warto, może lepiej poczekać na lepszą ofertę.';
}

// ─── Socket compatibility ─────────────────────────────────────────────────────

// Które sockety mogą współpracować bez zmiany płyty (ten sam socket = true)
function isSameSocket(a: Component, b: Component): boolean {
  return String(a.specs['Socket']) === String(b.specs['Socket']);
}

// ─── CPU upgrade engine ───────────────────────────────────────────────────────

function getCpuUpgrades(current: Component, mb: Component | undefined): UpgradeOption[] {
  const currentSocket = String(current.specs['Socket'] || '');
  const mbSocket = mb ? String(mb.specs['Socket'] || '') : null;

  // Wszyscy kandydaci lepsi od obecnego
  const candidates = MOCK_COMPONENTS.filter(
    (c) =>
      c.type === 'CPU' &&
      c.id !== current.id &&
      c.score > current.score,
  );

  if (candidates.length === 0) return [];

  // Podziel na same socket i inne sockety
  const sameSocketCandidates = candidates.filter((c) =>
    String(c.specs['Socket']) === currentSocket,
  );
  const otherSocketCandidates = candidates.filter((c) =>
    String(c.specs['Socket']) !== currentSocket,
  );

  // Dla każdego kandydata oblicz metryki
  const scored = candidates.map((c) => {
    const requiresPlatformChange = String(c.specs['Socket']) !== currentSocket;
    const scoreDelta = c.score - current.score;
    const priceDelta = c.price - current.price;
    const profScore = calcProfitability(scoreDelta, priceDelta, current.price);

    return {
      component: c,
      scoreDelta,
      scorePercent: Math.round((scoreDelta / Math.max(current.score, 1)) * 100),
      priceDelta,
      profitabilityScore: profScore,
      profitabilityLabel: profitabilityLabel(profScore),
      profitabilityColor: profitabilityColor(profScore),
      requiresPlatformChange,
      note: upgradeNote(current, c, requiresPlatformChange, 'balance'),
    };
  });

  // Sortuj po opłacalności
  scored.sort((a, b) => b.profitabilityScore - a.profitabilityScore);

  // ── Wybierz 3 opcje: budget / balance / premium ──────────────────────────

  // BUDGET: najtanszy same socket z minimalnym skokiem score (>= 8)
  const budgetPool = scored.filter(
    (s) => !s.requiresPlatformChange && s.scoreDelta >= 6,
  );
  // Sort by price ascending
  budgetPool.sort((a, b) => a.component.price - b.component.price);
  const budgetPick = budgetPool[0] ?? null;

  // BALANCE: najlepsza oplacalnosc wśród same socket z skokiem >= 12
  const balancePool = scored.filter(
    (s) => !s.requiresPlatformChange && s.scoreDelta >= 12,
  );
  balancePool.sort((a, b) => b.profitabilityScore - a.profitabilityScore);
  const balancePick = balancePool.find((s) => s !== budgetPick) ?? balancePool[0] ?? null;

  // PREMIUM: najwyższy score — może wymagać zmiany platformy
  const premiumPool = [...scored];
  premiumPool.sort((a, b) => b.component.score - a.component.score);
  const premiumPick =
    premiumPool.find((s) => s !== budgetPick && s !== balancePick) ??
    premiumPool[0] ??
    null;

  const result: UpgradeOption[] = [];

  if (budgetPick) {
    result.push({ tier: 'budget', ...budgetPick, note: upgradeNote(current, budgetPick.component, budgetPick.requiresPlatformChange, 'budget') });
  }
  if (balancePick && balancePick !== budgetPick) {
    result.push({ tier: 'balance', ...balancePick, note: upgradeNote(current, balancePick.component, balancePick.requiresPlatformChange, 'balance') });
  }
  if (premiumPick && premiumPick !== budgetPick && premiumPick !== balancePick) {
    result.push({ tier: 'premium', ...premiumPick, note: upgradeNote(current, premiumPick.component, premiumPick.requiresPlatformChange, 'premium') });
  }

  return result;
}

// ─── Summary label ────────────────────────────────────────────────────────────

function upgradeSummary(current: Component, options: UpgradeOption[]): string {
  if (options.length === 0) {
    return `${current.name} to już topowy procesor w bazie — nie ma lepszej opcji.`;
  }
  const best = options.find((o) => o.tier === 'balance') ?? options[0];
  if (best.profitabilityScore >= 8) {
    return `Duży potencjał na upgrade — zmiana bardzo opłacalna.`;
  }
  if (best.profitabilityScore >= 5) {
    return `Umiarkowany potencjał — upgrade sensowny przy dobrej cenie.`;
  }
  return `Twój CPU jest dobry — upgrade przyniesie niewielką różnicę.`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function getUpgradeSuggestions(slots: BuildSlots): CategoryUpgrade[] {
  const result: CategoryUpgrade[] = [];

  // ── CPU ──────────────────────────────────────────────────────────────────
  const cpu = slots.cpu;
  const mb  = slots.motherboard;

  if (cpu) {
    const options = getCpuUpgrades(cpu, mb);
    result.push({
      slotKey: 'cpu',
      current: cpu,
      options,
      summary: upgradeSummary(cpu, options),
    });
  }

  // Tu będą GPU, RAM itd. w przyszłosci
  // if (slots.gpu) { ... }

  return result;
}
