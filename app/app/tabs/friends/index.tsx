import { View, Text } from 'react-native';
import React from 'react';
import ScreenContainer from "@/components/ScreenContainer";
import ScreenHeader from "@/components/navigation/ScreenHeader";

const FriendsPage = () => {
  return (
    <ScreenContainer>
      <ScreenHeader title='Friends' backButton={false} />
    </ScreenContainer>
  );
};

export default FriendsPage;
