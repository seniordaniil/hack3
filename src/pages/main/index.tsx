import React, { FC } from 'react';
import { useNavigator } from 'features/navigator';
import { PanelHeader, Placeholder, Button } from '@vkontakte/vkui';

const MainPage: FC<{ id: string }> = ({ id }) => {
  const { navigate } = useNavigator(id);

  return (
    <>
      <PanelHeader>Пожертвования</PanelHeader>
      <Placeholder
        stretched
        action={
          <Button onClick={() => navigate('create', {})}>Создать сбор</Button>
        }
      >
        <div>У Вас пока нет сборов.</div>
        <div>Начните доброе дело.</div>
      </Placeholder>
    </>
  );
};

export default MainPage;
