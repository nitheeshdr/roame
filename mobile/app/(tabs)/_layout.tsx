import { Tabs } from 'expo-router';
import { Compass, Map, PlusCircle, Bell, User } from 'lucide-react-native';

const ACTIVE = '#059669';
const INACTIVE = '#71717A';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E4E4E7',
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Discover', tabBarIcon: ({ color }) => <Compass color={color} size={22} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <Map color={color} size={22} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Host', tabBarIcon: ({ color }) => <PlusCircle color={color} size={22} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Bell color={color} size={22} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={22} strokeWidth={2} /> }}
      />
    </Tabs>
  );
}
