import { View, StyleSheet } from 'react-native';
import React from 'react';
import TabBarButton from './TabBarButton';
import colors from '@/assets/colors';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  // If the page is a dynamic route (e.g., [groupId]), do not render the tab bar
  const currentRoute = state.routes[state.index];
  const hasBracketRoute = /\[.*\]/.test(currentRoute.name);
  if (hasBracketRoute) return null;

  // for now not rendering the savings
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        // Do not render the unnecessary nested dynamic routes in tab bar
        if (/\[.*\]/.test(route.name)) return null;
        if (label?.toLowerCase()?.includes('saving')) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? colors.primary.DEFAULT : colors.gray.DEFAULT}
            label={label}
          />
        );
      })}
    </View>
  );
};

// colors.primary

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    backgroundColor: colors.background.DEFAULT + 'ed',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.cardBackground.light + '66',
    paddingHorizontal: 24,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
});

export default TabBar;
