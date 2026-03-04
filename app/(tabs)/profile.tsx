import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.heroTitle}>MI PERFIL</Text>
                <Text style={{ color: COLORS.textSecondary, marginTop: 40, textAlign: 'center' }}>
                    Configuración de cuenta y estadísticas de jugador en desarrollo...
                </Text>
            </ScrollView>
        </View>
    );
}
