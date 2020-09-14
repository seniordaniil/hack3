import { forward } from 'effector';
import { createDomain } from 'effector';
import { attachLogger } from 'effector-logger/attach';
import bridge from '@vkontakte/vk-bridge';

export const vk = createDomain('vk-data');
attachLogger(vk);

export interface UserInfo {
  id: number;
  fullName: string;
  photo: string;
}

interface UserFetchData {
  id: number;
  first_name: string;
  last_name: string;
  photo_100: string;
}

export const fetchCurrentUserEffect = vk
  .createEffect<void, UserFetchData>('fetchCurrentUser')
  .use(() => bridge.send('VKWebAppGetUserInfo'));

export const $currentUser = vk
  .createStore<UserInfo>(null, { name: 'currentUser' })
  .on(fetchCurrentUserEffect.doneData, (_, payload) => ({
    id: payload.id,
    fullName: `${payload.first_name} ${payload.last_name}`,
    photo: payload.photo_100,
  }));

export const fetchCurrentUser = vk.createEvent('fetchCurrentUser');

forward({
  from: fetchCurrentUser,
  to: fetchCurrentUserEffect,
});
