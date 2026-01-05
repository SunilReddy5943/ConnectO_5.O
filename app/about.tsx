import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { APP_VERSION } from './config/featureFlags';

export default function AboutSupport() {
  const router = useRouter();

  const supportOptions = [
    {
      id: 'faq',
      icon: 'help-circle',
      title: 'FAQs',
      subtitle: 'Find answers to common questions',
      onPress: () => { },
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'support@connecto.app',
      onPress: () => Linking.openURL('mailto:support@connecto.app'),
    },
    {
      id: 'phone',
      icon: 'call',
      title: 'Phone Support',
      subtitle: '+91 1800-XXX-XXXX',
      onPress: () => Linking.openURL('tel:+911800XXXXXX'),
    },
    {
      id: 'feedback',
      icon: 'chatbubble-ellipses',
      title: 'Send Feedback',
      subtitle: 'Help us improve ConnectO',
      onPress: () => router.push('/feedback'),
      color: '#8B5CF6',
    },
    {
      id: 'privacy',
      icon: 'shield-checkmark',
      title: 'Privacy Policy',
      onPress: () => router.push('/privacy'),
    },
    {
      id: 'terms',
      icon: 'document-text',
      title: 'Terms of Service',
      onPress: () => router.push('/terms'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="construct" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>ConnectO</Text>
          <Text style={styles.tagline}>Local Skilled Network</Text>
          <View style={styles.versionBox}>
            <Text style={styles.versionText}>Version {APP_VERSION.VERSION}</Text>
            <Text style={styles.buildText}>Build {APP_VERSION.BUILD_NUMBER}</Text>
            <Text style={styles.buildText}>{APP_VERSION.BUILD_DATE}</Text>
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name={option.icon as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                {option.subtitle && (
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.creditsBox}>
          <Text style={styles.creditsText}>
            Made with ❤️ for connecting local skilled workers with customers
          </Text>
          <Text style={styles.copyrightText}>© 2024 ConnectO. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  versionBox: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  buildText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  creditsBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  creditsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  copyrightText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
