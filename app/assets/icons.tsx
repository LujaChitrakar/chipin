import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

export const icons = {
  getBottomTabIcon: (name: string, color: string, size: number) => {
    if (name.includes('groups')) {
      return <Feather name='users' size={size} color={color} />;
    } else if (name.includes('crypto')) {
      return (
        <MaterialCommunityIcons
          name='wallet-outline'
          size={size}
          color={color}
        />
      );
    } else if (name.includes('friends')) {
      return <FontAwesome5 name='user-circle' size={size} color={color} />;
    } else if (name.includes('account')) {
      return <Feather name='settings' size={size} color={color} />;
    } else if (name.includes('saving')) {
      return <MaterialCommunityIcons
        name='piggy-bank-outline'
        size={size}
        color={color}
      />;
    } else {
      return null;
    }
  },
};
