export const ACTIVE_USER_KEY = 'pcua_active_user';
export const LEGACY_USERNAME_KEY = 'username';

export const userProfileKey = (nickname: string) =>
  `pcua:user:${nickname.trim().toLowerCase()}:profile`;

export const userConfigsKey = (nickname: string) =>
  `pcua:user:${nickname.trim().toLowerCase()}:configs`;