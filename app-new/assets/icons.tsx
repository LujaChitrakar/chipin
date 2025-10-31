import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { History } from 'lucide-react-native';

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
    } else if (name.includes('home')) {
      return <Feather name='home' size={size} color={color} />;
    } else if (name.includes('saving')) {
      return (
        <MaterialCommunityIcons
          name='piggy-bank-outline'
          size={size}
          color={color}
        />
      );
    } else if (name.includes('recents')) {
      return <History size={size} color={color} />;
    } else {
      return null;
    }
  },
};
