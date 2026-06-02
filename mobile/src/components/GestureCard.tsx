import React from 'react';
import { Pressable, View, Text, StyleSheet, Image } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { getEmoji, getGradient } from '../utils/emoji';
import type { Gesture } from '../types';

interface Props {
  gesture: Gesture;
  categoryName?: string;
  onPress: () => void;
}

const GestureCard: React.FC<Props> = ({ gesture, categoryName, onPress }) => {
  const gradient = getGradient(gesture.id);
  const emoji = getEmoji(gesture.id);
  const firstImage = gesture.media?.find(m => m.media_type === 'image');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.top, { backgroundColor: gradient[0] }]}>
        {firstImage ? (
          <Image
            source={{ uri: firstImage.file_url }}
            style={styles.topImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <View style={[styles.topOverlay, { backgroundColor: gradient[1] }]} />
            <Text style={styles.emoji}>{emoji}</Text>
          </>
        )}
      </View>
      <View style={styles.bottom}>
        {categoryName ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {categoryName}
            </Text>
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {gesture.title}
        </Text>
        {gesture.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {gesture.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 180,
  },
  pressed: { opacity: 0.85 },
  top: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  emoji: { fontSize: 40, zIndex: 1 },
  topImage: { width: '100%', height: '100%' },
  bottom: { padding: spacing.sm + 2, gap: 4 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  badgeText: { color: colors.accentLight, fontSize: 11, fontWeight: '500' },
  title: { color: colors.text, fontSize: 14, fontWeight: '600' },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 17 },
});

export default GestureCard;
