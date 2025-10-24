import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';

const GroupMembersChain = ({
  members,
  styles,
  circleSize = 40,
  spread = 18,
}: {
  members: any[];
  styles?: any;
  circleSize?: number;
  spread?: number;
}) => {
  const displayCount = Math.min(members.length, 4);

  const getInitial = (member: any) => {
    const name = member?.fullname || member?.username || member?.email || '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        ...(styles || {}),
      }}
    >
      <View style={customStyles.avatarsContainer}>
        {members.slice(0, displayCount).map((member: any, index: number) => (
          <View
            key={member._id}
            style={[
              customStyles.avatarWrapper,
              {
                zIndex: displayCount - index,
                marginLeft: index > 0 ? -spread : 0,
              },
            ]}
          >
            {member?.profile_picture ? (
              <Image
                source={{ uri: member.profile_picture }}
                style={{
                  ...customStyles.avatar,
                  width: circleSize,
                  height: circleSize,
                }}
              />
            ) : (
              <View
                style={{
                  ...customStyles.avatarPlaceholder,
                  width: circleSize,
                  height: circleSize,
                }}
              >
                <Text
                  style={{
                    ...customStyles.avatarInitial,
                    fontSize: circleSize / 2,
                  }}
                >
                  {getInitial(member)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const customStyles = StyleSheet.create({
  container: {},
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 20,
  },
  avatar: {
    borderRadius: 20,
    backgroundColor: colors.cardBackground.DEFAULT,
  },
  avatarPlaceholder: {
    borderRadius: 20,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontWeight: '600',
  },
  memberText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    textDecorationLine: 'underline',
  },
});

export default GroupMembersChain;
