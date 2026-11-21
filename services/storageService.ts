import AsyncStorage from '@react-native-async-storage/async-storage';
import { BuildSlots, SlotKey } from '../components/BuildConfigurator';
import { Component } from '../constants/mockComponents';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userAvatarKey,
  userConfigsKey,
  userProfileKey,
} from '../constants/storageKeys';

export const MAX_BUILDS = 3;
export const MIN_NICKNAME_LENGTH = 3;
export const MAX_NICKNAME_LENGTH = 20;

export type Build = {
  id: string;
  name: string;
  slots: BuildSlots;
  createdAt: string;
};

export type UserProfile = {
  nickname: string;
  createdAt: string;
};

export type NicknameValidationResult = {
  valid: boolean;
  trimmed: string;
  error?: string;
};

// ─── Pure validation helpers ──────────────────────────────────────────────────

export function validateNickname(rawName: string): NicknameValidationResult {
  const trimmed = rawName.trim();
  if (trimmed.length < MIN_NICKNAME_LENGTH) {
    return {
      valid: false,
      trimmed,
      error: `Pseudonim musi mieć co najmniej ${MIN_NICKNAME_LENGTH} znaki.`,
    };
  }
  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return {
      valid: false,
      trimmed,
      error: `Pseudonim może mieć maksymalnie ${MAX_NICKNAME_LENGTH} znaków.`,
    };
  }
  return { valid: true, trimmed };
}

export function canAddBuild(builds: Build[]): boolean {
  return builds.length < MAX_BUILDS;
}

// ─── User session & profile ───────────────────────────────────────────────────

export async function getActiveUser(): Promise<string | null> {
  const active = await AsyncStorage.getItem(ACTIVE_USER_KEY);
  if (active) return active;
  return AsyncStorage.getItem(LEGACY_USERNAME_KEY);
}

export async function setActiveUser(rawNickname: string): Promise<UserProfile> {
  const validation = validateNickname(rawNickname);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const nickname = validation.trimmed;
  await AsyncStorage.multiSet([
    [ACTIVE_USER_KEY, nickname],
    [LEGACY_USERNAME_KEY, nickname],
  ]);

  const profileKey = userProfileKey(nickname);
  const configsKey = userConfigsKey(nickname);

  const [existingProfileRaw, existingConfigsRaw] = await Promise.all([
    AsyncStorage.getItem(profileKey),
    AsyncStorage.getItem(configsKey),
  ]);

  let profile: UserProfile;
  if (existingProfileRaw) {
    profile = JSON.parse(existingProfileRaw) as UserProfile;
  } else {
    profile = { nickname, createdAt: new Date().toISOString() };
    await AsyncStorage.setItem(profileKey, JSON.stringify(profile));
  }

  if (!existingConfigsRaw) {
    await AsyncStorage.setItem(configsKey, JSON.stringify([]));
  }

  return profile;
}

export async function clearActiveUser(): Promise<void> {
  await AsyncStorage.multiRemove([ACTIVE_USER_KEY, LEGACY_USERNAME_KEY]);
}

export async function getUserAvatar(username: string): Promise<string | null> {
  return AsyncStorage.getItem(userAvatarKey(username));
}

export async function saveUserAvatar(username: string, uri: string): Promise<void> {
  await AsyncStorage.setItem(userAvatarKey(username), uri);
}

// ─── Builds CRUD ──────────────────────────────────────────────────────────────

export async function getUserBuilds(username: string): Promise<Build[]> {
  const raw = await AsyncStorage.getItem(userConfigsKey(username));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Build[]) : [];
  } catch {
    return [];
  }
}

export async function saveUserBuilds(username: string, builds: Build[]): Promise<void> {
  await AsyncStorage.setItem(userConfigsKey(username), JSON.stringify(builds));
}

export async function createBuild(username: string, rawName: string): Promise<Build> {
  const existing = await getUserBuilds(username);
  if (!canAddBuild(existing)) {
    throw new Error(`Możesz mieć maksymalnie ${MAX_BUILDS} zestawy komputerowe.`);
  }

  const newBuild: Build = {
    id: Date.now().toString(),
    name: rawName.trim() || `Zestaw ${existing.length + 1}`,
    slots: {},
    createdAt: new Date().toISOString(),
  };

  await saveUserBuilds(username, [...existing, newBuild]);
  return newBuild;
}

export async function updateBuildSlot(
  username: string,
  buildId: string,
  slotKey: SlotKey,
  component: Component | null,
): Promise<Build | null> {
  const builds = await getUserBuilds(username);
  let updatedTarget: Build | null = null;

  const nextBuilds = builds.map((build) => {
    if (build.id !== buildId) return build;

    const nextSlots: BuildSlots = { ...build.slots };
    if (component) {
      nextSlots[slotKey] = component;
    } else {
      delete nextSlots[slotKey];
    }

    updatedTarget = { ...build, slots: nextSlots };
    return updatedTarget;
  });

  if (!updatedTarget) return null;

  await saveUserBuilds(username, nextBuilds);
  return updatedTarget;
}

export async function deleteBuild(username: string, buildId: string): Promise<Build[]> {
  const builds = await getUserBuilds(username);
  const nextBuilds = builds.filter((build) => build.id !== buildId);
  await saveUserBuilds(username, nextBuilds);
  return nextBuilds;
}