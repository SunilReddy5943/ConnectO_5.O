/**
 * Mode Transition Overlay
 * ========================
 * Full-screen animated transition between Customer and Worker modes.
 * Creates a premium feel with color morphing and fade effects.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModeTransitionOverlayProps {
    visible: boolean;
    targetRole: 'CUSTOMER' | 'WORKER';
    onComplete: () => void;
}

export default function ModeTransitionOverlay({
    visible,
    targetRole,
    onComplete,
}: ModeTransitionOverlayProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            rotateAnim.setValue(0);
            colorAnim.setValue(0);

            // Sequence of animations
            Animated.sequence([
                // Fade in (200ms)
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                ]),
                // Hold and morph color (500ms)
                Animated.parallel([
                    Animated.timing(colorAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),
                // Fade out (300ms)
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onComplete();
            });
        }
    }, [visible]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const gradientColors = colorAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange:
            targetRole === 'WORKER'
                ? ['rgba(30, 64, 175, 0.95)', 'rgba(249, 115, 22, 0.95)', 'rgba(234, 88, 12, 0.95)']
                : ['rgba(249, 115, 22, 0.95)', 'rgba(30, 64, 175, 0.95)', 'rgba(30, 58, 138, 0.95)'],
    });

    const iconName = targetRole === 'WORKER' ? 'construct' : 'person';
    const message = targetRole === 'WORKER' ? 'Entering Worker Mode' : 'Entering Customer Mode';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { rotate: rotation },
                            ],
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconName} size={64} color={COLORS.white} />
                    </View>
                    <Animated.Text
                        style={[
                            styles.message,
                            {
                                transform: [{ rotate: rotation }],
                            },
                        ]}
                    >
                        {message}
                    </Animated.Text>
                    <View style={styles.dotsContainer}>
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: colorAnim.interpolate({
                                        inputRange: [0, 0.3, 1],
                                        outputRange: [0.3, 1, 0.3],
                                    }),
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: colorAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.3, 1, 0.3],
                                    }),
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: colorAnim.interpolate({
                                        inputRange: [0, 0.7, 1],
                                        outputRange: [0.3, 1, 0.3],
                                    }),
                                },
                            ]}
                        />
                    </View>
                </Animated.View>

                {/* Animated background gradient */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: gradientColors,
                            zIndex: -1,
                        },
                    ]}
                />
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    message: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white,
    },
});
