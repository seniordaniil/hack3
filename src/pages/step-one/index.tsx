import React, { FC, useMemo, useState, useRef, useCallback } from 'react';
import { useStore } from 'effector-react';
import { useNavigator } from 'features/navigator';
import { $currentUser } from 'features/vk-data';
import { useFundraising, Fundraising } from 'features/fundraising';
import { upload } from 'api';
import {
  PanelHeader,
  FixedLayout,
  Button,
  Div,
  File,
  PanelHeaderBack,
  FormLayout,
  Input,
  Select,
  Textarea,
  FormLayoutGroup,
  Spinner,
} from '@vkontakte/vkui';
import NumberFormat from 'react-number-format';
import styled from 'styled-components';
import Content from 'ui/atoms/content';
import Bottom from 'ui/atoms/bottom';
import Icon28PictureOutline from '@vkontakte/icons/dist/28/picture_outline';
import Icon24DismissOverlay from '@vkontakte/icons/dist/24/dismiss_overlay';

const Cover = styled.div<{ isVoid?: boolean }>`
  display: flex;
  height: 140px;
  border: ${({ isVoid }) =>
    isVoid ? `1px dashed var(--accent)` : '0.33px solid rgba(0, 0, 0, 0.08)'};
  border-radius: 10px;
  & input {
    display: none;
  }
  align-items: center;
  justify-content: center;
  overflow: hidden;
  & img {
    max-width: 100%;
  }
`;

const Picture = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const Dismiss = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const AccountSelect = styled(Select)`
  .Select__container {
    opacity: 1 !important;
  }
  .FormField__border {
    opacity: 1 !important;
  }
`;

const StepOnePage: FC<{ id: string }> = ({ id }) => {
  const user = useStore($currentUser);

  const { params, goBack, navigate } = useNavigator<Fundraising>(id);
  const type = params?.type;

  const currentParams = useRef<Fundraising>((params || {}) as Fundraising);

  const { title, sumTop, sumPlaceholder, targetPlaceholder } = useMemo(
    () => ({
      title: type === 'target' ? 'Целевой сбор' : 'Регулярный сбор',
      sumTop: type === 'target' ? 'Сумма, ₽' : 'Сумма в месяц, ₽',
      sumPlaceholder:
        type === 'target' ? 'Сколько нужно собрать?' : 'Сколько нужно в месяц?',
      targetPlaceholder:
        type === 'target'
          ? 'Например, лечение человека'
          : 'Например, поддержка приюта',
    }),
    [type],
  );

  const [data, setData] = useState<Partial<Fundraising>>({
    picture: currentParams.current.picture || '',
    name: currentParams.current.name || '',
    sum: currentParams.current.sum || 0,
    target: currentParams.current.target || '',
    description: currentParams.current.description || '',
    author: currentParams.current.author || user.fullName,
  });
  const { sum, picture, name, target, author, description } = data;
  const { change, onChange, sending, send } = useFundraising(setData);

  const submit = useCallback(() => {
    const params: Fundraising = { ...currentParams.current, ...data };
    if (params.type === 'target') {
      navigate(id, params, true);
      navigate('step-two', params);
    } else {
      send(params)
        .then((data) => {
          navigate('donate', { donateId: data.id, data });
        })
        .catch(console.error);
    }
  }, [navigate, currentParams, data, id, send]);

  const [uploading, setUploading] = useState('');
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files[0];
      setUploading(URL.createObjectURL(file));

      upload(file)
        .then((url) => {
          change((draft) => {
            draft.picture = url;
          });
        })
        .catch(console.error)
        .finally(() => {
          setUploading('');
        });
    },
    [setUploading, change],
  );

  const isVoid = !picture && !uploading;

  return (
    <>
      <PanelHeader
        separator={false}
        left={<PanelHeaderBack onClick={goBack} />}
      >
        {title}
      </PanelHeader>
      <Content height={'70px'}>
        <Div>
          <Cover isVoid={isVoid}>
            {isVoid ? (
              <File
                mode={'tertiary'}
                before={<Icon28PictureOutline />}
                contextMenu={'l'}
                onChange={onFileChange}
              >
                Загрузить обложку
              </File>
            ) : (
              <Picture>
                <img src={picture || uploading} alt={''} />
                <Dismiss>
                  {uploading ? (
                    <Spinner size={'regular'} />
                  ) : (
                    <Icon24DismissOverlay
                      onClick={() => {
                        change((draft) => {
                          draft.picture = '';
                        });
                      }}
                    />
                  )}
                </Dismiss>
              </Picture>
            )}
          </Cover>
        </Div>
        <FormLayout>
          <Input
            top={'Название сбора'}
            placeholder={'Название сбора'}
            value={name}
            maxLength={32}
            name={'name'}
            onChange={onChange}
          />
          <FormLayoutGroup top={sumTop}>
            <NumberFormat
              customInput={Input}
              type={'tel'}
              value={sum ? sum : null}
              allowNegative={false}
              thousandSeparator={' '}
              suffix={' ₽'}
              placeholder={sumPlaceholder}
              decimalScale={0}
              onValueChange={(value) => {
                change((draft) => {
                  draft.sum = value.floatValue;
                });
              }}
              isAllowed={(values) => values.value[0] !== '0'}
            />
          </FormLayoutGroup>
          <Input
            top={'Цель'}
            placeholder={targetPlaceholder}
            value={target}
            maxLength={32}
            name={'target'}
            onChange={onChange}
          />
          <Textarea
            top={'Описание'}
            placeholder={'На что пойдут деньги и как они кому-то помогут?'}
            value={description}
            maxLength={350}
            name={'description'}
            onChange={onChange}
          />
          <AccountSelect top={'Куда получать деньги'} value={'vk-pay'} disabled>
            <option value={'vk-pay'}>Счёт VK Pay · 1234</option>
          </AccountSelect>
          {type === 'regular' && (
            <Select
              top={'Автор'}
              value={author}
              name={'author'}
              onChange={onChange}
            >
              <option value={user.fullName}>{user.fullName}</option>
              <option value={'Скрыт'}>Скрыт</option>
            </Select>
          )}
        </FormLayout>
      </Content>
      <FixedLayout vertical={'bottom'} filled>
        <Bottom>
          <Div>
            <Button
              size={'xl'}
              stretched
              disabled={
                !name || !target || !sum || !description || !picture || sending
              }
              onClick={submit}
            >
              {params?.type === 'target' ? 'Далее' : 'Создать сбор'}
            </Button>
          </Div>
        </Bottom>
      </FixedLayout>
    </>
  );
};

export default StepOnePage;
