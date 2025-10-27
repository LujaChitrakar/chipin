import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';
import {
  ChevronRight,
  DollarSign,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { getNetBalanceFromIndividualBalances } from '@/utils/balance.utils';
import { useGetMyProfile } from '@/services/api/authApi';
import GroupMembersChain from '../group/GroupMembersChain';
import CircularProgress from '../CircularProgress';

const SavingGroupCard = ({
  savingGroup,
  onTap,
}: {
  savingGroup: any;
  onTap: () => void;
}) => {
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const [netBalance, setNetBalance] = React.useState(0);
  React.useEffect(() => {
    if (savingGroup?.balances && myProfile) {
      const balance = getNetBalanceFromIndividualBalances(
        (savingGroup.balances &&
          savingGroup.balances[myProfile.data?._id || '']) ||
          {}
      );
      setNetBalance(balance);
    }
  }, [savingGroup, myProfile]);

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
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <DollarSign size={16} color={colors.white + 'cc'} />
          {savingGroup?.group_type === 'SQUAD' ? (
            <UsersRound size={24} color={colors.white + 'cc'} />
          ) : (
            <UserRound size={24} color={colors.white + 'cc'} />
          )}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Text
            style={{
              color: colors.white + 'cc',
              fontSize: 16,
              fontWeight: '600',
            }}
            numberOfLines={1}
          >
            {savingGroup.name || 'Untitled Saving'}
          </Text>
          <Text
            style={{
              color: colors.grayTextColor.dark,
              fontSize: 13,
            }}
            numberOfLines={1}
          >
            {savingGroup.group_type === 'PERSONAL' ? (
              'Personal Savings'
            ) : (
              <GroupMembersChain
                circleSize={18}
                members={savingGroup.members}
                styles={{
                  paddingVertical: 0,
                }}
              />
            )}
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
        <CircularProgress
          size={31}
          target={savingGroup?.target_saving}
          progress={savingGroup?.reached_savings}
        />
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
            {"You've Saved"}
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
              {Math.abs(savingGroup?.reached_savings).toFixed(2)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.grayTextColor.dark} />
      </View>
    </TouchableOpacity>
  );
};

export default SavingGroupCard;
