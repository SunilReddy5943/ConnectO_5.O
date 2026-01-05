import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '../../constants/theme';
import SearchBar from '../SearchBar';

interface SearchHeaderProps {
    query: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onVoicePress: () => void;
    isLoading: boolean;
}

export default function SearchHeader({
    query,
    onChangeText,
    onSubmit,
    onVoicePress,
    isLoading,
}: SearchHeaderProps) {
    return (
        <View style={styles.container}>
            <SearchBar
                value={query}
                onChangeText={onChangeText}
                onSubmit={onSubmit}
                onVoicePress={onVoicePress}
                isLoading={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.sm,
    },
});
