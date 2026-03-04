import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Animated,
  Share,
  ActivityIndicator
} from 'react-native';
import {
  Rocket,
  MessageSquare,
  Plus,
  Search,
  Home,
  Users,
  Zap,
  User,
  MoreHorizontal,
  Share2,
  Trophy,
  Calendar,
  BarChart2,
  Send,
  X,
  TrendingUp,
  ChevronRight,
  Bookmark,
  Flag,
  EyeOff,
  UserMinus,
  Smile,
  Video as VideoIcon
} from 'lucide-react-native';
import { useFonts, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './src/services/supabase';
import { Video, ResizeMode } from 'expo-av';
import { FFCV_TEAMS, FFCV_ROSTERS } from './src/data/ffcvData';

import { COLORS } from './src/constants/theme';
import { styles } from './src/styles/globalStyles';
import Feed from './src/components/Feed';
import League from './src/components/League';

const { width, height } = Dimensions.get('window');

export default function App() {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('feed');
  const [showUpload, setShowUpload] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [showTactical, setShowTactical] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [visibility, setVisibility] = useState('global');
  const [fadeAnim] = useState(new Animated.Value(0));

  // --- FEED STATES ---
  const [feedInteractions, setFeedInteractions] = useState({
    1: { likes: 342, comments: 56, hasLiked: false, shared: false },
    2: { likes: 128, comments: 14, hasLiked: false, shared: false }
  });

  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      authorId: 'admin',
      authorName: 'C.D. San Marcelino Oficial',
      timeText: 'hace 2h',
      description: '¡Victoria importante en casa! 3 puntos de oro. 💙🤍',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop',
      type: 'image'
    },
    {
      id: 2,
      authorId: 'user2',
      authorName: 'Padre de Lucas',
      timeText: 'hace 5h',
      description: '¡Vaya paradón de nuestro portero en la segunda parte! 🧤⚽️',
      imageUrl: null,
      type: 'image'
    }
  ]);
  const [uploadImageUri, setUploadImageUri] = useState(null);
  const [uploadMediaType, setUploadMediaType] = useState('image');
  const [uploadFormat, setUploadFormat] = useState('horizontal');
  const [uploadDescription, setUploadDescription] = useState("");

  // --- LEAGUE & AI STATES ---
  const [leagueTab, setLeagueTab] = useState('clasificacion');
  const [selectedJornada, setSelectedJornada] = useState(15);
  const [selectedTeamTab, setSelectedTeamTab] = useState("C.D. SAN MARCELINO 'A'");
  const [squadPhotos, setSquadPhotos] = useState({});
  const [showMisterAI, setShowMisterAI] = useState(false);
  const [misterMessages, setMisterMessages] = useState([
    { text: "Hola, soy El Míster AI 🤖. Conozco todos los datos de la FFCV Grupo IV. ¿Qué quieres analizar hoy?", sender: 'ai' }
  ]);
  const [misterInput, setMisterInput] = useState("");
  const [isGazzettaGenerating, setIsGazzettaGenerating] = useState(false);
  const [gazzettaArticle, setGazzettaArticle] = useState(null);
  const [showPredictor, setShowPredictor] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [narratorText, setNarratorText] = useState("El C.D. San Marcelino 'A' ha sellado un empate vibrante (2-2) frente al F.B.U.E. Atlètic Amistat.");
  const [isScanningTactic, setIsScanningTactic] = useState(false);
  const [aiTacticFormat, setAiTacticFormat] = useState('1-3-3-1');
  const [toneMode, setToneMode] = useState('padres');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [leagueTeams, setLeagueTeams] = useState([
    { pos: 1, team: "SAN MARCELINO 'A'", pj: 15, pg: 12, pts: 38 },
    { pos: 2, team: "TORRENT CF 'A'", pj: 15, pg: 10, pts: 32 },
    { pos: 3, team: "FUNDACIÓ VCF 'A'", pj: 15, pg: 9, pts: 29 },
    { pos: 4, team: "U.D. ALZIRA 'A'", pj: 15, pg: 8, pts: 26 },
  ]);

  // --- SOCIAL STATES ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSharePostId, setActiveSharePostId] = useState(null);
  const [showPostOptionsModal, setShowPostOptionsModal] = useState(false);
  const [activeOptionsPostId, setActiveOptionsPostId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [postComments, setPostComments] = useState({
    1: [
      { id: 1, author: "Entrenador Luis", text: "¡Buena presión en bloque alto, chicos!", time: "hace 5m", avatar: "https://i.pravatar.cc/150?u=luis" },
    ],
  });
  const [myStoryImage, setMyStoryImage] = useState(null);

  // --- LOGIC FUNCTIONS ---
  const handleSendMisterMsg = () => {
    if (!misterInput.trim()) return;
    const userMsg = { text: misterInput, sender: 'user' };
    setMisterMessages(prev => [...prev, userMsg]);
    setMisterInput("");
    setTimeout(() => {
      const aiMsg = { text: "Analizando datos de la FFCV... Veo que el San Marcelino tiene un 65% de efectividad en pases cortos.", sender: 'ai' };
      setMisterMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handlePredictMatch = () => {
    setPredictionData({
      win: 45, draw: 30, loss: 25,
      insight: "San Marcelino suele marcar en el primer tiempo."
    });
    setShowPredictor(true);
  };

  const handleGenerateGazzetta = () => {
    setIsGazzettaGenerating(true);
    setTimeout(() => {
      setGazzettaArticle({
        user: "Míster AI",
        avatar: "https://i.pravatar.cc/150?u=ai",
        media: "https://images.unsplash.com/photo-1543351611-58f6a2ff8587?q=80&w=1000",
        content: "Crónica de la Jornada: Empate a 2 entre San Marcelino y Torrent. Jaider fue el MVP..."
      });
      setIsGazzettaGenerating(false);
    }, 2000);
  };

  const scanTacticPhoto = () => {
    setIsScanningTactic(true);
    setTimeout(() => {
      setAiTacticFormat(prev => prev === '1-3-3-1' ? '1-4-3-3' : '1-3-3-1');
      setIsScanningTactic(false);
    }, 2000);
  };

  const pickVideoHighlight = async () => {
    setIsUploadingVideo(true);
    setTimeout(() => setIsUploadingVideo(false), 2000);
  };

  const handlePickPostImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploadImageUri(result.assets[0].uri);
      setUploadMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const handlePublishPost = () => {
    if (!uploadImageUri) return;
    const newPost = {
      id: Date.now(),
      authorId: 'me',
      authorName: 'Usuario Actual',
      timeText: 'justo ahora',
      description: uploadDescription,
      imageUrl: uploadImageUri,
      type: uploadMediaType,
      format: uploadFormat,
    };
    setFeedPosts([newPost, ...feedPosts]);
    setShowUpload(false);
    setUploadImageUri(null);
    setUploadDescription("");
  };

  const pickImage = async (playerName) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setSquadPhotos(prev => ({ ...prev, [playerName]: result.assets[0].uri }));
    }
  };

  const handlePickStoryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled) {
      setMyStoryImage(result.assets[0].uri);
    }
  };

  const handleNarrateGazzetta = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, { onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
    }
  };

  const toggleTone = () => setToneMode(prev => prev === 'padres' ? 'jugadores' : 'padres');

  // --- FONTS ---
  let [fontsLoaded] = useFonts({
    Oswald_700Bold,
    Roboto_400Regular,
    Roboto_700Bold,
  });

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  }

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>KICKBASE</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.circleIcon}><Search color={COLORS.textMain} size={20} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setShowUpload(true)} style={[styles.circleIcon, { backgroundColor: COLORS.accent }]}>
            <Plus color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {activeTab === 'feed' && (
          <Feed
            visibility={visibility}
            setVisibility={setVisibility}
            myStoryImage={myStoryImage}
            handlePickStoryImage={handlePickStoryImage}
            setSelectedStory={setSelectedStory}
            feedPosts={feedPosts}
            feedInteractions={feedInteractions}
            setFeedInteractions={setFeedInteractions}
            postComments={postComments}
            setActiveCommentPostId={setActiveCommentPostId}
            setShowCommentModal={setShowCommentModal}
            setActiveSharePostId={setActiveSharePostId}
            setShowShareModal={setShowShareModal}
            setActiveOptionsPostId={setActiveOptionsPostId}
            setShowPostOptionsModal={setShowPostOptionsModal}
          />
        )}
        {activeTab === 'league' && (
          <League
            showMisterAI={showMisterAI}
            setShowMisterAI={setShowMisterAI}
            misterMessages={misterMessages}
            misterInput={misterInput}
            setMisterInput={setMisterInput}
            handleSendMisterMsg={handleSendMisterMsg}
            leagueTab={leagueTab}
            setLeagueTab={setLeagueTab}
            selectedJornada={selectedJornada}
            setSelectedJornada={setSelectedJornada}
            handlePredictMatch={handlePredictMatch}
            handleGenerateGazzetta={handleGenerateGazzetta}
            toggleTone={toggleTone}
            gazzettaArticle={gazzettaArticle}
            handleNarrateGazzetta={handleNarrateGazzetta}
            isSpeaking={isSpeaking}
            leagueTeams={leagueTeams}
            isGazzettaGenerating={isGazzettaGenerating}
            selectedTeamTab={selectedTeamTab}
            setSelectedTeamTab={setSelectedTeamTab}
            setShowTactical={setShowTactical}
            pickImage={pickImage}
            squadPhotos={squadPhotos}
            FFCV_ROSTERS={FFCV_ROSTERS}
          />
        )}
        {activeTab === 'chat' && (
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={styles.heroTitle}>CHATS DE PADRES</Text>
            <Text style={styles.chatContext}>SAN MARCELINO F.C. • COMUNIDAD</Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 20 }}>Módulo de Chat en construcción...</Text>
          </View>
        )}
        {activeTab === 'users' && (
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={styles.heroTitle}>COMUNIDAD</Text>
            <Text style={styles.subtext}>HIGHLIGHTS Y CRÓNICAS</Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 20 }}>Módulo de comunidad en construcción...</Text>
          </View>
        )}
        {activeTab === 'profile' && <View style={styles.placeholder}><Text style={styles.placeholderText}>MI PERFIL</Text></View>}
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navWrapper}>
        <View style={styles.navMain}>
          <TouchableOpacity onPress={() => setActiveTab('feed')} style={styles.navItem}>
            <Home color={activeTab === 'feed' ? COLORS.accent : COLORS.textSecondary} size={24} />
            {activeTab === 'feed' && <View style={styles.navDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('users')} style={styles.navItem}>
            <Users color={activeTab === 'users' ? COLORS.accent : COLORS.textSecondary} size={24} />
            {activeTab === 'users' && <View style={styles.navDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('league')} style={styles.zapMain}>
            <View style={[styles.zapInner, { backgroundColor: activeTab === 'league' ? COLORS.accent : COLORS.textMain }]}>
              <Zap color="white" size={28} fill="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('chat')} style={styles.navItem}>
            <MessageSquare color={activeTab === 'chat' ? COLORS.accent : COLORS.textSecondary} size={24} />
            {activeTab === 'chat' && <View style={styles.navDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navItem}>
            <User color={activeTab === 'profile' ? COLORS.accent : COLORS.textSecondary} size={24} />
            {activeTab === 'profile' && <View style={styles.navDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Modals */}
      <Modal visible={showUpload} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.uploadCard}>
            <View style={styles.uHeader}>
              <Text style={styles.uTitle}>SUBIR MOMENTO</Text>
              <TouchableOpacity onPress={() => setShowUpload(false)}><X color={COLORS.textMain} size={24} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.selectZone} onPress={handlePickPostImage}>
              {uploadImageUri ? <Image source={{ uri: uploadImageUri }} style={{ width: '100%', height: '100%', borderRadius: 15 }} /> : <Plus color={COLORS.accent} size={40} />}
            </TouchableOpacity>
            <TextInput style={styles.fieldInput} placeholder="Descripción..." value={uploadDescription} onChangeText={setUploadDescription} />
            <TouchableOpacity style={styles.finalUploadBtn} onPress={handlePublishPost}>
              <Text style={styles.finalUploadText}>PUBLICAR AHORA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
