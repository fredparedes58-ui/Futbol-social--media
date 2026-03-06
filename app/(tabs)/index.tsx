import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { X, Search, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';
import Feed from '../../src/components/Feed';
import { supabase } from '../../src/services/supabaseClient';
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
    const [uploadProgress, setUploadProgress] = useState(0);

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
                    const profileData = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                    return {
                        id: post.id,
                        authorId: profileData?.id,
                        authorName: profileData?.username || 'Usuario Desconocido',
                        timeText: new Date(post.created_at).toLocaleDateString(),
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
                orientation: detectedOrientation,
                size: asset.fileSize // expo-image-picker includes this
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
        setUploadProgress(0);

        try {
            console.log("Iniciando publicación optimizada (TUS)...", { uploadMediaType, uploadImageUri });

            // 1. Prepare File for Upload using Blobs
            console.log("1. Creando Blob del archivo...");
            const response = await fetch(uploadImageUri);
            if (!response.ok) throw new Error("No se pudo leer el archivo local.");

            const blob = await response.blob();
            console.log("Blob creado satisfactoriamente. Tamaño:", blob.size, "bytes");

            // Límite aumentado a 500MB para videos largos (Requiere Supabase Pro o similar)
            if (blob.size > 500 * 1024 * 1024) {
                throw new Error("El video es demasiado grande (máximo 500MB).");
            }

            if (blob.size > 48 * 1024 * 1024) {
                console.warn("⚠️ ALERTA: Este video pesa más de 50MB. Si no has subido el límite en Supabase, la subida fallará.");
            }

            const ext = uploadImageUri.substring(uploadImageUri.lastIndexOf('.') + 1) || 'mp4';
            const fileName = `${user.id}/${Date.now()}.${ext}`;
            const contentType = uploadMediaType === 'video' ? `video/${ext}` : `image/${ext}`;

            // 2. Upload to Supabase Storage with RESUMABLE (TUS)
            console.log("2. Subiendo a Supabase Storage con TUS...", fileName);

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('posts')
                .upload(fileName, blob, {
                    contentType,
                    upsert: true,
                    // @ts-ignore
                    resumable: true,
                    // @ts-ignore
                    onUploadProgress: (progress) => {
                        const percentage = (progress.loaded / progress.total) * 100;
                        setUploadProgress(Math.round(percentage));
                        console.log(`Progreso real: ${Math.round(percentage)}%`);
                    }
                });

            if (uploadError) {
                console.error("Error detallado en Storage Upload:", uploadError);
                throw new Error(`Fallo en el servidor de archivos (Storage): ${uploadError.message}`);
            }

            setUploadProgress(100);
            console.log("Subida a Storage exitosa:", uploadData);

            // 3. Get Public URL
            console.log("3. Obteniendo URL pública...");
            const { data: publicURLRes } = supabase
                .storage
                .from('posts')
                .getPublicUrl(fileName);

            const publicUrl = publicURLRes?.publicUrl;
            if (!publicUrl) throw new Error("No se pudo generar la URL pública del video.");
            console.log("URL Pública generada:", publicUrl);

            // 4. Insert Object to 'posts' table
            console.log("4. Insertando registro en tabla 'posts'...");
            const postObject = {
                author_id: user.id,
                content: uploadDescription || "",
                media_url: publicUrl,
                media_type: uploadMediaType,
                media_metadata: uploadMetadata || {}
            };
            console.log("Datos del post a insertar:", postObject);

            const { data: insertData, error: insertError } = await supabase
                .from('posts')
                .insert([postObject])
                .select(`
                    id, content, media_url, media_type, media_metadata, created_at,
                    profiles(id, username, avatar_url)
                `)
                .single();

            if (insertError) {
                console.error("Error detallado en Insert Database:", insertError);
                throw new Error(`Fallo al guardar la publicación (DB): ${insertError.message}`);
            }
            console.log("Inserción en DB exitosa:", insertData);

            // 5. Optimistic UI Update
            console.log("5. Actualizando UI de forma optimista...");
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
            setUploadProgress(0);

        } catch (error: any) {
            setUploadProgress(0);
            console.error("Error al publicar:", error);
            alert("Hubo un error al subir tu publicación: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
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
                                <View style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                                    {uploadMediaType === 'video' ? (
                                        <Video
                                            source={{ uri: uploadImageUri }}
                                            style={{ width: '100%', height: '100%' }}
                                            useNativeControls
                                            resizeMode={ResizeMode.CONTAIN}
                                            shouldPlay
                                            isLooping
                                        />
                                    ) : (
                                        <Image source={{ uri: uploadImageUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                                    )}
                                    {isUploading && (
                                        <View style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
                                        }}>
                                            <ActivityIndicator color="white" size="large" />
                                            <Text style={{ color: 'white', marginTop: 10, fontWeight: 'bold' }}>SUBIENDO MOMENTO...</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <Plus color={COLORS.accent} size={40} />
                            )}
                        </TouchableOpacity>

                        {uploadImageUri && !isUploading && uploadMetadata?.size > 48 * 1024 * 1024 && (
                            <View style={{ backgroundColor: '#FFFBEB', padding: 10, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: '#FEF3C7' }}>
                                <Text style={{ color: '#92400E', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>
                                    ⚠️ ARCHIVO GRANDE: Asegúrate que Supabase acepte más de 50MB o la subida fallará.
                                </Text>
                            </View>
                        )}

                        {isUploading && (
                            <View>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{uploadProgress}% COMPLETADO</Text>
                            </View>
                        )}

                        <TextInput
                            style={styles.fieldInput}
                            placeholder="Descripción..."
                            value={uploadDescription}
                            onChangeText={setUploadDescription}
                        />
                        <TouchableOpacity
                            style={[styles.finalUploadBtn, (isUploading || !uploadImageUri) && { opacity: 0.7 }]}
                            onPress={handlePublishPost}
                            disabled={isUploading || !uploadImageUri}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.finalUploadText}>PUBLICAR AHORA</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
