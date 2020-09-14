import React, { useCallback, useState } from 'react';
import produce from 'immer';
import { create } from 'api';
import bridge from '@vkontakte/vk-bridge';

export interface Fundraising {
  type: 'target' | 'regular';
  picture: string;
  name: string;
  sum: number;
  target: string;
  description: string;
  author: string;
  date_close: string;
}

export const useFundraising = (
  setData: React.Dispatch<React.SetStateAction<Partial<Fundraising>>>,
) => {
  const change = useCallback(
    (recipe: (draft: Fundraising) => void) => {
      setData((state) => {
        return produce(state, recipe);
      });
    },
    [setData],
  );

  const onChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const prop = e.currentTarget.name as keyof Fundraising;
      const value = e.currentTarget.value;

      change((draft) => {
        // @ts-ignore
        draft[prop] = value;
      });
    },
    [change],
  );

  const [sending, setSending] = useState(false);
  const send = useCallback(async (params: Fundraising) => {
    setSending(true);
    try {
      const data = await create({
        type_of: params.type,
        name: params.name,
        sum: params.sum,
        aim: params.target,
        picture: params.picture,
        description: params.description,
        date_close: params.date_close,
        author: params.author,
      });

      try {
        await bridge.send('VKWebAppShare', {
          link: `https://vk.com/app${process.env.REACT_APP_ID}#${data.id}`,
        });
      } catch (e) {}

      return data;
    } finally {
      setSending(false);
    }
  }, []);

  return {
    change,
    onChange,
    send,
    sending,
  };
};
