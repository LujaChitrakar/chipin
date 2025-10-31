import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '@/assets/colors';
import GroupCard from './GroupCard';
import { useRouter } from 'expo-router';

const GroupTabs = ({
  myGroups,
  myGroupsLoading,
}: {
  myGroups: {
    data: any[];
    success: boolean;
    message: string;
  };
  myGroupsLoading: boolean;
}) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');

  const [activeGroups, setActiveGroups] = useState<any[]>([]);
  const [settledGroups, setSettledGroups] = useState<any[]>([]);

  useEffect(() => {
    const groupsList = myGroups?.data || [];
    setActiveGroups(groupsList.filter((g: any) => !(g.settled === true)));
    setSettledGroups(groupsList.filter((g: any) => g.settled === true));
  }, [myGroups]);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.cardBackground.DEFAULT,
          borderRadius: 12,
          padding: 8,
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'active' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'active'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Active Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('settled')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'settled' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'settled'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Settled Groups
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      {myGroupsLoading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size='large' color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <>
          {(activeTab === 'active' && activeGroups.length === 0) ||
          (activeTab === 'settled' && settledGroups.length === 0) ? (
            <View
              style={{
                padding: 24,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.grayTextColor.DEFAULT }}>
                {activeTab === 'active'
                  ? "You don't have any active groups yet."
                  : 'No settled groups to show.'}
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {(activeTab === 'active' ? activeGroups : settledGroups).map(
                (group: any, index: number) => (
                  <GroupCard
                    onTap={() => {
                      router.push(`/tabs/groups/${group._id}`);
                    }}
                    key={index}
                    group={group}
                  />
                )
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default GroupTabs;
