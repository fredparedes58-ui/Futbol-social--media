import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
    logo: { fontSize: 28, fontFamily: 'Oswald_700Bold', color: COLORS.textMain, letterSpacing: 2 },
    headerRight: { flexDirection: 'row', gap: 12 },
    circleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },

    // Visibility Toggle
    visibilityToggle: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 20, marginBottom: 20, padding: 4 },
    vBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    vBtnActive: { backgroundColor: COLORS.textMain },
    vText: { color: COLORS.textSecondary, fontSize: 9, fontWeight: 'bold' },

    // ADN Stories Hexagon
    highlightsContainer: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    adnItem: { alignItems: 'center', marginRight: 15 },
    hexContainer: {
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hexagon: {
        width: 60,
        height: 60,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
        borderRadius: 12, // Suavizado para parecer hexagonal futurista
        overflow: 'hidden',
    },
    hexImage: {
        width: 80,
        height: 80,
        transform: [{ rotate: '-45deg' }],
    },
    orbitLabel: { color: COLORS.textSecondary, fontSize: 9, marginTop: 8, fontWeight: 'bold' },

    // Feed Scroll
    feedScroll: { paddingHorizontal: 20, paddingTop: 15 },
    punchedCard: { backgroundColor: COLORS.bg, borderRadius: 32, marginBottom: 25, borderWidth: 2, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    authorSmall: { width: 44, height: 44, borderRadius: 16 },
    authorName: { color: COLORS.textMain, fontWeight: 'bold', fontSize: 13, fontFamily: 'Roboto_700Bold' },
    authorMeta: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' },

    mediaFrame: { height: 340, borderRadius: 24, overflow: 'hidden', backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    mediaOverlay: { position: 'absolute', top: 12, right: 12 },
    fullImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    tagText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    entryFooter: { marginTop: 15 },
    entryText: { color: COLORS.textMain, fontSize: 14, lineHeight: 22, marginBottom: 15 },
    interactionRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1 },
    interText: { fontWeight: 'bold', fontSize: 13 },
    shareBtn: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },

    // Stats
    statsTimeline: { padding: 20 },
    heroTitle: { fontSize: 32, fontFamily: 'Oswald_700Bold', color: COLORS.textMain, marginBottom: 20 },
    jornadaBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, backgroundColor: COLORS.surface, marginRight: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
    jornadaBtnActive: { backgroundColor: COLORS.textMain, borderColor: COLORS.textMain },
    jornadaBtnText: { color: COLORS.textMain, fontWeight: 'bold', fontSize: 12 },

    // ... (Adding more styles contextually as they are moved)
    // [NOTE] For brevity in this step, I'm including the most critical ones for Feed/League
    floatingMisterBtn: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
    misterAIPanel: { backgroundColor: COLORS.textMain, borderRadius: 25, padding: 20, marginBottom: 20 },
    msgBubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '85%' },
    msgAI: { backgroundColor: 'rgba(0, 209, 255, 0.1)', alignSelf: 'flex-start' },
    msgUser: { backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-end' },
    misterInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 15, color: 'white', fontSize: 12 },
    misterSendBtn: { width: 40, height: 40, borderRadius: 15, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
    leagueTabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 4 },
    lTabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    lTabActive: { backgroundColor: COLORS.textMain },
    lTabTxt: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold' },
    jornadaCard: { backgroundColor: 'white', borderRadius: 20, padding: 15, width: 180, marginRight: 15, borderWidth: 1, borderColor: COLORS.glassBorder },
    jResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
    jTeamMini: { fontSize: 8, fontWeight: 'bold', color: COLORS.textMain, width: 60, textAlign: 'center' },
    jScore: { fontSize: 16, fontFamily: 'Oswald_700Bold', color: COLORS.accent },
    aiWidgetSmall: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
    aiWidgetLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.textSecondary, letterSpacing: 0.5 },
    tableHeader: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 15, borderBottomWidth: 1, borderColor: COLORS.glassBorder },
    tCol: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: COLORS.textSecondary },
    tableRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center' },
    tCell: { flex: 1, textAlign: 'center', fontSize: 12 },
    matchResultCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.glassBorder },
    matchTeamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    matchTeamNameLeft: { flex: 1, textAlign: 'right', fontSize: 12, fontWeight: 'bold', color: COLORS.textMain },
    matchTeamNameRight: { flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 'bold', color: COLORS.textMain },
    matchScoreBadge: { backgroundColor: COLORS.textMain, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginHorizontal: 15 },
    matchScoreTxt: { color: COLORS.neonGold, fontFamily: 'Oswald_700Bold', fontSize: 16 },
    matchFieldTxt: { textAlign: 'center', fontSize: 10, color: COLORS.textSecondary, fontWeight: 'bold', marginTop: 5 },
    squadRowNew: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.surface },
    rosterAvatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.accent },
    editIconBadge: { position: 'absolute', bottom: -5, right: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.neonPurple, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
    rosterName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMain },
    rosterPos: { fontSize: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
    ovrBadge: { backgroundColor: COLORS.textMain, width: 35, height: 35, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    ovrTxt: { color: COLORS.neonGold, fontFamily: 'Oswald_700Bold', fontSize: 14 },

    // Modals
    modalBg: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 25 },
    tacticalCard: { backgroundColor: 'white', borderRadius: 35, padding: 30, width: '95%', height: '80%' },
    closeBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    uTitle: { fontSize: 22, fontFamily: 'Oswald_700Bold', color: COLORS.textMain },

    // Navigation
    navWrapper: { position: 'absolute', bottom: 20, width: '100%', paddingHorizontal: 40 },
    navMain: { height: 60, backgroundColor: 'white', borderRadius: 25, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, borderWidth: 1, borderColor: '#F1F5F9' },
    navItem: { alignItems: 'center', justifyContent: 'center', width: 44 },
    navDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.accent, marginTop: 4 },
    zapMain: { marginTop: -30 },
    zapInner: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: 'white' },

    // Upload Modal
    uploadCard: { backgroundColor: 'white', borderRadius: 35, padding: 30 },
    uHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    selectZone: { height: 180, borderRadius: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.accent + '60', backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    fieldInput: { height: 50, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 15, color: COLORS.textMain, borderWidth: 1, borderColor: COLORS.glassBorder, marginTop: 15 },
    finalUploadBtn: { height: 64, backgroundColor: COLORS.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
    finalUploadText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    // Progress Bar
    progressContainer: { height: 6, backgroundColor: COLORS.surface, borderRadius: 3, marginTop: 15, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: COLORS.accent },
    progressText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
});
