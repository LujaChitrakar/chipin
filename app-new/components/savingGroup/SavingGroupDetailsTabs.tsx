import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import colors from '@/assets/colors';
import SavingGroupTabContent from './SavingGroupDetailsTabContent';

const SavingGroupDetailsTabs = () => {
  const [activeTab, setActiveTab] = useState<
    'expenses' | 'balances' | 'members'
  >('expenses');

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
          onPress={() => setActiveTab('expenses')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'expenses' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'expenses'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Expenses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('balances')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'balances' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'balances'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Balances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('members')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'members' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'members'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Members
          </Text>
        </TouchableOpacity>
      </View>


      <SavingGroupTabContent activeTab={activeTab} />
    </View>
  );
};

export default SavingGroupDetailsTabs;
