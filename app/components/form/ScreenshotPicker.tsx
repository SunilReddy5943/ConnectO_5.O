/**
 * ScreenshotPicker Component
 * ==========================
 * Image picker with gallery selection, preview, and remove option.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface ScreenshotPickerProps {
    value: string | null;
    onChange: (uri: string | null) => void;
    disabled?: boolean;
}

export default function ScreenshotPicker({
    value,
    onChange,
    disabled = false,
}: ScreenshotPickerProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePickImage = async () => {
        if (disabled) return;

        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library to attach screenshots.',
                    [{ text: 'OK' }]
                );
                return;
            }

            setIsLoading(true);

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets[0]) {
                onChange(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = () => {
        Alert.alert(
            'Remove Screenshot',
            'Are you sure you want to remove this screenshot?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
            ]
        );
    };

    if (value) {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>Screenshot (Optional)</Text>
                <View style={styles.previewContainer}>
                    <Image source={{ uri: value }} style={styles.preview} />
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={handleRemoveImage}
                        disabled={disabled}
                    >
                        <Ionicons name="close-circle" size={28} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Screenshot (Optional)</Text>
            <TouchableOpacity
                style={[styles.picker, disabled && styles.pickerDisabled]}
                onPress={handlePickImage}
                disabled={disabled || isLoading}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <>
                        <View style={styles.iconContainer}>
                            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.pickerTitle}>Add Screenshot</Text>
                            <Text style={styles.pickerSubtitle}>
                                Attach a screenshot to help us understand better
                            </Text>
                        </View>
                        <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.base,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        borderStyle: 'dashed',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    pickerDisabled: {
        opacity: 0.5,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    pickerTitle: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    pickerSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    previewContainer: {
        position: 'relative',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    preview: {
        width: '100%',
        height: 180,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.borderLight,
    },
    removeButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: COLORS.white,
        borderRadius: 14,
    },
});
