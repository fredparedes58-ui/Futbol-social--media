import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { Search, Plus } from 'lucide-react-native';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';
import League from '../../src/components/League';
import { supabase } from '../../src/services/supabaseClient';
import { useAuth } from '../../src/contexts/AuthProvider';
import { FFCV_ROSTERS } from '../../src/data/ffcvData';

export default function LeagueScreen() {
    const { session } = useAuth();
    const userId = session?.user?.id;
    const [showMisterAI, setShowMisterAI] = useState(false);
    const [leagueTab, setLeagueTab] = useState('clasificacion');
    const [selectedJornada, setSelectedJornada] = useState(15);
    const [misterMessages, setMisterMessages] = useState([
        { text: "Hola, soy El Míster AI 🤖. ¿Qué quieres analizar hoy?", sender: 'ai' }
    ]);
    const [misterInput, setMisterInput] = useState("");
    const [isGazzettaGenerating, setIsGazzettaGenerating] = useState(false);
    const [gazzettaArticle, setGazzettaArticle] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [predictionData, setPredictionData] = useState(null);
    const [showPredictor, setShowPredictor] = useState(false);
    const [selectedTeamTab, setSelectedTeamTab] = useState("C.D. SAN MARCELINO 'A'");
    const [showTactical, setShowTactical] = useState(false);
    const [squadPhotos, setSquadPhotos] = useState({});
    const [aiTacticFormat, setAiTacticFormat] = useState('1-3-3-1');
    const [toneMode, setToneMode] = useState('padres');

    const [leagueTeams, setLeagueTeams] = useState([]);
    const [squadPlayers, setSquadPlayers] = useState([]);

    // Antigravity Data Fetching (Supabase Teams)
    React.useEffect(() => {
        const fetchTeams = async () => {
            const { data, error } = await supabase.from('teams').select('*');
            if (!error && data?.length > 0) {
                const formattedTeams = data.map((team, index) => ({
                    id: team.id,
                    pos: index + 1,
                    team: team.name,
                    pj: 15, pg: Math.floor(Math.random() * 10) + 5, pts: Math.floor(Math.random() * 20) + 20
                })).sort((a, b) => b.pts - a.pts);

                formattedTeams.forEach((t, i) => t.pos = i + 1);
                setLeagueTeams(formattedTeams);

                // Set initial team if none selected
                if (!selectedTeamTab) setSelectedTeamTab(formattedTeams[0]?.team || "");
            }
        };
        fetchTeams();
    }, []);

    // Antigravity Data Fetching (Supabase Players)
    React.useEffect(() => {
        const fetchSquad = async () => {
            if (!selectedTeamTab) return;

            // First find the team ID for the selected name
            const team = leagueTeams.find(t => t.team === selectedTeamTab);
            if (!team) return;

            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('team_id', team.id);

            if (!error && data) {
                // Map to the format the League component expects (Array of Strings for now)
                const mappedRoster = data.map(p => `${p.last_name}, ${p.first_name}`);
                setSquadPlayers(mappedRoster);
            }
        };

        fetchSquad();
    }, [selectedTeamTab, leagueTeams]);

    const handleSendMisterMsg = () => {
        if (!misterInput.trim()) return;
        const userMsg = { text: misterInput, sender: 'user' };
        setMisterMessages(prev => [...prev, userMsg]);
        setMisterInput("");
        setTimeout(() => {
            setMisterMessages(prev => [...prev, { text: "El San Marcelino tiene un 65% de efectividad.", sender: 'ai' }]);
        }, 1000);
    };

    const handlePredictMatch = () => {
        setPredictionData({ win: 45, draw: 30, loss: 25, insight: "San Marcelino suele marcar temprano." });
        setShowPredictor(true);
    };

    const handleGenerateGazzetta = () => {
        setIsGazzettaGenerating(true);
        setTimeout(() => {
            setGazzettaArticle({
                user: "Míster AI",
                avatar: "https://i.pravatar.cc/150?u=ai",
                media: "https://images.unsplash.com/photo-1543351611-58f6a2ff8587?q=80&w=1000",
                content: "Crónica: Empate a 2 entre San Marcelino y Torrent..."
            });
            setIsGazzettaGenerating(false);
        }, 2000);
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

    const pickImage = async (playerName) => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
        if (!result.canceled) setSquadPhotos(prev => ({ ...prev, [playerName]: result.assets[0].uri }));
    };

    const toggleTone = () => setToneMode(prev => prev === 'padres' ? 'jugadores' : 'padres');

    return (
        <View style={styles.container}>
            {/* Header local for League */}
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.circleIcon}><Search color={COLORS.textMain} size={20} /></TouchableOpacity>
                </View>
            </View>

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
                squadPlayers={squadPlayers}
                FFCV_ROSTERS={FFCV_ROSTERS}
                supabase={supabase}
                userId={userId}
            />
        </View>
    );
}
