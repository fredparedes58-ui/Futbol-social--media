import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView,
    Platform, ScrollView, FlatList
} from 'react-native';
import { useAuth } from '../src/contexts/AuthProvider';
import { supabase } from '../src/services/supabaseClient';
import { COLORS } from '../src/constants/theme';
import { Lock, Mail, User, CheckCircle, Search, Shield } from 'lucide-react-native';
import { styles as globalStyles } from '../src/styles/globalStyles';
import { router } from 'expo-router';

// ─── Step Dots ────────────────────────────────────────────────────
const StepDot = ({ step, current }: { step: number; current: number }) => (
    <View style={[localStyles.dot, step <= current && localStyles.dotActive]} />
);

// ─── Reusable Input ───────────────────────────────────────────────
const InputRow = ({
    icon, placeholder, value, onChangeText,
    secureTextEntry = false,
    keyboardType = 'default' as any,
    autoCapitalize = 'sentences' as any,
}) => (
    <View style={localStyles.inputContainer}>
        <View style={localStyles.inputIcon}>{icon}</View>
        <TextInput
            style={localStyles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
        />
    </View>
);

// ─── Main Component ───────────────────────────────────────────────
export default function AuthScreen() {
    const [mode, setMode] = useState<'login' | 'register' | 'check_email' | 'onboarding'>('login');
    const [errorMsg, setErrorMsg] = useState('');

    // Account
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Player search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [searching, setSearching] = useState(false);

    const [loading, setLoading] = useState(false);
    const { signIn, signUp, session } = useAuth();

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
            setMode('onboarding');
        }
        // If linked → _layout.tsx redirects to tabs
    };

    // ─── SEARCH FFCV PLAYERS ─────────────────────────────────────
    const searchPlayers = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const { data, error } = await supabase
                .from('players')
                .select('id, first_name, last_name, teams(name)')
                .or(`first_name.ilike.%${query.trim()}%,last_name.ilike.%${query.trim()}%`)
                .limit(20);

            if (error) {
                console.error('[SEARCH] Error:', error.message);
                setSearchResults([]);
            } else {
                setSearchResults(data || []);
            }
        } catch (e: any) {
            console.error('[SEARCH] Exception:', e.message);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchPlayers(searchQuery), 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ─── AUTH HANDLERS ───────────────────────────────────────────

    const handleLogin = async () => {
        setErrorMsg('');
        if (!email || !password) return setErrorMsg('Completa email y contraseña.');
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) setErrorMsg(error.message);
    };

    const handleRegister = async () => {
        setErrorMsg('');
        if (!email || !password || !username) return setErrorMsg('Todos los campos son obligatorios.');
        if (password.length < 6) return setErrorMsg('La contraseña necesita al menos 6 caracteres.');
        setLoading(true);
        const { error } = await signUp(email, password);
        setLoading(false);
        if (error) setErrorMsg(error.message);
        else setMode('check_email');
    };

    const handleConfirmChild = async () => {
        setErrorMsg('');
        if (!selectedPlayer) return setErrorMsg('Selecciona a tu hijo de la lista.');
        if (!session?.user) return setErrorMsg('Sesión no disponible. Inicia sesión de nuevo.');
        setLoading(true);

        try {
            // 1. Upsert parent profile
            await supabase.from('profiles').upsert({
                id: session.user.id,
                role: 'padre',
            });

            // 2. Create parent → child link referencing real FFCV player
            const { error: linkError } = await supabase
                .from('parent_child_links')
                .insert({
                    parent_id: session.user.id,
                    player_id: selectedPlayer.id,
                });

            if (linkError) {
                // If duplicate link, just proceed (player already linked)
                if (!linkError.message.includes('duplicate')) throw linkError;
            }

            router.replace('/(tabs)');
        } catch (e: any) {
            console.error('[ONBOARDING]', e.message);
            setErrorMsg(e.message || 'Error al guardar. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // ─── EMAIL CONFIRMATION ──────────────────────────────────────
    if (mode === 'check_email') {
        return (
            <SafeAreaView style={localStyles.container}>
                <View style={localStyles.centerBox}>
                    <CheckCircle color={COLORS.accent} size={72} />
                    <Text style={localStyles.bigTitle}>¡Revisa tu correo!</Text>
                    <Text style={localStyles.helperText}>
                        Enviamos un enlace a{' '}
                        <Text style={{ color: COLORS.accent, fontWeight: 'bold' }}>{email}</Text>.
                        {'\n\n'}Confirma tu email y vuelve aquí para continuar.
                    </Text>
                    <TouchableOpacity style={localStyles.primaryBtn} onPress={() => setMode('login')}>
                        <Text style={localStyles.primaryBtnText}>YA CONFIRMÉ MI EMAIL ✓</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ─── ONBOARDING — SEARCH REAL FFCV PLAYER ───────────────────
    if (mode === 'onboarding') {
        const teamName = selectedPlayer?.teams?.name ?? selectedPlayer?.team_name ?? '';
        return (
            <SafeAreaView style={localStyles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={localStyles.scrollContent} keyboardShouldPersistTaps="handled">
                        <View style={localStyles.stepHeader}>
                            <View style={localStyles.stepDots}>
                                <StepDot step={1} current={2} />
                                <StepDot step={2} current={2} />
                            </View>
                            <Text style={localStyles.bigTitle}>⚽ Busca a tu hijo</Text>
                            <Text style={localStyles.helperText}>
                                Escribe el nombre de tu hijo para encontrarlo entre los jugadores registrados en la FFCV.
                            </Text>
                        </View>

                        {/* Search Box */}
                        <View style={localStyles.searchBox}>
                            <Search color={COLORS.accent} size={20} />
                            <TextInput
                                style={localStyles.searchInput}
                                placeholder="Nombre o apellido del jugador..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={searchQuery}
                                onChangeText={text => {
                                    setSearchQuery(text);
                                    setSelectedPlayer(null);
                                }}
                                autoCapitalize="none"
                            />
                            {searching && <ActivityIndicator color={COLORS.accent} size="small" />}
                        </View>

                        {/* Selected Player preview */}
                        {selectedPlayer && (
                            <View style={localStyles.selectedCard}>
                                <CheckCircle color={COLORS.accent} size={22} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={{ color: COLORS.textMain, fontFamily: 'Oswald_700Bold', fontSize: 16 }}>
                                        {selectedPlayer.first_name} {selectedPlayer.last_name}
                                    </Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
                                        {teamName}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Results list */}
                        {searchResults.length > 0 && !selectedPlayer && (
                            <View style={{ gap: 8 }}>
                                {searchResults.map(player => {
                                    const pTeam = player.teams?.name ?? '';
                                    return (
                                        <TouchableOpacity
                                            key={player.id}
                                            style={localStyles.resultItem}
                                            onPress={() => {
                                                setSelectedPlayer(player);
                                                setSearchResults([]);
                                            }}
                                        >
                                            <Shield color={COLORS.accent} size={20} />
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={{ color: COLORS.textMain, fontWeight: '700', fontSize: 15 }}>
                                                    {player.first_name} {player.last_name}
                                                </Text>
                                                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>
                                                    {pTeam}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {/* No results message */}
                        {searchQuery.length >= 2 && !searching && searchResults.length === 0 && !selectedPlayer && (
                            <View style={localStyles.noResultBox}>
                                <Text style={{ fontSize: 32, marginBottom: 10 }}>🤷</Text>
                                <Text style={{ color: COLORS.textMain, fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
                                    No se encontró ningún jugador
                                </Text>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                                    Verifica que el nombre coincide exactamente con el registro oficial de la FFCV o contacta con tu club.
                                </Text>
                            </View>
                        )}

                        {!!errorMsg && (
                            <View style={localStyles.errorBox}>
                                <Text style={localStyles.errorText}>⚠️ {errorMsg}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[localStyles.primaryBtn, { marginTop: 24, opacity: selectedPlayer ? 1 : 0.4 }]}
                            onPress={handleConfirmChild}
                            disabled={!selectedPlayer || loading}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={localStyles.primaryBtnText}>
                                    {selectedPlayer ? `CONFIRMAR — ${selectedPlayer.first_name} ${selectedPlayer.last_name}` : 'BUSCA A TU HIJO PRIMERO'}
                                </Text>
                            }
                        </TouchableOpacity>
                        <View style={{ height: 60 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ─── LOGIN / REGISTER ────────────────────────────────────────
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
                        <InputRow
                            icon={<User color={COLORS.textSecondary} size={18} />}
                            placeholder="Nombre de usuario"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    )}
                    <InputRow
                        icon={<Mail color={COLORS.textSecondary} size={18} />}
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <InputRow
                        icon={<Lock color={COLORS.textSecondary} size={18} />}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                    />

                    {!!errorMsg && (
                        <View style={localStyles.errorBox}>
                            <Text style={localStyles.errorText}>⚠️ {errorMsg}</Text>
                        </View>
                    )}

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

// ─── STYLES ───────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 20 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35 },

    headerArea: { alignItems: 'center', marginBottom: 40 },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 10, fontWeight: '500' },

    bigTitle: {
        color: COLORS.textMain, fontSize: 26, fontFamily: 'Oswald_700Bold',
        textAlign: 'center', marginTop: 16, marginBottom: 8,
    },
    helperText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },

    stepHeader: { alignItems: 'center', paddingTop: 20, marginBottom: 20 },
    stepDots: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.glassBorder },
    dotActive: { backgroundColor: COLORS.accent, width: 24 },

    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: COLORS.surface, borderRadius: 18, padding: 16,
        borderWidth: 1.5, borderColor: COLORS.accent + '40', marginBottom: 16,
    },
    searchInput: { flex: 1, color: COLORS.textMain, fontSize: 15 },

    resultItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    selectedCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.accent + '18', borderRadius: 14, padding: 14,
        borderWidth: 1.5, borderColor: COLORS.accent, marginBottom: 16,
    },
    noResultBox: {
        alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: 16, padding: 24, borderWidth: 1, borderColor: COLORS.glassBorder,
        marginTop: 8,
    },
    authCard: {
        backgroundColor: COLORS.surface, borderRadius: 30, padding: 25,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg,
        borderRadius: 15, marginBottom: 16, paddingHorizontal: 15, height: 55,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: COLORS.textMain, fontSize: 15 },

    errorBox: {
        backgroundColor: '#FF4B4B18', borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: '#FF4B4B40', marginTop: 8,
    },
    errorText: { color: '#FF4B4B', fontSize: 13, textAlign: 'center' },

    primaryBtn: {
        backgroundColor: COLORS.accent, height: 60, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    primaryBtnText: { color: 'white', fontSize: 15, fontFamily: 'Oswald_700Bold', letterSpacing: 0.8 },
    toggleArea: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
    toggleText: { color: COLORS.textSecondary, fontSize: 14 },
    toggleAction: { color: COLORS.accent, fontSize: 14, fontWeight: 'bold' },
});
