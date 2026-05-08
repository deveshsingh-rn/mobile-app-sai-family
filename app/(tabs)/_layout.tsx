import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>

      <Tabs.Screen name="index" />
      <Tabs.Screen name="sangha" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="profile" />

    </Tabs>
  );
}