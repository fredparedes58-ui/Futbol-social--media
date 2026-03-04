import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';

export default function ChatScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.heroTitle}>CHATS DE PADRES</Text>
                <Text style={{ color: COLORS.accent, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>S. MARCELINO F.C.</Text>
                <Text style={{ color: COLORS.textSecondary, marginTop: 40, textAlign: 'center' }}>
                    Sistema de mensajería encriptado en desarrollo...
                </Text>
            </ScrollView>
        </View>
    );
}
