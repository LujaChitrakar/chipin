import { View } from 'react-native';
import React, { useState } from 'react';
import Button from '../common/Button';
import { HandCoins } from 'lucide-react-native';
import colors from '@/assets/colors';

import BorrowLendModal from '../home/BorrowLendModal';
import { useGetUserById } from "@/services/api/friendsApi";

const LendBorrowButton = ({
  friendId,
}: {
  friendId?: string
}) => {
  const { data: friendData, isLoading: friendDataLoading } =
    useGetUserById(friendId || "");
  
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState<'LEND' | 'BORROW'>('LEND');
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          display: 'flex',
        }}
      >
        <Button
          title='Lend'
          icon={<HandCoins size={18} color={colors.white} />}
          onPress={() => {
            setAction('LEND');
            setVisible(true);
          }}
          textColor={colors.white}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
        />
        <Button
          title='Borrow'
          icon={
            <HandCoins
              size={18}
              color={colors.white}
              style={{
                transform: [{ rotateY: '180deg' }],
              }}
            />
          }
          onPress={() => {
            setAction('BORROW');
            setVisible(true);
          }}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
          textColor={colors.white}
        />
      </View>
      <BorrowLendModal
        visible={visible}
        setVisible={setVisible}
        action={action}
        defaultSelectedFriend={friendId && friendData?.data}
      />
    </>
  );
};

export default LendBorrowButton;
