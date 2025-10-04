import { AntDesign, Feather } from "@expo/vector-icons";

export const icons = {
  getBottomTabIcon: (name: string, color: string, size: number) => {
    if (name.includes("home")) {
      return <AntDesign name="home" size={size} color={color} />;
    } else if (name.includes("profile")) {
      return <Feather name="user" size={size} color={color} />;
    } else if (name.includes("settings")) {
      return <Feather name="settings" size={size} color={color} />;
    } else {
      return null;
    }

  },
};