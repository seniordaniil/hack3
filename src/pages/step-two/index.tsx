import React, { FC, useCallback, useRef, useState } from 'react';
import { useStore } from 'effector-react';
import { $currentUser } from 'features/vk-data';
import { useNavigator } from 'features/navigator';
import { useFundraising, Fundraising } from 'features/fundraising';
import { format } from 'date-fns';
import {
  FormLayout,
  PanelHeader,
  PanelHeaderBack,
  Select,
  FormLayoutGroup,
  Radio,
  Input,
  Div,
  Button,
  FixedLayout,
} from '@vkontakte/vkui';
import Content from 'ui/atoms/content';
import Bottom from 'ui/atoms/bottom';

const StepTwoPage: FC<{ id: string }> = ({ id }) => {
  const user = useStore($currentUser);

  const { params, goBack, navigate } = useNavigator<Fundraising>(id);
  const currentParams = useRef<Fundraising>((params || {}) as Fundraising);

  const [data, setData] = useState<Partial<Fundraising>>({
    author: currentParams.current.author || user.fullName,
  });

  const { author, date_close } = data;
  const { change, onChange, sending, send } = useFundraising(setData);

  const submit = useCallback(() => {
    const params: Fundraising = { ...currentParams.current, ...data };
    send(params)
      .then((data) => {
        navigate('donate', { donateId: data.id, data });
      })
      .catch(console.error);
  }, [send, data, currentParams, navigate]);

  return (
    <>
      <PanelHeader left={<PanelHeaderBack onClick={goBack} />}>
        Оформление
      </PanelHeader>
      <Content height={'70px'}>
        <FormLayout>
          <Select
            top={'Автор'}
            value={author}
            name={'author'}
            onChange={onChange}
          >
            <option value={user.fullName}>{user.fullName}</option>
            <option value={'Скрыт'}>Скрыт</option>
          </Select>
          <FormLayoutGroup top={'Сбор завершится'}>
            <Radio
              name={'closed'}
              checked={!date_close}
              onChange={(e) => {
                if (e.currentTarget.value === 'on') {
                  change((draft) => {
                    draft.date_close = '';
                  });
                }
              }}
            >
              Когда соберём сумму
            </Radio>
            <Radio
              name={'closed'}
              checked={Boolean(date_close)}
              onChange={(e) => {
                if (e.currentTarget.value === 'on') {
                  change((draft) => {
                    draft.date_close = format(new Date(), 'yyyy-MM-dd');
                  });
                }
              }}
            >
              В определённую дату
            </Radio>
          </FormLayoutGroup>
          <Input
            top={'Дата окончания'}
            placeholder={'Выберите дату'}
            type={'date'}
            value={date_close}
            onChange={(e) => {
              change((draft) => {
                draft.date_close = e.currentTarget.value;
              });
            }}
          />
        </FormLayout>
      </Content>
      <FixedLayout vertical={'bottom'} filled>
        <Bottom>
          <Div>
            <Button size={'xl'} stretched onClick={submit} disabled={sending}>
              {'Создать сбор'}
            </Button>
          </Div>
        </Bottom>
      </FixedLayout>
    </>
  );
};

export default StepTwoPage;
