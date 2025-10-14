import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import GroupHeader from '@/components/group/GroupHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetGroupById } from '@/services/api/groupApi';
import { AntDesign } from '@expo/vector-icons';
import colors from '@/assets/colors';

const GroupDetailPage = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const [activeTab, setActiveTab] = useState('Members');
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [openPaidBy, setOpenPaidBy] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const members = groupData?.data?.members || [];

  const handleAddExpenseSubmit = (formData: {
    description: string;
    amount: string;
    paidBy: string;
    category: string;
    splitAmong: string[];
  }) => {
    console.log('Add Expense Form Data:', formData);
  };

  return (
    <ScreenContainer>
      <GroupHeader
        title={groupData?.data?.name || groupId}
        backButton={true}
        groupData={groupData}
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 16,
            marginHorizontal: 8,
            padding: 12,
            borderRadius: 8,
            borderColor: colors.white + 'aa',
            borderWidth: 1,
            backgroundColor: colors.white + '11',
          }}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name='plus' size={18} color='white' />
          <Text style={{ color: 'white', marginLeft: 8 }}>Add Expense</Text>
        </TouchableOpacity>
        {/* Tab bar and tab content */}
        <View>
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
                  backgroundColor:
                    activeTab === tab ? '#1a9b8e' : 'transparent',
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
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingHorizontal: 8,
              paddingVertical: 16,
            }}
          >
            {activeTab === 'Members' && (
              <>
                {members.map((member: any) => (
                  <View
                    key={member._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#2a3b4d',
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#1a9b8e',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: '600',
                          }}
                        >
                          {(member.fullname || member.username)
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: '500',
                          }}
                        >
                          {member.fullname || member.username}
                        </Text>
                        <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                          {member.email}
                        </Text>
                        {member.phone_number && (
                          <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                            {member.phone_number}
                          </Text>
                        )}
                      </View>
                    </View>
                    {groupData?.data?.member_admins.includes(member._id) && (
                      <Text
                        style={{
                          color: '#1a9b8e',
                          fontSize: 14,
                          fontWeight: '600',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          backgroundColor: 'rgba(26, 155, 142, 0.2)',
                          borderRadius: 4,
                        }}
                      >
                        Admin
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.black + 'aa',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.light,
              padding: 20,
              borderRadius: 10,
              width: '80%',
              gap: 10,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 10,
              }}
            >
              Add Expense
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
                color: 'white',
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              placeholder='e.g., Dinner at restaurant'
              placeholderTextColor={colors.gray.DEFAULT}
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
                color: 'white',
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              placeholder='$ 0.00'
              placeholderTextColor={colors.gray.DEFAULT}
              value={amount}
              onChangeText={setAmount}
              keyboardType='numeric'
            />

            <View style={{ marginBottom: 10 }}>
              {members.map((member: any) => (
                <TouchableOpacity
                  key={member._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                  onPress={() => {
                    setSplitAmong((prev) =>
                      prev.includes(member._id)
                        ? prev.filter(
                            (id) =>
                              id !== member._id
                          )
                        : [...prev, member._id]
                    );
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: colors.gray.DEFAULT,
                      marginRight: 10,
                      backgroundColor: splitAmong.includes(
                        member.fullname || member.username
                      )
                        ? colors.primary.DEFAULT
                        : 'transparent',
                    }}
                  />
                  <Text style={{ color: 'white' }}>
                    {member.fullname || member.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.gray[600],
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 5,
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                }}
                onPress={() => {
                  handleAddExpenseSubmit({
                    description,
                    amount,
                    paidBy,
                    category,
                    splitAmong,
                  });
                  setModalVisible(false);
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default GroupDetailPage;
