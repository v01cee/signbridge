import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme';
import { getEmoji, getGradient } from '../utils/emoji';
import { useAuth } from '../store/auth';
import { fetchGesture } from '../api/gestures';
import { fetchCategories } from '../api/categories';
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { ApiError } from '../api/client';
import type { Gesture, Category } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GestureDetail'>;

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
};

const GestureDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { token } = useAuth();

  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [g, cats] = await Promise.all([fetchGesture(id), fetchCategories()]);
        if (cancelled) return;
        setGesture(g);
        setCategories(cats);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const favs = await fetchFavorites(token);
        if (cancelled) return;
        setIsFavorite(favs.some(f => f.gesture_id === id));
      } catch {
        // ignore — leave as not favorite
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const toggleFavorite = useCallback(async () => {
    if (!token || !gesture) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(gesture.id, token);
        setIsFavorite(false);
      } else {
        await addFavorite(gesture.id, token);
        setIsFavorite(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось обновить избранное';
      Alert.alert('Ошибка', msg);
    } finally {
      setFavLoading(false);
    }
  }, [token, gesture, isFavorite]);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Жест" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (notFound || !gesture) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Жест" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="🔍"
          title="Жест не найден"
          description="Возможно, он был удалён или ссылка неверна."
          actionLabel="Назад"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const category = gesture.category_id != null
    ? categories.find(c => c.id === gesture.category_id) ?? null
    : null;
  const gradientColor = getGradient(gesture.id)[0];
  const firstImage = gesture.media?.find(m => m.media_type === 'image');

  return (
    <ScreenContainer scroll scrollViewProps={{ showsVerticalScrollIndicator: false }}>
      <Header title={gesture.title} onBack={() => navigation.goBack()} />

      <View style={[styles.preview, { backgroundColor: firstImage ? colors.bgCard : gradientColor }]}>
        {firstImage ? (
          <Image
            source={{ uri: firstImage.file_url }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.previewEmoji}>{getEmoji(gesture.id)}</Text>
        )}
      </View>

      {category ? (
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{category.name}</Text>
          </View>
        </View>
      ) : null}

      {gesture.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>Описание</Text>
          <Text style={styles.descriptionText}>{gesture.description}</Text>
        </View>
      ) : null}

      {token ? (
        <View style={styles.favWrap}>
          <PrimaryButton
            title={isFavorite ? '★ Убрать из избранного' : '★ В избранное'}
            onPress={toggleFavorite}
            loading={favLoading}
            variant={isFavorite ? 'outline' : 'primary'}
          />
        </View>
      ) : null}

      <View style={styles.metaBox}>
        <Text style={styles.metaItem}>Создан: {formatDate(gesture.created_at)}</Text>
        <Text style={styles.metaItem}>ID: #{gesture.id}</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: {
    height: 240,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  previewEmoji: { fontSize: 96 },
  previewImage: { width: '100%', height: '100%', borderRadius: radius.lg },
  badgeRow: { flexDirection: 'row', marginBottom: spacing.md },
  badge: {
    backgroundColor: colors.bgCard,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  badgeText: { color: colors.accentLight, fontSize: 13, fontWeight: '600' },
  descriptionBox: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  descriptionText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  favWrap: { marginBottom: spacing.lg },
  metaBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  metaItem: { color: colors.textMuted, fontSize: 13 },
});

export default GestureDetailScreen;
