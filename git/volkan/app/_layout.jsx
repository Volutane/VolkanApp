import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '../components/TabBar'


const _layout = () => {
  return (
    <Tabs
       tabBar={props=> <TabBar {...props} />}
    > 
    <Tabs.Screen
    name='home'
    options={{
      headerShown: false
     
    }}
    />
    <Tabs.Screen
    name='search'
    options={{
      headerShown: false
    }}
    />
    <Tabs.Screen
    name='news'
    options={{
      headerShown: false
    }}
    />
    <Tabs.Screen
    name='notification'
    options={{
      headerShown: false
    }}
    />
    <Tabs.Screen
    name='profile'
    options={{
      headerShown: false
    }}
    />
    </Tabs>
  )
}

export default _layout