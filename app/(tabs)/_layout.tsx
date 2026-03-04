import { Tabs } from 'expo-router';
import { Home, Users, Zap, MessageSquare, User } from 'lucide-react-native';
import { COLORS } from '../../src/constants/theme';
import { View } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.accent,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    backgroundColor: 'white',
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    paddingBottom: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Comunidad',
                    tabBarIcon: ({ color }) => <Users color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="league"
                options={{
                    title: 'Liga',
                    tabBarIcon: ({ color }) => (
                        <View style={{
                            width: 56,
                            height: 56,
                            backgroundColor: COLORS.textMain,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: -25,
                            borderWidth: 5,
                            borderColor: 'white',
                        }}>
                            <Zap color="white" size={28} fill="white" />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <User color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}
