import React, {
  FC,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useNavigator } from 'features/navigator';
import { FundResponse, getDonate, donate } from 'api';
import { differenceInDays, format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import {
  Group,
  Title,
  Caption,
  Div,
  Progress,
  FixedLayout,
  Button,
  InfoRow,
} from '@vkontakte/vkui';
import styled from 'styled-components';
import Content from 'ui/atoms/content';

const Block = styled(Div)`
  padding-bottom: 0px;
  padding-top: 0px;
`;

const Cover = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  overflow: hidden;
  & img {
    width: 100%;
  }
`;

const ProgressBar = styled(Div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressRow = styled(InfoRow)`
  margin-right: 12px;
  flex: 1;
  & .InfoRow__header {
    color: var(--text_primary);
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
  }

  & .Progress__in {
    background: var(--button_commerce_background);
  }
`;

const MainProgressRow = styled(InfoRow)`
  & .InfoRow__header {
    color: var(--text_primary);
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
  }
  .Progress {
    border-radius: 6px;
    height: 24px;
    & .Progress__in {
      height: 100%;
      border-radius: 6px;
      background: var(--button_commerce_background);
    }
  }
`;

interface Params {
  donateId: number;
  data?: FundResponse;
}

function moneyFormat(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

const DonatePage: FC<{ id: string }> = ({ id }) => {
  const { params } = useNavigator<Params>(id);
  const [data, setData] = useState<FundResponse>(null);

  const init = useRef(params);

  useEffect(() => {
    if (!init.current.data) {
      getDonate(init.current.donateId).then(setData).catch(console.error);
    } else {
      setData(init.current.data);
    }
  }, [init, setData]);

  const close = useMemo(() => {
    if (data && data.date_close) {
      return differenceInDays(new Date(), new Date(data.date_close));
    }
  }, [data]);

  const deadline = useMemo(() => {
    if (data && data.date_close) {
      return format(new Date(data.date_close), 'PP', {
        locale: ru,
      });
    }
  }, [data]);

  const [donating, setDonating] = useState(false);
  const onDonate = useCallback(() => {
    setDonating(true);
    donate(data.id, 10)
      .then((progress) => {
        setData((state) => ({ ...state, progress }));
      })
      .catch(console.error)
      .finally(() => setDonating(false));
  }, [data, setDonating, setData]);

  const progress = useMemo(() => {
    if (data) {
      const percent = data.sum / 100;
      return data.progress / percent;
    }
  }, [data]);

  if (!data) return null;
  return (
    <>
      <Content height={'62px'}>
        <Cover>
          <img src={data.picture} alt={''} />
        </Cover>
        <Group>
          <Block>
            <Title weight={'heavy'} level={'1'}>
              {data.name}
            </Title>
            <Caption
              weight={'medium'}
              level={'1'}
            >{`Автор ${data.author}`}</Caption>
            <Caption level={'2'} weight={'medium'}>{`Сбор заканчивается ${
              close || '-'
            } дн.`}</Caption>
          </Block>
        </Group>
        <Group>
          <Block>
            <MainProgressRow header={`Нужно собрать до ${deadline || '-'}`}>
              <Progress value={progress} />
            </MainProgressRow>
          </Block>
        </Group>
        <Group>
          <Block>{data.description}</Block>
        </Group>
      </Content>
      <FixedLayout vertical={'bottom'} filled>
        <ProgressBar>
          <ProgressRow
            header={`Собрано ${moneyFormat(data.progress)} из ${moneyFormat(
              data.sum,
            )}`}
          >
            <Progress value={progress}></Progress>
          </ProgressRow>
          <Button
            size={'l'}
            mode={'commerce'}
            disabled={donating}
            onClick={onDonate}
          >
            Помочь
          </Button>
        </ProgressBar>
      </FixedLayout>
    </>
  );
};

export default DonatePage;
