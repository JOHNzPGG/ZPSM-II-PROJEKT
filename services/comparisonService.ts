import { Component } from '../constants/mockComponents';

export type WinnerResult = 'left' | 'right' | 'tie' | 'compat' | 'unknown';

export type ComparisonSummary = {
  specKeys: string[];
  leftWins: number;
  rightWins: number;
};

const COMPATIBILITY_SPEC_KEYS = new Set([
  'Socket',
  'Typ',
  'Złącze',
  'Sieć',
  'Rozmiar',
  'Wyjścia wideo',
  'Profil OC',
  'Radiator',
  'USB',
  'Sloty PCIe',
  'Maks. RAM',
]);

const LOWER_IS_BETTER_KEYS = new Set([
  'TDP',
  'Opóźnienia',
  'Napięcie',
  'Litografia',
]);

export function extractNumericValue(value: string | number): number | null {
  if (typeof value === 'number') return value;
  const match = String(value).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export function getSpecWinner(
  specKey: string,
  leftValue: string | number,
  rightValue: string | number,
): WinnerResult {
  if (COMPATIBILITY_SPEC_KEYS.has(specKey)) return 'compat';

  const leftNum = extractNumericValue(leftValue);
  const rightNum = extractNumericValue(rightValue);

  if (leftNum === null || rightNum === null) return 'unknown';
  if (leftNum === rightNum) return 'tie';

  const leftWins = LOWER_IS_BETTER_KEYS.has(specKey)
    ? leftNum < rightNum
    : leftNum > rightNum;

  return leftWins ? 'left' : 'right';
}

export function collectSpecKeys(
  left: Component | null,
  right: Component | null,
): string[] {
  const keys = new Set<string>();
  if (left) Object.keys(left.specs).forEach((k) => keys.add(k));
  if (right) Object.keys(right.specs).forEach((k) => keys.add(k));
  return Array.from(keys);
}

export function compareComponents(
  left: Component | null,
  right: Component | null,
): ComparisonSummary {
  const specKeys = collectSpecKeys(left, right);
  if (!left || !right) {
    return { specKeys, leftWins: 0, rightWins: 0 };
  }

  let leftWins = 0;
  let rightWins = 0;

  for (const key of specKeys) {
    const leftVal = left.specs[key];
    const rightVal = right.specs[key];
    if (leftVal === undefined || rightVal === undefined) continue;

    const winner = getSpecWinner(key, leftVal, rightVal);
    if (winner === 'left') leftWins++;
    if (winner === 'right') rightWins++;
  }

  return { specKeys, leftWins, rightWins };
}