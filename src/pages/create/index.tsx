import React, { FC, useCallback } from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Placeholder,
  Banner,
} from '@vkontakte/vkui';
import { useNavigator } from 'features/navigator';
import styled from 'styled-components';

import Icon28TargetOutline from '@vkontakte/icons/dist/28/target_outline';
import Icon28CalendarOutline from '@vkontakte/icons/dist/28/calendar_outline';

const StyledPlaceholder = styled(Placeholder)`
  & .Placeholder__in {
    width: 100%;
    padding-left: 0px;
    padding-right: 0px;
    text-align: initial;
  }
`;

const Icon = styled.div`
  color: var(--accent);
`;

const CreatePage: FC<{ id: string }> = ({ id }) => {
  const { navigate, goBack } = useNavigator(id);

  const create = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const type = e.currentTarget.dataset.type;
      navigate('step-one', { type });
    },
    [navigate],
  );

  return (
    <>
      <PanelHeader left={<PanelHeaderBack onClick={goBack} />}>
        Тип сбора
      </PanelHeader>
      <StyledPlaceholder stretched>
        <Banner
          asideMode={'expand'}
          before={
            <Icon>
              <Icon28TargetOutline />
            </Icon>
          }
          header={'Целевой сбор'}
          subheader={'Когда есть определённая цель'}
          data-type={'target'}
          onClick={create}
        />
        <Banner
          asideMode={'expand'}
          before={
            <Icon>
              <Icon28CalendarOutline color={'var(--accent)'} />
            </Icon>
          }
          header={'Регулярный сбор'}
          subheader={'Если помощь нужна ежемясячно'}
          data-type={'regular'}
          onClick={create}
        />
      </StyledPlaceholder>
    </>
  );
};

export default CreatePage;
