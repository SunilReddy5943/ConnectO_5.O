import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, WORKER_IMAGES } from '../constants/theme';
import { DUMMY_WORKERS } from '../data/dummyWorkers';
import VerifiedBadge from '../components/VerifiedBadge';
import { isWorkerVerified } from '../data/dummyReviews';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'worker';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hello! I saw your profile and I need help with some plumbing work.',
    sender: 'user',
    timestamp: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    text: 'Hi! Thank you for reaching out. I would be happy to help. What kind of plumbing work do you need?',
    sender: 'worker',
    timestamp: '10:32 AM',
    status: 'read',
  },
  {
    id: '3',
    text: 'There is a leak under my kitchen sink. Water is dripping and I need it fixed urgently.',
    sender: 'user',
    timestamp: '10:35 AM',
    status: 'read',
  },
  {
    id: '4',
    text: 'I understand. A leaking sink can be frustrating. I can come and take a look at it. When would be a good time for you?',
    sender: 'worker',
    timestamp: '10:37 AM',
    status: 'read',
  },
  {
    id: '5',
    text: 'Can you come tomorrow morning around 10 AM?',
    sender: 'user',
    timestamp: '10:40 AM',
    status: 'delivered',
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const worker = DUMMY_WORKERS.find(w => w.id === id) || DUMMY_WORKERS[0];
  const isVerified = isWorkerVerified(worker);

  useEffect(() => {
    // Simulate worker typing indicator
    const typingTimeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Yes, 10 AM tomorrow works for me. I will be there. Please share your address.',
          sender: 'worker',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          status: 'read',
        };
        setMessages(prev => [...prev, newMessage]);
      }, 2000);
    }, 3000);

    return () => clearTimeout(typingTimeout);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m))
      );
    }, 500);

    // Simulate worker response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for the information. I will see you tomorrow!',
          sender: 'worker',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          status: 'read',
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1500);
  };

  const handleBack = () => {
    router.back();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <Image source={{ uri: worker.profile_photo_url }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.workerBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.text}</Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>{item.timestamp}</Text>
            {isUser && (
              <Ionicons
                name={item.status === 'read' ? 'checkmark-done' : item.status === 'delivered' ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.status === 'read' ? COLORS.info : COLORS.textLight}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.workerInfo} onPress={() => router.push(`/worker/${worker.id}`)}>
          <Image source={{ uri: worker.profile_photo_url }} style={styles.workerAvatar} />
          <View style={styles.workerDetails}>
            <View style={styles.workerNameRow}>
              <Text style={styles.workerName}>{worker.name}</Text>
              {isVerified && (
                <VerifiedBadge size="small" variant="minimal" />
              )}
            </View>
            <View style={styles.statusRow}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <Image source={{ uri: worker.profile_photo_url }} style={styles.messageAvatar} />
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={26} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.white : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  workerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.borderLight,
  },
  workerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  workerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: SPACING.sm,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: SPACING.base,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  workerBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  userMessageTime: {
    color: COLORS.textLight,
  },
  statusIcon: {
    marginLeft: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  attachButton: {
    padding: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.sm,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  emojiButton: {
    padding: SPACING.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
