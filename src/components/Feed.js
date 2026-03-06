import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import {
    Rocket,
    MessageSquare,
    Plus,
    Share2,
    TrendingUp,
    MoreHorizontal,
} from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../constants/theme';
import { styles } from '../styles/globalStyles';
import { DynamicMediaContainer } from './DynamicMediaContainer';

export const PunchedCard = ({ children, style, borderColor = COLORS.accent }) => (
    <View style={[styles.punchedCard, { borderColor: borderColor + '40' }, style]}>
        {children}
    </View>
);

export const ActionButton = ({ children, onPress, color = COLORS.accent }) => (
    <TouchableOpacity onPress={onPress} style={[styles.actionBtn, { backgroundColor: color + '10', borderColor: color + '30' }]}>
        {children}
    </TouchableOpacity>
);

const Feed = ({
    visibility,
    setVisibility,
    myStoryImage,
    handlePickStoryImage,
    setSelectedStory,
    feedPosts,
    feedInteractions,
    setFeedInteractions,
    postComments,
    setActiveCommentPostId,
    setShowCommentModal,
    setActiveSharePostId,
    setShowShareModal,
    setActiveOptionsPostId,
    setShowPostOptionsModal,
}) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
            {/* ADN Stories */}
            <View style={styles.highlightsContainer}>
                <View style={styles.visibilityToggle}>
                    <TouchableOpacity onPress={() => setVisibility('global')} style={[styles.vBtn, visibility === 'global' && styles.vBtnActive]}>
                        <Text style={[styles.vText, visibility === 'global' && { color: 'white' }]}>GLOBAL LIGA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setVisibility('team')} style={[styles.vBtn, visibility === 'team' && styles.vBtnActive]}>
                        <Text style={[styles.vText, visibility === 'team' && { color: 'white' }]}>PADRES S. MARCELINO</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    <TouchableOpacity style={styles.adnItem} onPress={handlePickStoryImage}>
                        <View style={styles.hexContainer}>
                            <View style={[styles.hexagon, { backgroundColor: COLORS.accent + '20', borderColor: myStoryImage ? COLORS.neonPurple : COLORS.accent }]}>
                                {myStoryImage ? (
                                    <Image source={{ uri: myStoryImage }} style={styles.hexImage} />
                                ) : (
                                    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={{ uri: 'https://i.pravatar.cc/150?u=admin' }} style={[styles.hexImage, { opacity: 0.8 }]} />
                                        <View style={{ position: 'absolute', transform: [{ rotate: '-45deg' }], backgroundColor: COLORS.accent, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 3 }}>
                                            <Plus size={14} color="white" />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text style={styles.orbitLabel}>MI HIJO</Text>
                    </TouchableOpacity>
                    {[1, 2, 3, 4, 5].map(i => (
                        <TouchableOpacity key={i} style={styles.adnItem} onPress={() => setSelectedStory(`PRO ${i}`)}>
                            <View style={styles.hexContainer}>
                                <View style={[styles.hexagon, { borderColor: i % 2 === 0 ? COLORS.neonPurple : COLORS.accent }]}>
                                    <Image source={{ uri: `https://i.pravatar.cc/150?u=h${i + 10}` }} style={styles.hexImage} />
                                </View>
                            </View>
                            <Text style={styles.orbitLabel}>PRO {i}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.feedScroll}>
                <Text style={styles.feedContextTitle}>
                    {visibility === 'global' ? 'RETR TRANSMISIÓN GLOBAL' : 'MURO DE PADRES: SAN MARCELINO'}
                </Text>
                {feedPosts?.map((post) => (
                    <PunchedCard key={post.id} style={styles.entryCard} borderColor={COLORS.accent}>
                        <View style={styles.entryHeader}>
                            <View style={styles.authorRow}>
                                <Image source={{ uri: post.authorId === 'me' ? 'https://i.pravatar.cc/150?u=admin' : `https://i.pravatar.cc/150?u=${post.authorId}` }} style={styles.authorSmall} />
                                <View>
                                    <Text style={styles.authorName}>{post.authorName}</Text>
                                    <Text style={styles.authorMeta}>{post.timeText}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => {
                                setActiveOptionsPostId(post.id);
                                setShowPostOptionsModal(true);
                            }}>
                                <MoreHorizontal color={COLORS.textSecondary} size={20} />
                            </TouchableOpacity>
                        </View>

                        {post.type === 'rating' ? (
                            // ⭐ Special card for match reviews
                            <View style={{
                                backgroundColor: COLORS.textMain,
                                borderRadius: 20,
                                padding: 18,
                                marginBottom: 4,
                            }}>
                                {/* Match Header */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Text style={{ color: COLORS.neonGold, fontFamily: 'Oswald_700Bold', fontSize: 13, letterSpacing: 1 }}>
                                        ⭐ VALORACIÓN J{post.metadata?.jornada}
                                    </Text>
                                    <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 12 }}>
                                        {post.metadata?.avg_rating}/5
                                    </Text>
                                </View>
                                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 14, marginBottom: 16 }}>
                                    {post.metadata?.homeTeam}  {post.metadata?.score}  {post.metadata?.awayTeam}
                                </Text>
                                {/* Rating rows */}
                                {[
                                    { label: 'Partido', emoji: '⚽', val: post.metadata?.match_rating },
                                    { label: 'Ambiente', emoji: '🔥', val: post.metadata?.atmosphere_rating },
                                    { label: 'Bar', emoji: '🍺', val: post.metadata?.bar_rating },
                                    { label: 'Arbitraje', emoji: '🟨', val: post.metadata?.referee_rating },
                                ].map(({ label, emoji, val }) => (
                                    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, width: 80 }}>{emoji} {label}</Text>
                                        <View style={{ flexDirection: 'row', gap: 3 }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Text key={i} style={{ color: i <= (val || 0) ? COLORS.neonGold : 'rgba(255,255,255,0.2)', fontSize: 16 }}>★</Text>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : post.type === 'video' ? (
                            <DynamicMediaContainer mediaUrl={post.imageUrl} metadata={post.metadata} />
                        ) : (
                            <View style={[
                                styles.mediaFrame,
                                post.format === 'vertical' && { height: 500 }
                            ]}>
                                {post.imageUrl ? (
                                    <Image source={{ uri: post.imageUrl }} style={styles.fullImage} />
                                ) : (
                                    <View style={[styles.fullImage, { backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Plus color={COLORS.textSecondary} size={40} />
                                    </View>
                                )}
                                <View style={styles.mediaOverlay}>
                                    <View style={styles.tagBadge}>
                                        <TrendingUp size={12} color="white" />
                                        <Text style={styles.tagText}>TOP POST</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.entryFooter}>
                            <Text style={styles.entryText}>{post.description}</Text>

                            <View style={styles.interactionRow}>
                                <ActionButton
                                    color={feedInteractions[post.id]?.hasLiked ? COLORS.accent : COLORS.neonPurple}
                                    onPress={() => setFeedInteractions(prev => ({
                                        ...prev,
                                        [post.id]: {
                                            ...prev[post.id],
                                            hasLiked: !prev[post.id]?.hasLiked,
                                            likes: prev[post.id]?.hasLiked ? Math.max(0, (prev[post.id]?.likes || 0) - 1) : (prev[post.id]?.likes || 0) + 1
                                        }
                                    }))}
                                >
                                    <Rocket color={feedInteractions[post.id]?.hasLiked ? COLORS.accent : COLORS.neonPurple} size={20} />
                                    <Text style={[styles.interText, { color: feedInteractions[post.id]?.hasLiked ? COLORS.accent : COLORS.neonPurple }]}>
                                        {feedInteractions[post.id]?.likes || 0}
                                    </Text>
                                </ActionButton>

                                <ActionButton
                                    onPress={() => {
                                        setActiveCommentPostId(post.id);
                                        setShowCommentModal(true);
                                    }}
                                >
                                    <MessageSquare color={COLORS.accent} size={20} />
                                    <Text style={[styles.interText, { color: COLORS.accent }]}>{postComments[post.id] ? postComments[post.id].length : 0}</Text>
                                </ActionButton>

                                <TouchableOpacity
                                    style={[styles.shareBtn, feedInteractions[post.id]?.shared && { backgroundColor: COLORS.neonLime }]}
                                    onPress={() => {
                                        setActiveSharePostId(post.id);
                                        setShowShareModal(true);
                                    }}
                                >
                                    <Share2 color={feedInteractions[post.id]?.shared ? 'white' : COLORS.textSecondary} size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </PunchedCard>
                ))}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

export default Feed;
