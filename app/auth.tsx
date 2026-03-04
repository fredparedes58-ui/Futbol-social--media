import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView,
    Platform, ScrollView, FlatList
} from 'react-native';
import { useAuth } from '../src/contexts/AuthProvider';
import { supabase } from '../src/services/supabase';
import { COLORS } from '../src/constants/theme';
import { Lock, Mail, User, Users, ChevronRight, CheckCircle, Shield } from 'lucide-react-native';
import { styles as globalStyles } from '../src/styles/globalStyles';
import { router } from 'expo-router';

// ─── Step Indicator ───────────────────────────────────────────────
const StepDot = ({ step, current }: { step: number; current: number }) => (
    <View style={[localStyles.dot, step <= current && localStyles.dotActive]} />
);

// ─── Main Component ───────────────────────────────────────────────
export default function AuthScreen() {
    // Auth mode: 'login' | 'register' | 'check_email' | 'onboarding_team' | 'onboarding_player'
    const [mode, setMode] = useState<'login' | 'register' | 'check_email' | 'onboarding_team' | 'onboarding_player'>('login');

    // Step 1: Account fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Step 2 & 3: Onboarding
    const [teams, setTeams] = useState<any[]>([]);
    const [players, setPlayers] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

    const [loading, setLoading] = useState(false);

    const { signIn, signUp, session } = useAuth();

    // When session becomes available, check if onboarding is needed
    useEffect(() => {
        if (session?.user) {
            checkOnboardingStatus(session.user.id);
        }
    }, [session]);

    const checkOnboardingStatus = async (userId: string) => {
        const { data } = await supabase
            .from('parent_child_links')
            .select('id')
            .eq('parent_id', userId)
            .limit(1);

        if (!data || data.length === 0) {
            // No child linked yet → start onboarding
            fetchTeams();
            setMode('onboarding_team');
        }
        // If already linked, _layout.tsx redirect to tabs handles it
    };

    const fetchTeams = async () => {
        const { data } = await supabase.from('teams').select('id, name, shield_url');
        if (data) setTeams(data);
    };

    const fetchPlayers = async (teamId: string) => {
        const { data } = await supabase
            .from('players')
            .select('id, first_name, last_name, position, overall_rating')
            .eq('team_id', teamId);
        if (data) setPlayers(data);
    };

    // ─── HANDLERS ──────────────────────────────────────────────────

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert('Error', 'Completa email y contraseña.');
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) Alert.alert('Error al iniciar sesión', error.message);
    };

    const handleRegister = async () => {
        if (!email || !password || !username) {
            return Alert.alert('Error', 'Todos los campos son obligatorios.');
        }
        if (password.length < 6) {
            return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
        }
        setLoading(true);
        const { error } = await signUp(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Error en el registro', error.message);
        } else {
            // Store username in profile after email confirmation (done in onboarding)
            setMode('check_email');
        }
    };

    const handleSelectTeam = (team: any) => {
        setSelectedTeam(team);
        fetchPlayers(team.id);
        setMode('onboarding_player');
    };

    const handleFinishOnboarding = async () => {
        if (!selectedPlayer || !session?.user) return;
        setLoading(true);

        try {
            // 1. Save username to profiles table
            await supabase.from('profiles').upsert({
                id: session.user.id,
                username: username || email.split('@')[0],
                role: 'padre'
            });

            // 2. Link parent → child
            const { error } = await supabase.from('parent_child_links').insert({
                parent_id: session.user.id,
                player_id: selectedPlayer.id
            });

            if (error) throw error;

            // 3. Navigate to main app
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // ─── RENDERS ───────────────────────────────────────────────────

    if (mode === 'check_email') {
        return (
            <SafeAreaView style={localStyles.container}>
                <View style={localStyles.centerBox}>
                    <CheckCircle color={COLORS.accent} size={64} />
                    <Text style={localStyles.bigTitle}>¡Revisa tu correo!</Text>
                    <Text style={localStyles.helperText}>
                        Te enviamos un enlace de confirmación a{' '}
                        <Text style={{ color: COLORS.accent, fontWeight: 'bold' }}>{email}</Text>.{'\n\n'}
                        Confirma tu email y luego vuelve aquí para iniciar sesión.
                    </Text>
                    <TouchableOpacity style={localStyles.primaryBtn} onPress={() => setMode('login')}>
                        <Text style={localStyles.primaryBtnText}>YA CONFIRMÉ MI EMAIL</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (mode === 'onboarding_team') {
        return (
            <SafeAreaView style={localStyles.container}>
                <ScrollView contentContainerStyle={localStyles.scrollContent}>
                    <View style={localStyles.stepHeader}>
                        <View style={localStyles.stepDots}>
                            <StepDot step={1} current={1} />
                            <StepDot step={2} current={1} />
                        </View>
                        <Text style={localStyles.bigTitle}>¿A qué equipo{'\n'}pertenece tu hijo?</Text>
                        <Text style={localStyles.helperText}>Selecciona el club y categoría</Text>
                    </View>
                    <View style={localStyles.listContainer}>
                        {teams.map(team => (
                            <TouchableOpacity
                                key={team.id}
                                style={localStyles.listItem}
                                onPress={() => handleSelectTeam(team)}
                            >
                                <Shield color={COLORS.accent} size={28} />
                                <Text style={localStyles.listItemText}>{team.name}</Text>
                                <ChevronRight color={COLORS.textSecondary} size={20} />
                            </TouchableOpacity>
                        ))}
                        {teams.length === 0 && (
                            <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (mode === 'onboarding_player') {
        return (
            <SafeAreaView style={localStyles.container}>
                <ScrollView contentContainerStyle={localStyles.scrollContent}>
                    <View style={localStyles.stepHeader}>
                        <View style={localStyles.stepDots}>
                            <StepDot step={1} current={2} />
                            <StepDot step={2} current={2} />
                        </View>
                        <Text style={localStyles.bigTitle}>¿Cuál es tu hijo?</Text>
                        <Text style={localStyles.helperText}>{selectedTeam?.name}</Text>
                    </View>
                    <View style={localStyles.listContainer}>
                        {players.map(player => (
                            <TouchableOpacity
                                key={player.id}
                                style={[
                                    localStyles.listItem,
                                    selectedPlayer?.id === player.id && localStyles.listItemSelected
                                ]}
                                onPress={() => setSelectedPlayer(player)}
                            >
                                <Users color={selectedPlayer?.id === player.id ? COLORS.accent : COLORS.textSecondary} size={28} />
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={localStyles.listItemText}>
                                        {player.first_name} {player.last_name}
                                    </Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                                        {player.position} · {player.overall_rating ?? '–'} OVR
                                    </Text>
                                </View>
                                {selectedPlayer?.id === player.id && (
                                    <CheckCircle color={COLORS.accent} size={22} />
                                )}
                            </TouchableOpacity>
                        ))}
                        {players.length === 0 && (
                            <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
                        )}
                    </View>
                    {selectedPlayer && (
                        <TouchableOpacity
                            style={[localStyles.primaryBtn, { marginTop: 20 }]}
                            onPress={handleFinishOnboarding}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={localStyles.primaryBtnText}>¡LISTO! IR AL FEED 🚀</Text>
                            }
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setMode('onboarding_team')} style={{ marginTop: 16, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSecondary }}>← Cambiar equipo</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ─── LOGIN / REGISTER VIEW ─────────────────────────────────────
    return (
        <SafeAreaView style={localStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={localStyles.keyboardView}>

                <View style={localStyles.headerArea}>
                    <Text style={globalStyles.logo}>KICKBASE</Text>
                    <Text style={localStyles.subtitle}>
                        {mode === 'login' ? 'Accede a tu cuenta' : 'Únete a la comunidad'}
                    </Text>
                </View>

                <View style={localStyles.authCard}>

                    {mode === 'register' && (
                        <View style={localStyles.inputContainer}>
                            <User color={COLORS.textSecondary} size={20} style={localStyles.inputIcon} />
                            <TextInput
                                style={localStyles.input}
                                placeholder="Nombre de usuario"
                                placeholderTextColor={COLORS.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <View style={localStyles.inputContainer}>
                        <Mail color={COLORS.textSecondary} size={20} style={localStyles.inputIcon} />
                        <TextInput
                            style={localStyles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor={COLORS.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <Lock color={COLORS.textSecondary} size={20} style={localStyles.inputIcon} />
                        <TextInput
                            style={localStyles.input}
                            placeholder="Contraseña"
                            placeholderTextColor={COLORS.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={localStyles.primaryBtn}
                        onPress={mode === 'login' ? handleLogin : handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={localStyles.primaryBtnText}>
                                {mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>

                <View style={localStyles.toggleArea}>
                    <Text style={localStyles.toggleText}>
                        {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    </Text>
                    <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
                        <Text style={localStyles.toggleAction}>
                            {mode === 'login' ? ' Regístrate' : ' Inicia Sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── STYLES ────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35 },

    headerArea: { alignItems: 'center', marginBottom: 50 },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 10, fontWeight: '500' },

    bigTitle: {
        color: COLORS.textMain, fontSize: 26, fontFamily: 'Oswald_700Bold',
        textAlign: 'center', marginTop: 16, marginBottom: 8
    },
    helperText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },

    stepHeader: { alignItems: 'center', paddingTop: 30, marginBottom: 20 },
    stepDots: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.glassBorder },
    dotActive: { backgroundColor: COLORS.accent, width: 24 },

    listContainer: { gap: 12 },
    listItem: {
        flexDirection: 'row', alignItems: 'center', gap: 15,
        backgroundColor: COLORS.surface, borderRadius: 18, padding: 18,
        borderWidth: 1, borderColor: COLORS.glassBorder
    },
    listItemSelected: { borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}18` },
    listItemText: { flex: 1, color: COLORS.textMain, fontSize: 16, fontWeight: '600' },

    authCard: {
        backgroundColor: COLORS.surface, borderRadius: 30, padding: 25,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1, shadowRadius: 20,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg,
        borderRadius: 15, marginBottom: 20, paddingHorizontal: 15, height: 55,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    inputIcon: { marginRight: 15 },
    input: { flex: 1, color: COLORS.textMain, fontSize: 15 },
    primaryBtn: {
        backgroundColor: COLORS.accent, height: 60, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginTop: 10,
    },
    primaryBtnText: { color: 'white', fontSize: 16, fontFamily: 'Oswald_700Bold', letterSpacing: 1 },
    toggleArea: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
    toggleText: { color: COLORS.textSecondary, fontSize: 14 },
    toggleAction: { color: COLORS.accent, fontSize: 14, fontWeight: 'bold' },
});
