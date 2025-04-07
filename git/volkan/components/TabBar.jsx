import { View, TouchableOpacity, StyleSheet, } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const icons = {
  home: ({ color }) => <Ionicons name="home" size={28} color={color} />,
  news: ({ color }) => <Ionicons name="newspaper" size={28} color={color} />,
  notification: ({ color }) => <Ionicons name="notifications" size={28} color={color} />,
  profile: ({ color }) => <Ionicons name="person" size={28} color={color} />,
  search: ({ color }) => <Ionicons name="search" size={28} color={color} />,
};

const primaryColor = '#0b4716';
const greyColor = '#8E8E93';

const TabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabbarContainer}>
      <View style={styles.curve} />
      
      <View style={styles.tabbar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] || {};
          const label = options?.tabBarLabel || options?.title || route.name;

          if (['_sitemap', '+not-found'].includes(route.name)) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabbarItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
            >
              {icons[route.name]?.({ color: isFocused ? primaryColor : greyColor })}
              
              
              {isFocused && (
                <View style={styles.dotsContainer}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabbarContainer: {
    position: 'relative',
  },
  
  curve: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#000000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: -1,
  },
  tabbar: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    width: '90%',
    paddingVertical: 16,
    borderRadius:30,
    left:20,
  },
  tabbarItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: primaryColor,
    marginHorizontal: 2,
  },
});

export default TabBar;