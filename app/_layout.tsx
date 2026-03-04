import { Stack } from 'expo-router';
import { useFonts, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthProvider';
import { COLORS } from '../src/constants/theme';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

const RootLayoutNav = () => {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!session && !inAuthGroup) {
            // Redirect to the login page.
            router.replace('/auth');
        } else if (session && inAuthGroup) {
            // Redirect away from the login page.
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
    );
};

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Oswald_700Bold,
        Roboto_400Regular,
        Roboto_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
