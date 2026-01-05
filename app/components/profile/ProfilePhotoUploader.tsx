/**
 * Profile Photo Uploader
 * ======================
 * Photo selection with camera/gallery options and preview.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface ProfilePhotoUploaderProps {
    currentPhotoUrl?: string;
    onPhotoSelected: (uri: string) => void;
    size?: number;
    isLoading?: boolean;
}

export default function ProfilePhotoUploader({
    currentPhotoUrl,
    onPhotoSelected,
    size = 120,
    isLoading = false,
}: ProfilePhotoUploaderProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [localUri, setLocalUri] = useState<string | null>(null);

    const displayUri = localUri || currentPhotoUrl;

    const handleCamera = async () => {
        setShowOptions(false);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setLocalUri(result.assets[0].uri);
            onPhotoSelected(result.assets[0].uri);
        }
    };

    const handleGallery = async () => {
        setShowOptions(false);

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setLocalUri(result.assets[0].uri);
            onPhotoSelected(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.photoContainer, { width: size, height: size, borderRadius: size / 2 }]}
                onPress={() => setShowOptions(true)}
                disabled={isLoading}
            >
                {displayUri ? (
                    <Image
                        source={{ uri: displayUri }}
                        style={[styles.photo, { width: size, height: size, borderRadius: size / 2 }]}
                    />
                ) : (
                    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
                        <Ionicons name="person" size={size * 0.4} color={COLORS.textMuted} />
                    </View>
                )}

                {isLoading ? (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={COLORS.white} />
                    </View>
                ) : (
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={16} color={COLORS.white} />
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.hint}>Tap to change photo</Text>

            {/* Options Modal */}
            <Modal
                visible={showOptions}
                transparent
                animationType="fade"
                onRequestClose={() => setShowOptions(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowOptions(false)} />
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsTitle}>Change Photo</Text>

                        <TouchableOpacity style={styles.optionButton} onPress={handleCamera}>
                            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.optionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={handleGallery}>
                            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.optionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, styles.cancelButton]}
                            onPress={() => setShowOptions(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    photoContainer: {
        backgroundColor: COLORS.borderLight,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    photo: {
        backgroundColor: COLORS.borderLight,
    },
    placeholder: {
        backgroundColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    hint: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    optionsContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING['2xl'],
    },
    optionsTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        gap: SPACING.md,
    },
    optionText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    cancelButton: {
        borderBottomWidth: 0,
        marginTop: SPACING.sm,
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
});
