import { Stack } from 'expo-router';
import { useFonts, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthProvider';
import { ChildProvider } from '../src/contexts/ChildContext';
import { supabase } from '../src/services/supabaseClient';
import { COLORS } from '../src/constants/theme';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

const RootLayoutNav = () => {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const checkOnboarding = async () => {
            if (!session) {
                if (segments[0] !== 'auth') router.replace('/auth');
                return;
            }

            // Check if the parent has a linked child via parent_child_links (FFCV validated)
            const { data, error } = await supabase
                .from('parent_child_links')
                .select('id')
                .eq('parent_id', session.user.id)
                .limit(1);

            const hasOnboarded = !!(data && data.length > 0);

            if (segments[0] === 'auth') {
                if (hasOnboarded) router.replace('/(tabs)');
            } else {
                if (!hasOnboarded) router.replace('/auth');
            }
        };

        checkOnboarding();
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
