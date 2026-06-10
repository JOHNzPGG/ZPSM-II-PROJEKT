// services/componentDatabase.ts
// Serwis sprawdzajacy aktualnosc bazy komponentow przy kazdym starcie aplikacji.
// Jesli dane sa nieaktualne — pobiera je w tle podczas ladowania.
// Jesli brak internetu — informuje uzytkownika i korzysta z lokalnej kopii.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_COMPONENTS, Component } from '../constants/mockComponents';

// ─── Config ───────────────────────────────────────────────────────────────────

// Docelowy URL API — na razie wskazuje na mock
// W Etapie 3 zastap tym prawdziwym endpointem REST API
const API_BASE_URL = 'https://johnzpgg.github.io/aplikacja-mobilna';
const DB_VERSION_KEY = 'pcua_db_version';
const DB_COMPONENTS_KEY = 'pcua_components_cache';
const DB_LAST_CHECK_KEY = 'pcua_db_last_check';

// Sprawdzaj nie czesciej niz co 6 godzin
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

export type DatabaseStatus =
  | 'up_to_date'
  | 'updated'
  | 'offline_fallback'
  | 'error';

export type DatabaseCheckResult = {
  status: DatabaseStatus;
  components: Component[];
  message: string;
  version?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function isCheckNeeded(): Promise<boolean> {
  const lastCheck = await AsyncStorage.getItem(DB_LAST_CHECK_KEY);
  if (!lastCheck) return true;
  const elapsed = Date.now() - parseInt(lastCheck, 10);
  return elapsed > CHECK_INTERVAL_MS;
}

async function getCachedComponents(): Promise<Component[] | null> {
  const raw = await AsyncStorage.getItem(DB_COMPONENTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Component[];
  } catch {
    return null;
  }
}

async function cacheComponents(components: Component[], version: string): Promise<void> {
  await AsyncStorage.multiSet([
    [DB_COMPONENTS_KEY, JSON.stringify(components)],
    [DB_VERSION_KEY, version],
    [DB_LAST_CHECK_KEY, Date.now().toString()],
  ]);
}

// ─── Network check ────────────────────────────────────────────────────────────

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${API_BASE_URL}/version.json`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data?.version ?? null;
  } catch {
    return null; // offline or timeout
  }
}

async function fetchRemoteComponents(): Promise<Component[] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${API_BASE_URL}/podzespoly.json`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.components) ? data.components : null; // podzespoly.json has { components: [...] }
  } catch {
    return null;
  }
}

// ─── Main service ─────────────────────────────────────────────────────────────

/**
 * Sprawdza aktualnosc bazy komponentow i zwraca najswiezsze dane.
 *
 * Logika:
 * 1. Sprawdz czy minal CHECK_INTERVAL od ostatniego sprawdzenia
 * 2. Jesli nie — zwroc z cache (lub mock jesli brak cache)
 * 3. Jesli tak — probuj pobrać nowa wersje z API
 * 4. Jesli API niedostepne — zwroc z cache z komunikatem offline
 * 5. Jesli nowa wersja dostepna — pobierz i zapisz w cache
 * 6. Jesli brak cache i offline — uzyj mock data z paczki
 */
export async function checkAndUpdateDatabase(
  onProgress?: (message: string) => void,
): Promise<DatabaseCheckResult> {

  const fallbackComponents = MOCK_COMPONENTS;

  // Sprawdz czy minal interwal
  const needsCheck = await isCheckNeeded();

  if (!needsCheck) {
    // Za wczesnie — uzyj cache
    const cached = await getCachedComponents();
    return {
      status: 'up_to_date',
      components: cached ?? fallbackComponents,
      message: 'Baza danych jest aktualna.',
    };
  }

  // Czas na sprawdzenie — probuj siec
  onProgress?.('Sprawdzanie aktualizacji bazy...');

  const remoteVersion = await fetchRemoteVersion();

  if (remoteVersion === null) {
    // Offline lub blad serwera
    const cached = await getCachedComponents();
    const hasCache = !!cached;

    return {
      status: 'offline_fallback',
      components: cached ?? fallbackComponents,
      message: hasCache
        ? 'Nie udało się sprawdzić aktualizacji — brak połączenia z internetem. Używam zapisanej wersji bazy.'
        : 'Brak połączenia z internetem. Używam wbudowanej bazy danych.',
    };
  }

  // Siec dostepna — sprawdz czy wersja jest nowa
  const currentVersion = await AsyncStorage.getItem(DB_VERSION_KEY);

  if (currentVersion === remoteVersion) {
    // Wersja ta sama — zaktualizuj timestamp i zwroc cache
    await AsyncStorage.setItem(DB_LAST_CHECK_KEY, Date.now().toString());
    const cached = await getCachedComponents();
    return {
      status: 'up_to_date',
      components: cached ?? fallbackComponents,
      message: 'Baza danych jest aktualna.',
      version: remoteVersion,
    };
  }

  // Nowa wersja dostepna — pobierz
  onProgress?.('Pobieranie aktualizacji bazy komponentów...');

  const remoteComponents = await fetchRemoteComponents();

  if (!remoteComponents) {
    const cached = await getCachedComponents();
    return {
      status: 'error',
      components: cached ?? fallbackComponents,
      message: 'Wystąpił błąd podczas pobierania aktualizacji. Sprawdź połączenie i spróbuj ponownie.',
    };
  }

  // Zapisz nowe dane
  await cacheComponents(remoteComponents, remoteVersion);

  return {
    status: 'updated',
    components: remoteComponents,
    message: `Baza danych zaktualizowana do wersji ${remoteVersion}.`,
    version: remoteVersion,
  };
}

/**
 * Szybka wersja — zwraca komponenty bez sprawdzania sieci.
 * Uzywana gdy chcemy tylko pobrac dane bez blokowania UI.
 */
export async function getComponents(): Promise<Component[]> {
  const cached = await getCachedComponents();
  return cached ?? MOCK_COMPONENTS;
}

/**
 * Resetuje cache bazy — uzyteczne do debugowania lub przy wylogowaniu.
 */
export async function clearDatabaseCache(): Promise<void> {
  await AsyncStorage.multiRemove([
    DB_VERSION_KEY,
    DB_COMPONENTS_KEY,
    DB_LAST_CHECK_KEY,
  ]);
}
