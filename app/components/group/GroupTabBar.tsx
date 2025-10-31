import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import colors from '@/assets/colors';

interface GroupTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GroupTabBar: React.FC<GroupTabBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#1a252f',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2a3b4d',
      }}
    >
      {['Expenses', 'Balances', 'Members'].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 8,
            backgroundColor: activeTab === tab ? '#1a9b8e' : 'transparent',
            borderRadius: 4,
            marginHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: activeTab === tab ? '600' : '400',
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default GroupTabBar;
