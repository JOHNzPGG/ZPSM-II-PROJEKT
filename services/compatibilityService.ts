import { BuildSlots } from '../components/BuildConfigurator';
import { Component } from '../constants/mockComponents';

export type CompatibilityCheckResult = {
  ok: boolean;
  label: string;
  detail: string;
};

const SYSTEM_BASE_WATTAGE = 100;
export const TOTAL_BUILD_SLOTS = 8;

function parseWatts(value: string | number | undefined, fallback = 0): number {
  if (value === undefined) return fallback;
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function checkCpuMotherboardCompatibility(
  cpu: Component,
  motherboard: Component,
): CompatibilityCheckResult {
  const cpuSocket = String(cpu.specs['Socket'] ?? '');
  const mbSocket = String(motherboard.specs['Socket'] ?? '');
  const ok = Boolean(cpuSocket && mbSocket && cpuSocket === mbSocket);

  return {
    ok,
    label: 'Socket CPU ↔ Płyta główna',
    detail: ok
      ? `${cpu.name} (${cpuSocket}) pasuje do ${motherboard.name}`
      : `${cpu.name} ma socket ${cpuSocket}, płyta wymaga ${mbSocket}`,
  };
}

export function checkRamMotherboardCompatibility(
  ram: Component,
  motherboard: Component,
): CompatibilityCheckResult {
  const mbRamSpec = String(motherboard.specs['Maks. RAM'] ?? '');
  const ramType = String(ram.specs['Typ'] ?? '');
  const supportedDdr = mbRamSpec.includes('DDR5') ? 'DDR5' : 'DDR4';
  const ok = ramType === supportedDdr;

  return {
    ok,
    label: 'Typ RAM ↔ Płyta główna',
    detail: ok
      ? `${ram.name} (${ramType}) zgodny z płytą`
      : `Płyta obsługuje ${supportedDdr}, wybrano RAM ${ramType}`,
  };
}

export function checkCoolerTdpCompatibility(
  cpu: Component,
  cooler: Component,
): CompatibilityCheckResult {
  const cpuTdp = parseWatts(cpu.specs['TDP'], 0);
  const coolerMaxTdp = parseWatts(cooler.specs['Maks. TDP'], 999);
  const ok = coolerMaxTdp >= cpuTdp;

  return {
    ok,
    label: 'TDP CPU ↔ Chłodzenie',
    detail: ok
      ? `${cooler.name} (${coolerMaxTdp}W) obsługuje ${cpu.name} (${cpuTdp}W)`
      : `${cooler.name} max ${coolerMaxTdp}W, CPU wymaga ${cpuTdp}W — chłodzenie może być za słabe`,
  };
}

export function checkPsuWattageCompatibility(
  psu: Component,
  cpu?: Component,
  gpu?: Component,
): CompatibilityCheckResult {
  const cpuTdp = parseWatts(cpu?.specs['TDP'], 0);
  const gpuTdp = parseWatts(gpu?.specs['TDP'], 0);
  const estimatedWattage = cpuTdp + gpuTdp + SYSTEM_BASE_WATTAGE;
  const psuWattage = parseWatts(psu.specs['Moc'], 0);
  const ok = psuWattage >= estimatedWattage;

  return {
    ok,
    label: 'Moc zasilacza ↔ Pobór mocy',
    detail: ok
      ? `${psu.name} (${psuWattage}W) wystarczy dla szacowanego poboru ~${estimatedWattage}W`
      : `Szacowany pobór ~${estimatedWattage}W przekracza zasilacz ${psuWattage}W`,
  };
}

export function checkBuildCompatibility(slots: BuildSlots): CompatibilityCheckResult[] {
  const results: CompatibilityCheckResult[] = [];
  const { motherboard, cpu, ram, cooler, psu, gpu } = slots;

  if (motherboard && cpu) {
    results.push(checkCpuMotherboardCompatibility(cpu, motherboard));
  }
  if (motherboard && ram) {
    results.push(checkRamMotherboardCompatibility(ram, motherboard));
  }
  if (cpu && cooler) {
    results.push(checkCoolerTdpCompatibility(cpu, cooler));
  }
  if (psu && (cpu || gpu)) {
    results.push(checkPsuWattageCompatibility(psu, cpu, gpu));
  }

  return results;
}

export function calculateBuildTotalPrice(slots: BuildSlots): number {
  return Object.values(slots).reduce((sum, component) => sum + (component?.price ?? 0), 0);
}

export function countFilledSlots(slots: BuildSlots): number {
  return Object.values(slots).filter(Boolean).length;
}