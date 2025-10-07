import { View, Text } from 'react-native'
import React from 'react'
import ScreenContainer from "@/components/ScreenContainer";
import ScreenHeader from "@/components/navigation/ScreenHeader";

const CryptoPage = () => {
  return (
    <ScreenContainer>
      <ScreenHeader title='Crypto' backButton={false} />
    </ScreenContainer>
  );
}

export default CryptoPage