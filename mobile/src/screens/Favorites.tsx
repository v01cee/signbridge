import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { colors, radius, spacing } from '../theme';
import { getEmoji, getGradient } from '../utils/emoji';
import { useAuth } from '../store/auth';
import { fetchFavorites } from '../api/favorites';
import { fetchGesture } from '../api/gestures';
import type { Gesture } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

interface FavoriteEntry {
  gesture: Gesture;
}

// Inline simple card. If Agent 3 ships GestureCard, the parent can swap it later.
const InlineCard: React.FC<{ gesture: Gesture; onPress: () => void }> = ({ gesture, onPress }) => {
  const gradient = getGradient(gesture.id)[0];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.cardThumb, { backgroundColor: gradient }]}>
        <Text style={styles.cardEmoji}>{getEmoji(gesture.id)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{gesture.title}</Text>
        {gesture.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{gesture.description}</Text>
        ) : (
          <Text style={styles.cardDesc} numberOfLines={1}>ID #{gesture.id}</Text>
        )}
      </View>
    </Pressable>
  );
};

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showSpinner: boolean) => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const favs = await fetchFavorites(token);
      const gestures = await Promise.all(
        favs.map(f =>
          fetchGesture(f.gesture_id)
            .then(g => ({ gesture: g } as FavoriteEntry))
            .catch(() => null),
        ),
      );
      setEntries(gestures.filter((g): g is FavoriteEntry => g !== null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить избранное';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load(true);
  }, [load]);

  // Reload when screen regains focus (e.g. after toggling fav in detail)
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (token) load(false);
    });
    return unsub;
  }, [navigation, token, load]);

  if (!token) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Избранное" />
        <EmptyState
          icon="🔐"
          title="Войдите в аккаунт"
          description="Чтобы сохранять жесты в избранное, нужно войти."
          actionLabel="Войти"
          onAction={() => navigation.navigate('Login')}
        />
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Избранное" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (error && entries.length === 0) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Избранное" />
        <EmptyState
          icon="⚠️"
          title="Не удалось загрузить"
          description={error}
          actionLabel="Повторить"
          onAction={() => load(true)}
        />
      </ScreenContainer>
    );
  }

  if (entries.length === 0) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Избранное" />
        <EmptyState
          icon="⭐"
          title="Пока пусто"
          description="Добавляйте жесты в избранное, чтобы быстро возвращаться к ним."
          actionLabel="Перейти к словарю"
          onAction={() => navigation.navigate('Home')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <Header title="Избранное" />
      <FlatList
        data={entries}
        keyExtractor={item => String(item.gesture.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <InlineCard
            gesture={item.gesture}
            onPress={() => navigation.navigate('GestureDetail', { id: item.gesture.id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(false);
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.md, paddingTop: spacing.md, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.85 },
  cardThumb: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 40 },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.xs },
  cardDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});

export default FavoritesScreen;
