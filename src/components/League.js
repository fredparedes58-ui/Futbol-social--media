import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    Alert,
} from 'react-native';
import {
    Zap,
    X,
    Send,
    MessageSquare,
    TrendingUp,
    Star,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { styles } from '../styles/globalStyles';
import { PunchedCard } from './Feed';

// StarRating Component
const StarRating = ({ rating, onRate, label }) => (
    <View style={{ marginBottom: 18 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 }}>
            {label.toUpperCase()}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => onRate(i)}>
                    <Star
                        size={32}
                        color={i <= rating ? COLORS.neonGold : COLORS.glassBorder}
                        fill={i <= rating ? COLORS.neonGold : 'transparent'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// RatingCard - shows the community average for a category
const RatingCard = ({ label, emoji, value }) => (
    <View style={{
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text style={{ color: COLORS.neonGold, fontWeight: 'bold', fontSize: 20, marginTop: 4 }}>
            {value ? value.toFixed(1) : '—'}
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 9, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>
            {label.toUpperCase()}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={8} color={i <= Math.round(value || 0) ? COLORS.neonGold : COLORS.glassBorder}
                    fill={i <= Math.round(value || 0) ? COLORS.neonGold : 'transparent'} />
            ))}
        </View>
    </View>
);

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
    supabase,
    userId,
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={[styles.leagueTabs, { paddingHorizontal: 4 }]}>
                        {['clasificacion', 'resultados', 'plantillas', 'valoraciones'].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setLeagueTab(tab)}
                                style={[styles.lTabBtn, leagueTab === tab && styles.lTabActive, { paddingHorizontal: 10 }]}
                            >
                                <Text style={[styles.lTabTxt, leagueTab === tab && { color: 'white' }]}>
                                    {tab === 'valoraciones' ? '⭐ VALORAR' : tab.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
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

            {leagueTab === 'valoraciones' && (
                <ValoracionesPanel
                    selectedJornada={selectedJornada}
                    setSelectedJornada={setSelectedJornada}
                    supabase={supabase}
                    userId={userId}
                />
            )}
        </ScrollView>
    );
};

// ============================================================
// Valoraciones Panel
// ============================================================
const ValoracionesPanel = ({ selectedJornada, setSelectedJornada, supabase, userId }) => {
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [matchRating, setMatchRating] = useState(0);
    const [atmosphereRating, setAtmosphereRating] = useState(0);
    const [barRating, setBarRating] = useState(0);
    const [refereeRating, setRefereeRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [communityAvg, setCommunityAvg] = useState(null);
    const [myReview, setMyReview] = useState(null);

    const JORNADAS = [
        { id: 14, label: 'J14', homeTeam: 'SAN MARCELINO', awayTeam: 'FUNDACIÓ VCF', score: '2-1', status: 'FINALIZADO' },
        { id: 15, label: 'J15', homeTeam: 'SAN MARCELINO', awayTeam: 'TORRENT CF', score: '2-2', status: 'FINALIZADO' },
        { id: 16, label: 'J16', homeTeam: 'ALZIRA', awayTeam: 'SAN MARCELINO', score: '0-3', status: 'FINALIZADO' },
        { id: 17, label: 'J17', homeTeam: 'SAN MARCELINO', awayTeam: 'VILLARREAL B', score: '-', status: 'PRÓXIMO' },
    ];

    const selectedMatch = JORNADAS.find(j => j.id === selectedJornada);

    const handleSubmit = async () => {
        if (!matchRating || !atmosphereRating || !barRating || !refereeRating) {
            Alert.alert('Incompleto', 'Por favor, puntúa todas las categorías antes de enviar.');
            return;
        }
        setIsSubmitting(true);

        const starsFor = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
        const avg = ((matchRating + atmosphereRating + barRating + refereeRating) / 4).toFixed(1);

        try {
            if (!supabase || !userId) throw new Error('No autenticado');

            // 1. Guardar en match_reviews
            await supabase.from('match_reviews').upsert({
                user_id: userId,
                match_id: null,
                match_rating: matchRating,
                atmosphere_rating: atmosphereRating,
                bar_rating: barRating,
                referee_rating: refereeRating,
                comment,
            }, { onConflict: 'match_id,user_id' });

            // 2. Construir el contenido del post con formato rico
            const jornada = selectedMatch;
            const postContent = [
                `⭐ VALORACIÓN JORNADA ${jornada?.id || ''} · ${avg}/5`,
                `⚽ ${jornada?.homeTeam} ${jornada?.score} ${jornada?.awayTeam}`,
                ``,
                `⚽ Partido:     ${starsFor(matchRating)}`,
                `🔥 Ambiente:   ${starsFor(atmosphereRating)}`,
                `🍺 Bar:          ${starsFor(barRating)}`,
                `🟨 Arbitraje:  ${starsFor(refereeRating)}`,
                comment ? `\n💬 "${comment}"` : '',
            ].filter(Boolean).join('\n');

            // 3. Publicar en el muro global Y de equipo
            const { error: postError } = await supabase.from('posts').insert([{
                author_id: userId,
                content: postContent,
                media_url: null,
                media_type: 'rating',
                media_metadata: {
                    type: 'match_review',
                    jornada: jornada?.id,
                    homeTeam: jornada?.homeTeam,
                    awayTeam: jornada?.awayTeam,
                    score: jornada?.score,
                    match_rating: matchRating,
                    atmosphere_rating: atmosphereRating,
                    bar_rating: barRating,
                    referee_rating: refereeRating,
                    avg_rating: parseFloat(avg),
                }
            }]);

            if (postError) console.warn('Post publish warning:', postError.message);

            // 4. Actualizar promedios en UI (optimista)
            setCommunityAvg({
                avg_match: ((communityAvg?.avg_match || 0) + matchRating) / 2,
                avg_atmosphere: ((communityAvg?.avg_atmosphere || 0) + atmosphereRating) / 2,
                avg_bar: ((communityAvg?.avg_bar || 0) + barRating) / 2,
                avg_referee: ((communityAvg?.avg_referee || 0) + refereeRating) / 2,
                total_reviews: (communityAvg?.total_reviews || 0) + 1,
            });
            setMyReview({ matchRating, atmosphereRating, barRating, refereeRating });
            setShowRatingModal(false);
            Alert.alert(
                '¡Publicado! 🎉',
                'Tu valoración ha sido guardada y publicada en el muro del equipo y global.',
                [{ text: 'Perfecto' }]
            );
        } catch (e) {
            console.error('handleSubmit error:', e);
            Alert.alert('Error', 'No se pudo guardar la valoración: ' + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ paddingBottom: 100 }}>
            {/* Jornada Selector */}
            <Text style={{ fontFamily: 'Oswald_700Bold', color: COLORS.textMain, fontSize: 16, marginBottom: 12 }}>
                SELECCIONA EL PARTIDO
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {JORNADAS.map(j => (
                    <TouchableOpacity
                        key={j.id}
                        onPress={() => { setSelectedJornada(j.id); setMyReview(null); setCommunityAvg(null); }}
                        style={[styles.jornadaCard, selectedJornada === j.id && { borderColor: COLORS.accent, borderWidth: 2 }]}
                    >
                        <Text style={{ fontSize: 9, color: COLORS.textSecondary, marginBottom: 4 }}>JORNADA {j.id}</Text>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center' }} numberOfLines={1}>
                            {j.homeTeam}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.accent, textAlign: 'center', marginVertical: 4 }}>
                            {j.score}
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center' }} numberOfLines={1}>
                            {j.awayTeam}
                        </Text>
                        <Text style={{ fontSize: 8, color: j.status === 'PRÓXIMO' ? COLORS.textSecondary : '#22c55e', marginTop: 4, textAlign: 'center', fontWeight: 'bold' }}>
                            {j.status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Community Averages */}
            {communityAvg && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontFamily: 'Oswald_700Bold', color: COLORS.textMain, fontSize: 14, marginBottom: 12 }}>
                        VALORACIÓN MEDIA · {communityAvg.total_reviews} {communityAvg.total_reviews === 1 ? 'VOTO' : 'VOTOS'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <RatingCard label="Partido" emoji="⚽" value={communityAvg.avg_match} />
                        <RatingCard label="Ambiente" emoji="🔥" value={communityAvg.avg_atmosphere} />
                        <RatingCard label="Bar" emoji="🍺" value={communityAvg.avg_bar} />
                        <RatingCard label="Arbitraje" emoji="🟨" value={communityAvg.avg_referee} />
                    </View>
                </View>
            )}

            {/* My Review or CTA */}
            {myReview ? (
                <PunchedCard style={{ padding: 20 }} borderColor="#22c55e">
                    <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>✅ TU VALORACIÓN ENVIADA</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {[['⚽ Partido', myReview.matchRating], ['🔥 Ambiente', myReview.atmosphereRating], ['🍺 Bar', myReview.barRating], ['🟨 Árbitro', myReview.refereeRating]].map(([label, val]) => (
                            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, padding: 8, borderRadius: 12 }}>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>{label}</Text>
                                <Text style={{ color: COLORS.neonGold, fontWeight: 'bold', fontSize: 13 }}>{'★'.repeat(val)}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowRatingModal(true)}
                        style={{ marginTop: 12, alignSelf: 'flex-start' }}
                    >
                        <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: 'bold' }}>✏️ Editar valoración</Text>
                    </TouchableOpacity>
                </PunchedCard>
            ) : (
                <TouchableOpacity
                    onPress={() => selectedMatch?.status === 'PRÓXIMO'
                        ? Alert.alert('Partido no finalizado', 'Podrás valorar este partido cuando acabe.')
                        : setShowRatingModal(true)
                    }
                    style={[styles.finalUploadBtn, { marginTop: 0, opacity: selectedMatch?.status === 'PRÓXIMO' ? 0.5 : 1 }]}
                >
                    <Text style={styles.finalUploadText}>⭐ VALORAR ESTE PARTIDO</Text>
                </TouchableOpacity>
            )}

            {/* Rating Modal */}
            <Modal visible={showRatingModal} animationType="slide" transparent>
                <View style={[styles.modalBg, { justifyContent: 'flex-end', padding: 0 }]}>
                    <View style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 35,
                        borderTopRightRadius: 35,
                        padding: 30,
                        maxHeight: '90%',
                    }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={[styles.uTitle, { fontSize: 18 }]}>VALORACIONES</Text>
                                <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                                    <X color={COLORS.textMain} size={24} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 24 }}>
                                J{selectedMatch?.id} · {selectedMatch?.homeTeam} {selectedMatch?.score} {selectedMatch?.awayTeam}
                            </Text>

                            {/* Star Inputs */}
                            <StarRating rating={matchRating} onRate={setMatchRating} label="⚽ Calidad del Partido" />
                            <StarRating rating={atmosphereRating} onRate={setAtmosphereRating} label="🔥 Ambiente del Club Local" />
                            <StarRating rating={barRating} onRate={setBarRating} label="🍺 Bar del Club Local" />
                            <StarRating rating={refereeRating} onRate={setRefereeRating} label="🟨 Actuación Arbitral" />

                            {/* Comment */}
                            <TextInput
                                style={[styles.fieldInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                                placeholder="Comentario opcional (¿algo destacable?)..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.finalUploadBtn, { marginTop: 20, opacity: isSubmitting ? 0.7 : 1 }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.finalUploadText}>
                                    {isSubmitting ? 'ENVIANDO...' : '✅ ENVIAR VALORACIÓN'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default League;
