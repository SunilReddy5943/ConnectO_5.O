import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface WorkerProfileActionBarProps {
  price: number;
  priceLabel?: string;
  onCallPress: () => void;
  onChatPress: () => void;
  onNotifyPress: () => void;
  isCustomerMode?: boolean;
  disabled?: boolean;
}

export default function WorkerProfileActionBar({
  price,
  priceLabel = 'Starting from',
  onCallPress,
  onChatPress,
  onNotifyPress,
  isCustomerMode = true,
  disabled = false,
}: WorkerProfileActionBarProps) {
  const insets = useSafeAreaInsets();

  // Entry animation
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Button press animations
  const messageScaleAnim = useRef(new Animated.Value(1)).current;
  const notifyScaleAnim = useRef(new Animated.Value(1)).current;
  const notifyHeartbeatAnim = useRef(new Animated.Value(1)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Heartbeat animation for notify button
    Animated.loop(
      Animated.sequence([
        Animated.timing(notifyHeartbeatAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(notifyHeartbeatAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleMessagePressIn = () => {
    Animated.spring(messageScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleMessagePressOut = () => {
    Animated.spring(messageScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleNotifyPressIn = () => {
    Animated.spring(notifyScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleNotifyPressOut = () => {
    Animated.spring(notifyScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleCtaPressIn = () => {
    Animated.spring(ctaScaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleCtaPressOut = () => {
    Animated.spring(ctaScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, SPACING.md),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Price Info Section */}
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>{priceLabel}</Text>
        <Text style={styles.priceValue}>₹{price}/day</Text>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        {/* Chat Button */}
        <Animated.View style={{ transform: [{ scale: messageScaleAnim }] }}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={onChatPress}
            onPressIn={handleMessagePressIn}
            onPressOut={handleMessagePressOut}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>


        {/* Primary CTA - Call Now */}
        {isCustomerMode && (
          <Animated.View style={{ transform: [{ scale: ctaScaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                disabled && styles.ctaButtonDisabled,
              ]}
              onPress={onCallPress}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              activeOpacity={0.9}
              disabled={disabled}
            >
              <Ionicons
                name="call"
                size={16}
                color={COLORS.white}
                style={styles.ctaIcon}
              />
              <Text style={styles.ctaText}>Call Now</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Notify Button - with heartbeat animation */}
        {isCustomerMode && (
          <Animated.View style={{
            transform: [
              { scale: Animated.multiply(notifyScaleAnim, notifyHeartbeatAnim) }
            ]
          }}>
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={onNotifyPress}
              onPressIn={handleNotifyPressIn}
              onPressOut={handleNotifyPressOut}
              activeOpacity={0.85}
            >
              <Ionicons name="notifications" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  priceSection: {
    justifyContent: 'center',
    minWidth: 70,
    maxWidth: 90,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 1,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notifyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexShrink: 1,
    minWidth: 110,
    maxWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  ctaIcon: {
    marginRight: 6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});
