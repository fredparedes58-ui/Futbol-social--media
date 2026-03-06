import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthProvider';
import { supabase } from '../../src/services/supabaseClient';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';
import { User, Shield, LogOut, Star, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { session, signOut } = useAuth();
    const [linkedPlayer, setLinkedPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) loadLinkedPlayer();
    }, [session]);

    const loadLinkedPlayer = async () => {
        const { data, error } = await supabase
            .from('parent_child_links')
            .select(`
                players (
                    id,
                    first_name,
                    last_name,
                    position,
                    overall_rating,
                    teams ( name )
                )
            `)
            .eq('parent_id', session!.user.id)
            .limit(1)
            .single();

        if (error) console.error('[PROFILE] load error:', error.message);
        setLinkedPlayer(data?.players ?? null);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace('/auth');
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={COLORS.accent} size="large" />
            </View>
        );
    }

    const player = linkedPlayer;
    const teamName = player?.teams?.name ?? '—';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
            </View>

            {/* Parent Card */}
            <View style={{
                backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
                borderWidth: 1, borderColor: COLORS.glassBorder, marginBottom: 16,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{
                        width: 56, height: 56, borderRadius: 28,
                        backgroundColor: COLORS.accent + '20', justifyContent: 'center', alignItems: 'center',
                    }}>
                        <User color={COLORS.accent} size={28} />
                    </View>
                    <View>
                        <Text style={{ color: COLORS.textMain, fontSize: 18, fontFamily: 'Oswald_700Bold' }}>
                            {session?.user?.email?.split('@')[0] ?? 'Padre'}
                        </Text>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
                            {session?.user?.email}
                        </Text>
                        <View style={{
                            backgroundColor: COLORS.accent + '20', borderRadius: 20,
                            paddingHorizontal: 10, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start',
                        }}>
                            <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700' }}>PADRE / FAMILIAR</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Child / Player Card */}
            {player ? (
                <View style={{
                    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
                    borderWidth: 1.5, borderColor: COLORS.accent + '50', marginBottom: 16,
                }}>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>
                        ⚽ MI HIJO — JUGADOR FFCV
                    </Text>
                    <Text style={{ color: COLORS.textMain, fontSize: 24, fontFamily: 'Oswald_700Bold', marginBottom: 14 }}>
                        {player.first_name} {player.last_name}
                    </Text>
                    <View style={{ gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Shield color={COLORS.accent} size={18} />
                            <Text style={{ color: COLORS.textMain, fontSize: 15 }}>{teamName}</Text>
                        </View>
                        {player.position ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Star color={COLORS.textSecondary} size={18} />
                                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                                    {player.position}
                                    {player.overall_rating ? ` · ${player.overall_rating} OVR` : ''}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            ) : (
                <View style={{
                    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
                    borderWidth: 1, borderColor: COLORS.glassBorder, marginBottom: 16, alignItems: 'center',
                }}>
                    <Text style={{ fontSize: 32, marginBottom: 10 }}>⚽</Text>
                    <Text style={{ color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                        No hay ningún jugador vinculado.{'\n'}Completa el proceso de registro.
                    </Text>
                </View>
            )}

            {/* Sign Out */}
            <TouchableOpacity
                onPress={handleSignOut}
                style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#FF4B4B18', borderRadius: 16, padding: 16,
                    borderWidth: 1, borderColor: '#FF4B4B30',
                }}
            >
                <LogOut color="#FF4B4B" size={20} />
                <Text style={{ color: '#FF4B4B', fontWeight: '700', fontSize: 15 }}>Cerrar Sesión</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
