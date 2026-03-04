import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import {
    Zap,
    X,
    Send,
    MessageSquare,
    TrendingUp,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { styles } from '../styles/globalStyles';
import { PunchedCard } from './Feed';

const League = ({
    showMisterAI,
    setShowMisterAI,
    misterMessages,
    misterInput,
    setMisterInput,
    handleSendMisterMsg,
    leagueTab,
    setLeagueTab,
    selectedJornada,
    setSelectedJornada,
    handlePredictMatch,
    handleGenerateGazzetta,
    toggleTone,
    gazzettaArticle,
    handleNarrateGazzetta,
    isSpeaking,
    leagueTeams,
    isGazzettaGenerating,
    selectedTeamTab,
    setSelectedTeamTab,
    setShowTactical,
    pickImage,
    squadPhotos,
    squadPlayers,
    FFCV_ROSTERS,
}) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.statsTimeline} stickyHeaderIndices={[1]}>
            <Text style={styles.heroTitle}>LIGA EXPLORER PRO</Text>

            {/* Botón Flotante Míster AI */}
            <TouchableOpacity
                style={styles.floatingMisterBtn}
                onPress={() => setShowMisterAI(!showMisterAI)}
            >
                <Text style={{ fontSize: 24 }}>🤖</Text>
            </TouchableOpacity>

            {/* Panel Desplegable Míster AI */}
            {showMisterAI && (
                <View style={styles.misterAIPanel}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <Text style={{ fontFamily: 'Oswald_700Bold', color: '#EAB308', fontSize: 16 }}>EL MÍSTER AI 🧠</Text>
                        <TouchableOpacity onPress={() => setShowMisterAI(false)}><X size={20} color="white" /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ height: 150, marginBottom: 10 }}>
                        {misterMessages.map((m, i) => (
                            <View key={i} style={[styles.msgBubble, m.sender === 'ai' ? styles.msgAI : styles.msgUser]}>
                                <Text style={{ color: 'white', fontSize: 12 }}>{m.text}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            style={styles.misterInput}
                            placeholder="Pregunta por el rival..."
                            placeholderTextColor="#999"
                            value={misterInput}
                            onChangeText={setMisterInput}
                            onSubmitEditing={handleSendMisterMsg}
                        />
                        <TouchableOpacity style={styles.misterSendBtn} onPress={handleSendMisterMsg}>
                            <Send size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Sub-Navegación Liga */}
            <View style={{ backgroundColor: COLORS.bg, paddingBottom: 15 }}>
                <View style={styles.leagueTabs}>
                    {['clasificacion', 'resultados', 'plantillas'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setLeagueTab(tab)}
                            style={[styles.lTabBtn, leagueTab === tab && styles.lTabActive]}
                        >
                            <Text style={[styles.lTabTxt, leagueTab === tab && { color: 'white' }]}>{tab.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Carrusel de Jornadas */}
            <View style={{ marginBottom: 30 }}>
                <Text style={{ fontFamily: 'Oswald_700Bold', color: COLORS.textMain, fontSize: 18, marginBottom: 15 }}>CARRUSEL DE JORNADAS 🗓️</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[14, 15, 16, 17].map(j => (
                        <TouchableOpacity
                            key={j}
                            style={[styles.jornadaCard, selectedJornada === j && { borderColor: COLORS.accent, borderWidth: 2 }]}
                            onPress={() => setSelectedJornada(j)}
                        >
                            <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>JORNADA {j}</Text>
                            <View style={styles.jResultRow}>
                                <Text style={styles.jTeamMini}>SAN MARCELINO</Text>
                                <Text style={styles.jScore}>2 - 2</Text>
                                <Text style={styles.jTeamMini}>TORRENT CF</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 9, color: COLORS.accent }}>FINALIZADO</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* AI SUITE */}
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 30 }}>
                <TouchableOpacity style={styles.aiWidgetSmall} onPress={handlePredictMatch}>
                    <Zap size={20} color={COLORS.accent} />
                    <Text style={styles.aiWidgetLabel}>PREDICTOR IA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiWidgetSmall} onPress={handleGenerateGazzetta}>
                    <MessageSquare size={20} color={COLORS.neonPurple} />
                    <Text style={styles.aiWidgetLabel}>GAZZETTA AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiWidgetSmall} onPress={toggleTone}>
                    <TrendingUp size={20} color={COLORS.neonGold} />
                    <Text style={styles.aiWidgetLabel}>CAMBIAR TONO</Text>
                </TouchableOpacity>
            </View>

            {/* Gazzetta Article */}
            {gazzettaArticle && (
                <PunchedCard style={{ marginBottom: 30, padding: 20 }} borderColor={COLORS.neonPurple}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image source={{ uri: gazzettaArticle.avatar }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                            <Text style={{ fontWeight: 'bold', color: COLORS.textMain }}>{gazzettaArticle.user}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleNarrateGazzetta(gazzettaArticle.content)}>
                            <Zap size={20} color={isSpeaking ? COLORS.accent : COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Image source={{ uri: gazzettaArticle.media }} style={{ width: '100%', height: 180, borderRadius: 15, marginBottom: 15 }} />
                    <Text style={{ color: COLORS.textMain, fontSize: 13, lineHeight: 20 }}>{gazzettaArticle.content}</Text>
                </PunchedCard>
            )}

            {leagueTab === 'clasificacion' && (
                <View style={{ paddingBottom: 100 }}>
                    <PunchedCard style={{ padding: 0, overflow: 'hidden' }} borderColor={COLORS.neonPurple}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tCol, { flex: 0.5 }]}>#</Text>
                            <Text style={[styles.tCol, { flex: 3, textAlign: 'left' }]}>EQUIPO</Text>
                            <Text style={styles.tCol}>PJ</Text>
                            <Text style={styles.tCol}>G</Text>
                            <Text style={[styles.tCol, { color: COLORS.accent, fontWeight: 'bold' }]}>PTS</Text>
                        </View>
                        {leagueTeams.map((t, idx) => (
                            <View key={idx} style={[styles.tableRow, t.team.includes('SAN MARCELINO') && { backgroundColor: COLORS.accent + '15' }]}>
                                <Text style={[styles.tCell, { flex: 0.5, fontWeight: 'bold', color: COLORS.textSecondary }]}>{t.pos}</Text>
                                <Text style={[styles.tCell, { flex: 3, textAlign: 'left', fontWeight: t.team.includes('SAN MARCELINO') ? 'bold' : 'normal', color: COLORS.textMain }]} numberOfLines={1}>{t.team}</Text>
                                <Text style={styles.tCell}>{t.pj}</Text>
                                <Text style={styles.tCell}>{t.pg}</Text>
                                <Text style={[styles.tCell, { color: COLORS.accent, fontWeight: 'bold', fontSize: 16 }]}>{t.pts}</Text>
                            </View>
                        ))}
                    </PunchedCard>
                </View>
            )}

            {leagueTab === 'plantillas' && (
                <View style={{ paddingBottom: 100 }}>
                    <PunchedCard style={{ padding: 0, overflow: 'hidden' }} borderColor={COLORS.accent}>
                        <View style={[styles.tableHeader, { justifyContent: 'space-between' }]}>
                            <Text style={[styles.tCol, { flex: 2, textAlign: 'left', marginLeft: 10 }]}>JUGADOR</Text>
                            <Text style={[styles.tCol, { flex: 1 }]}>POSICIÓN</Text>
                            <Text style={[styles.tCol, { flex: 0.5, color: COLORS.accent, fontWeight: 'bold' }]}>OVR</Text>
                        </View>
                        {squadPlayers && squadPlayers.length > 0 ? (
                            squadPlayers.map((playerName, index) => (
                                <View key={index} style={styles.squadRowNew}>
                                    <TouchableOpacity style={{ marginRight: 15 }} onPress={() => pickImage(playerName)}>
                                        <View style={styles.rosterAvatar}>
                                            {squadPhotos[playerName] ? (
                                                <Image source={{ uri: squadPhotos[playerName] }} style={{ width: 50, height: 50, borderRadius: 16 }} />
                                            ) : (
                                                <Image source={{ uri: `https://i.pravatar.cc/150?u=${playerName}` }} style={{ width: 50, height: 50, borderRadius: 16 }} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.rosterName}>{playerName}</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={styles.rosterPos}>
                                            {index === 0 ? 'POR' : index < 4 ? 'DEF' : index < 8 ? 'MED' : 'DEL'}
                                        </Text>
                                    </View>
                                    <View style={styles.ovrBadge}>
                                        <Text style={styles.ovrTxt}>{89 - Math.floor(Math.random() * 15)}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: COLORS.textSecondary, textAlign: 'center', padding: 30 }}>Cargando plantilla o sin datos...</Text>
                        )}
                    </PunchedCard>
                </View>
            )}

            {/* ... (Similarly for results if needed, otherwise this is a huge start) */}
        </ScrollView>
    );
};

export default League;
