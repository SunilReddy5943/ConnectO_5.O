import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import Button from './components/ui/Button';
import Input from './components/ui/Input';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [locality, setLocality] = useState('Andheri West');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      updateUser({ name });
      setIsLoading(false);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => {} },
        { text: 'Gallery', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.textMuted} />
          <Text style={styles.notLoggedInTitle}>Not Logged In</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Please login to view and edit your profile
          </Text>
          <Button
            title="Login"
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editToggle}>
          <Text style={styles.editToggleText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
              <Ionicons name="camera" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            editable={isEditing}
            leftIcon="person-outline"
          />

          <View style={styles.readOnlyField}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.phoneDisplay}>
              <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
              <Text style={styles.phoneText}>{user?.phone}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          <Input
            label="Email (Optional)"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={city}
            onChangeText={setCity}
            editable={isEditing}
            leftIcon="location-outline"
          />

          <Input
            label="Locality"
            placeholder="Enter your locality"
            value={locality}
            onChangeText={setLocality}
            editable={isEditing}
            leftIcon="navigate-outline"
          />
        </View>

        {/* Account Type */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          <View style={styles.accountTypeCard}>
            <View style={[styles.accountIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons
                name={user?.activeRole === 'WORKER' ? 'construct' : 'person'}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountType}>
                {user?.activeRole === 'WORKER' ? 'Worker Account' : 'Customer Account'}
              </Text>
              <Text style={styles.accountDescription}>
                {user?.activeRole === 'WORKER'
                  ? 'You can receive work requests and showcase your skills'
                  : 'You can search for workers and post jobs'}
              </Text>
              {user?.roles && user.roles.length > 1 && (
                <Text style={styles.dualRoleText}>
                  • You also have {user.activeRole === 'WORKER' ? 'Customer' : 'Worker'} access
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveSection}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
        )}

        {/* Refer & Earn Card */}
        <TouchableOpacity 
          style={styles.referralCard}
          onPress={() => router.push('/referral' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.referralContent}>
            <View style={styles.referralText}>
              <Text style={styles.referralTitle}>Refer & Earn ₹100</Text>
              <Text style={styles.referralSubtitle}>
                Get ₹100 when your friend completes their first booking
              </Text>
              <TouchableOpacity 
                style={styles.referNowButton}
                onPress={() => router.push('/referral' as any)}
              >
                <Text style={styles.referNowText}>Refer now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.referralIcon}>
              <Ionicons name="gift" size={48} color={COLORS.secondary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
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
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  editToggle: {
    padding: SPACING.xs,
  },
  editToggleText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  photoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  formSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.base,
  },
  readOnlyField: {
    marginBottom: SPACING.base,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  phoneText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  accountSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.base,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  accountTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accountType: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  accountDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  dualRoleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    marginTop: 8,
    fontWeight: '500',
  },
  saveSection: {
    padding: SPACING.base,
    marginTop: SPACING.md,
  },
  referralCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#F3E5F5',
    ...SHADOWS.md,
  },
  referralContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralText: {
    flex: 1,
  },
  referralTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  referNowButton: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  referNowText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  referralIcon: {
    marginLeft: SPACING.md,
  },
  dangerSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
  },
  dangerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
  },
  dangerButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  notLoggedInTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  notLoggedInSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
  },
});
