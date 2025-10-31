import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '@/assets/colors';
import SavingGroupCard from './SavingGroupCard';
import { useRouter } from 'expo-router';

const SavingGroupTabs = ({
  mySavingGroups,
  mySavingGroupsLoading,
}: {
  mySavingGroups: {
    data: any[];
    success: boolean;
    message: string;
  };
  mySavingGroupsLoading: boolean;
}) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'incomplete' | 'complete'>(
    'incomplete'
  );

  const [allSavingGroups, setAllSavingGroups] = useState<any[]>([]);
  const [incompleteSavingGroups, setIncompleteSavingGroups] = useState<any[]>(
    []
  );
  const [completedSavingGroups, setCompletedSavingGroups] = useState<any[]>([]);

  useEffect(() => {
    const savingGroupsList = mySavingGroups?.data || [];
    setAllSavingGroups(savingGroupsList);
    setIncompleteSavingGroups(
      savingGroupsList.filter((g: any) => !(g.settled === true))
    );
    setCompletedSavingGroups(
      savingGroupsList.filter((g: any) => g.settled === true)
    );
  }, [mySavingGroups]);

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
          onPress={() => setActiveTab('all')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: activeTab === 'all' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'all'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('incomplete')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'incomplete' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'incomplete'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Incomplete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('complete')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'complete' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'complete'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      {/* Content */}
      {mySavingGroupsLoading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size='large' color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <>
          {(activeTab === 'all' && allSavingGroups.length === 0) ||
          (activeTab === 'incomplete' && incompleteSavingGroups.length === 0) ||
          (activeTab === 'complete' && completedSavingGroups.length === 0) ? (
            <View
              style={{
                padding: 24,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.grayTextColor.DEFAULT }}>
                {activeTab === 'all'
                  ? "You don't have savings yet."
                  : activeTab === 'incomplete'
                  ? 'No incomplete savings to show.'
                  : 'No completed savings to show.'}
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
              {(activeTab === 'all'
                ? allSavingGroups
                : activeTab === 'complete'
                ? completedSavingGroups
                : incompleteSavingGroups
              ).map((savingGroup: any, index: number) => (
                <SavingGroupCard
                  onTap={() => {
                    router.push(`/tabs/saving/${savingGroup?.group_type === "SQUAD" ? "squad" : "personal"}/${savingGroup._id}`);
                  }}
                  key={index}
                  savingGroup={savingGroup}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default SavingGroupTabs;
