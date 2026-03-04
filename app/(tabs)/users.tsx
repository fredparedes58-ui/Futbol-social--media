import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Plus, Video as VideoIcon } from 'lucide-react-native';
import { COLORS } from '../../src/constants/theme';
import { styles } from '../../src/styles/globalStyles';

export default function UsersScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>KICKBASE</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <View>
                        <Text style={styles.heroTitle}>COMMUNITY HUB</Text>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>HIGHLIGHTS MÁS BUSCADOS</Text>
                    </View>
                    <TouchableOpacity style={{ backgroundColor: COLORS.accent, padding: 10, borderRadius: 50 }}>
                        <VideoIcon color="white" size={24} />
                    </TouchableOpacity>
                </View>
                <Text style={{ color: COLORS.textSecondary, marginTop: 40, textAlign: 'center' }}>
                    Módulo de comunidad en desarrollo...
                </Text>
            </ScrollView>
        </View>
    );
}
