import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../constants/theme';

export const DynamicMediaContainer = ({ mediaUrl, metadata }) => {
    const videoRef = useRef(null);

    // Si no hay metadata, asumimos cuadrado por defecto para evitar saltos.
    const rawRatio = metadata?.aspectRatio || 1;

    // LÍMITE ANTIGRAVITY: Mínimo 0.8 (4:5) para verticales, máximo 1.77 (16:9) para horizontales
    const clampedRatio = Math.max(0.8, Math.min(rawRatio, 1.77));

    return (
        <View style={[styles.container, { aspectRatio: clampedRatio }]}>
            <Video
                ref={videoRef}
                source={{ uri: mediaUrl }}
                style={styles.mediaElement}
                useNativeControls={true} // Permitir al usuario ver a fullscreen
                resizeMode={ResizeMode.COVER} // FUNDAMENTAL para tapar huecos en los bordes
                isLooping
                shouldPlay={false} // Por defecto pausado para no consumir recursos hasta que esté en view
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: COLORS.surface, // Background oscuro mientras carga
        borderRadius: 24, // Borde moderno redondeado
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaElement: {
        width: '100%',
        height: '100%',
    }
});
