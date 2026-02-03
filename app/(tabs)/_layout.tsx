import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // We use this for icons

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // --- 1. SPOTIFY COLORS ---
        tabBarActiveTintColor: '#1DB954', // Green when clicked
        tabBarInactiveTintColor: '#b3b3b3', // Gray when not clicked
        tabBarStyle: {
          backgroundColor: '#121212', // Dark background
          borderTopColor: '#000000',  // Hide the top border
          height: 60,                 // Taller bar
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false, // Hide the top header bar
      }}
    >
      {/* --- TAB 1: HOME --- */}
      <Tabs.Screen
        name="HomeScreen" // This MUST match the filename 'HomeScreen.tsx'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* --- TAB 2: ADD --- */}
      <Tabs.Screen
        name="AddScreen" // This MUST match the filename 'AddScreen.tsx'
        options={{
          title: 'Add Song',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      {/* --- TAB 3: DELETE --- */}
      <Tabs.Screen
        name="DelScreen" // This MUST match the filename 'DeleteScreen.tsx'
        options={{
          title: 'Delete',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}