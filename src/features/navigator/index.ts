import { createDomain } from 'effector';
import { useStore } from 'effector-react';
import { attachLogger } from 'effector-logger/attach';
import bridge from '@vkontakte/vk-bridge';

const n = createDomain('navigator');
attachLogger(n);

interface State<P extends object = object> {
  id: string;
  params?: P;
}

export const pushState = n.createEvent<State>('pushState');
export const replaceState = n.createEvent<State>('replaceState');
export const popState = n.createEvent<number | void>('popState');

window.addEventListener('popstate', () => popState());

const $history = n
  .createStore<State[]>([], { name: 'history' })
  .on(pushState, (state, payload) => [...state, payload])
  .on(replaceState, (state, payload) => [
    ...state.slice(0, state.length - 1),
    payload,
  ])
  .on(popState, (state, payload) =>
    state.slice(0, state.length - (payload || 1)),
  );

$history.map<boolean>((state, isEnabled) => {
  if (state.length <= 1 && isEnabled) {
    bridge.send('VKWebAppDisableSwipeBack').catch(console.error);
    isEnabled = false;
  }
  if (state.length > 1 && !isEnabled) {
    bridge.send('VKWebAppEnableSwipeBack').catch(console.error);
    isEnabled = true;
  }
  return isEnabled;
});

interface IState {
  history: string[];
  current?: State;
  previous?: State;
}

export const $state = $history.map<IState>((state, lastState) => {
  const history = state.map((s) => s.id);
  const current = state[state.length - 1];
  const previous =
    current?.id === lastState?.current?.id
      ? lastState?.previous
      : lastState?.current;

  return {
    history,
    current,
    previous,
  };
});

export const goBack = () => window.history.back();

export const navigate = (id: string, params?: object, replace?: boolean) => {
  const state: State = { id, params };
  if (replace) {
    window.history.replaceState(state, null);
    replaceState(state);
  } else {
    window.history.pushState(state, null);
    pushState(state);
  }
};

export const useNavigator = <P extends object = object>(id: string) => {
  const state = useStore($state);

  return {
    goBack,
    navigate,
    params: (state.current?.id === id
      ? state.current?.params
      : state.previous?.params) as P,
  };
};
