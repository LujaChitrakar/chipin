import { View, Text } from 'react-native';
import React from 'react';
import GlobalStyles from '@/assets/global.styles';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';

const GroupsPage = () => {
  return (
    <ScreenContainer>
      <ScreenHeader title="Groups" backButton={false} />
    </ScreenContainer>
  );
};

export default GroupsPage;
