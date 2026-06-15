// constants/storageKeys.ts

export const ACTIVE_USER_KEY   = 'pcua_active_user';
export const LEGACY_USERNAME_KEY = 'pcua_username';

export const userProfileKey  = (u: string) => `pcua_profile_${u}`;
export const userConfigsKey  = (u: string) => `pcua_configs_${u}`;
export const userAvatarKey   = (u: string) => `pcua_avatar_${u}`;
