import React, { FC } from 'react';
import { useStore } from 'effector-react';
import { $state, goBack } from 'features/navigator';
import { ConfigProvider, View, Panel } from '@vkontakte/vkui';
import { MainPage, DonatePage, CreatePage, StepOne, StepTwo } from './pages';

export const App: FC = () => {
  const state = useStore($state);

  if (state.history.length < 1) return null;

  return (
    <ConfigProvider
      isWebView={process.env.NODE_ENV !== 'production' || undefined}
    >
      <View
        activePanel={state.current?.id}
        history={state.history}
        onSwipeBack={goBack}
      >
        <Page Component={MainPage} id={'main'} />
        <Page Component={CreatePage} id={'create'} />
        <Page Component={StepOne} id={'step-one'} />
        <Page Component={StepTwo} id={'step-two'} />
        <Page Component={DonatePage} id={'donate'} />
      </View>
    </ConfigProvider>
  );
};

interface PageProps {
  id: string;
}

interface PagePanelProps extends PageProps {
  Component: FC<PageProps>;
}

const Page: FC<PagePanelProps> = ({ id, Component }) => {
  return (
    <Panel id={id}>
      <Component id={id} />
    </Panel>
  );
};
