import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Search, Plus } from 'lucide-react-native';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';
import Feed from '../../src/components/Feed';
import { supabase } from '../../src/services/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useAuth } from '../../src/contexts/AuthProvider';

export default function FeedScreen() {
    const [visibility, setVisibility] = useState('global');
    const [selectedStory, setSelectedStory] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [myStoryImage, setMyStoryImage] = useState(null);
    const [uploadImageUri, setUploadImageUri] = useState(null);
    const [uploadMediaType, setUploadMediaType] = useState('image');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadMetadata, setUploadMetadata] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { session } = useAuth();

    const [feedInteractions, setFeedInteractions] = useState({
        1: { likes: 342, comments: 56, hasLiked: false, shared: false },
        2: { likes: 128, comments: 14, hasLiked: false, shared: false }
    });

    const [feedPosts, setFeedPosts] = useState([]);

    const [postComments, setPostComments] = useState({
        1: [{ id: 1, author: "Entrenador Luis", text: "¡Buena presión!", time: "hace 5m", avatar: "https://i.pravatar.cc/150?u=luis" }],
    });

    // Antigravity Data Fetching (Supabase Posts)
    React.useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id, content, media_url, media_type, media_metadata, created_at,
                    profiles(id, username, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const formattedPosts = data.map(post => {
                    // Supabase returns an array if foreign key isn't unique, but we know it's a 1-to-many relationship where profiles goes to 1 user.
                    const profileData = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                    return {
                        id: post.id,
                        authorId: profileData?.id,
                        authorName: profileData?.username || 'Usuario Desconocido',
                        timeText: new Date(post.created_at).toLocaleDateString(), // ToDo: implement date-fns timeAgo
                        description: post.content,
                        imageUrl: post.media_url,
                        type: post.media_type,
                        format: post.media_metadata?.orientation || 'square',
                        metadata: post.media_metadata
                    };
                });
                setFeedPosts(formattedPosts.length > 0 ? formattedPosts : fallbackPosts);
            } else {
                setFeedPosts(fallbackPosts);
            }
        };

        fetchPosts();
    }, []);

    const fallbackPosts = [
        {
            id: 'fallback-1',
            authorName: 'C.D. San Marcelino Oficial',
            timeText: 'hace 2h',
            description: '¡Victoria importante en casa! 3 puntos de oro. 💙🤍',
            imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop',
            type: 'image'
        }
    ];

    // Social UI states
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [activeSharePostId, setActiveSharePostId] = useState(null);
    const [showPostOptionsModal, setShowPostOptionsModal] = useState(false);
    const [activeOptionsPostId, setActiveOptionsPostId] = useState(null);

    const handlePickStoryImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
        });
        if (!result.canceled) setMyStoryImage(result.assets[0].uri);
    };

    const handlePickPostImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            const aspectRatio = asset.width / asset.height;

            let detectedOrientation = 'square';
            if (aspectRatio > 1.1) detectedOrientation = 'horizontal';
            else if (aspectRatio < 0.9) detectedOrientation = 'vertical';

            setUploadImageUri(asset.uri);
            setUploadMediaType(asset.type === 'video' ? 'video' : 'image');
            setUploadMetadata({
                width: asset.width,
                height: asset.height,
                aspectRatio: aspectRatio,
                orientation: detectedOrientation
            });
        }
    };

    const handlePublishPost = async () => {
        if (!uploadImageUri) return;

        const user = session?.user;
        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        setIsUploading(true);

        try {
            // 1. Prepare File for Upload
            const ext = uploadImageUri.substring(uploadImageUri.lastIndexOf('.') + 1);
            const fileName = `${user.id}/${Date.now()}.${ext}`;
            const contentType = uploadMediaType === 'video' ? `video/${ext}` : `image/${ext}`;

            // Read as base64 and decode to ArrayBuffer for Supabase Storage
            const base64 = await FileSystem.readAsStringAsync(uploadImageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const arrayBuffer = decode(base64);

            // 2. Upload to Supabase Storage (Assumes 'posts' bucket exists)
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('posts')
                .upload(fileName, arrayBuffer, { contentType });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('posts')
                .getPublicUrl(fileName);

            // 4. Insert Object to 'posts' table
            const { data: insertData, error: insertError } = await supabase
                .from('posts')
                .insert([{
                    author_id: user.id,
                    content: uploadDescription,
                    media_url: publicUrl,
                    media_type: uploadMediaType,
                    media_metadata: uploadMetadata
                }])
                .select(`
                    id, content, media_url, media_type, media_metadata, created_at,
                    profiles(id, username, avatar_url)
                `)
                .single();

            if (insertError) throw insertError;

            // 5. Optimistic UI Update from the DB response
            const profileData = Array.isArray(insertData.profiles) ? insertData.profiles[0] : insertData.profiles;

            const newPost = {
                id: insertData.id,
                authorId: profileData?.id,
                authorName: profileData?.username || 'Usuario Actual',
                timeText: 'justo ahora',
                description: insertData.content,
                imageUrl: insertData.media_url,
                type: insertData.media_type,
                format: insertData.media_metadata?.orientation || 'square',
                metadata: insertData.media_metadata
            };

            setFeedPosts([newPost, ...feedPosts]);
            setShowUpload(false);
            setUploadImageUri(null);
            setUploadDescription('');
            setUploadMetadata(null);

        } catch (error) {
            console.error("Error al publicar:", error);
            alert("Hubo un error al subir tu publicación.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header local for the Feed */}
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.circleIcon}><Search color={COLORS.textMain} size={20} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowUpload(true)} style={[styles.circleIcon, { backgroundColor: COLORS.accent }]}>
                        <Plus color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

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

            {/* Modal de Subida de Post Antigravity */}
            <Modal visible={showUpload} animationType="fade" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={styles.uploadCard}>
                        <View style={styles.uHeader}>
                            <Text style={styles.uTitle}>SUBIR MOMENTO</Text>
                            <TouchableOpacity onPress={() => setShowUpload(false)}>
                                <X color={COLORS.textMain} size={24} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.selectZone} onPress={handlePickPostImage}>
                            {uploadImageUri ? (
                                <Image source={{ uri: uploadImageUri }} style={{ width: '100%', height: '100%', borderRadius: 15 }} />
                            ) : (
                                <Plus color={COLORS.accent} size={40} />
                            )}
                        </TouchableOpacity>
                        <TextInput
                            style={styles.fieldInput}
                            placeholder="Descripción..."
                            value={uploadDescription}
                            onChangeText={setUploadDescription}
                        />
                        <TouchableOpacity
                            style={[styles.finalUploadBtn, isUploading && { opacity: 0.7 }]}
                            onPress={handlePublishPost}
                            disabled={isUploading}
                        >
                            <Text style={styles.finalUploadText}>
                                {isUploading ? 'SUDIENDO...' : 'PUBLICAR AHORA'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
