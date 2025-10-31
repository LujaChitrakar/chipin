import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';
import { ChevronRight, UsersRound } from 'lucide-react-native';
import { getNetBalanceFromIndividualBalances } from '@/utils/balance.utils';
import { useGetMyProfile } from '@/services/api/authApi';

const GroupCard = ({ group, onTap }: { group: any; onTap: () => void }) => {
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const [netBalance, setNetBalance] = React.useState(0);
  React.useEffect(() => {
    if (group?.balances && myProfile) {
      const balance = getNetBalanceFromIndividualBalances(
        (group.balances && group.balances[myProfile.data?._id || '']) || {}
      );
      setNetBalance(balance);
    }
  }, [group, myProfile]);

  return (
    <TouchableOpacity
      onPress={() => {
        onTap();
      }}
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.cardBackground.DEFAULT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <UsersRound color={colors.white + 'cc'} />
        <View style={{ marginRight: 12 }}>
          <Text
            style={{
              color: colors.white + 'cc',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {group.name || 'Untitled Group'}
          </Text>
          <Text
            style={{ color: colors.grayTextColor.dark, fontSize: 13 }}
            numberOfLines={1}
          >
            {group.description || `${group.members?.length || 0} members`}
          </Text>
        </View>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: colors.grayTextColor.dark,
              fontSize: 10,
              textAlign: 'right',
            }}
          >
            {netBalance < 0
              ? 'You Owe'
              : netBalance > 0
              ? 'You’re Owed'
              : 'Settled up'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              display: 'flex',
              gap: 6,
            }}
          >
            <Text
              style={{
                color: colors.grayTextColor.dark,
                fontSize: 14,
              }}
            >
              $
            </Text>
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
              }}
            >
              {Math.abs(netBalance).toFixed(2)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.grayTextColor.dark} />
      </View>
    </TouchableOpacity>
  );
};

export default GroupCard;
