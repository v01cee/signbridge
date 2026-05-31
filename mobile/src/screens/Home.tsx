import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing } from '../theme';
import { useAuth } from '../store/auth';
import { fetchCategories } from '../api/categories';
import { fetchGestures } from '../api/gestures';
import type { Category, Gesture } from '../types';
import type { RootStackParamList } from '../navigation';

import TextField from '../components/TextField';
import CategoryChip from '../components/CategoryChip';
import GestureCard from '../components/GestureCard';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCat, setActiveCat] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data);
      } catch {
        // silently ignore categories error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadGestures = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchGestures({
        q: debouncedSearch || undefined,
        category_id: activeCat,
        limit: 100,
      });
      setGestures(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить жесты';
      setError(msg);
      setGestures([]);
    }
  }, [debouncedSearch, activeCat]);

  // Reload gestures whenever filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      await loadGestures();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadGestures]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGestures();
    setRefreshing(false);
  }, [loadGestures]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const renderItem = useCallback(
    ({ item, index }: { item: Gesture; index: number }) => {
      const catName = item.category_id ? categoriesById.get(item.category_id)?.name : undefined;
      return (
        <View
          style={[
            styles.cell,
            index % 2 === 0 ? styles.cellLeft : styles.cellRight,
          ]}
        >
          <GestureCard
            gesture={item}
            categoryName={catName}
            onPress={() => navigation.navigate('GestureDetail', { id: item.id })}
          />
        </View>
      );
    },
    [categoriesById, navigation],
  );

  const greeting = user ? `Привет, ${user.username}!` : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
        <Text style={styles.title}>Словарь жестов</Text>
        <TextField
          placeholder="Поиск жестов..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          containerStyle={styles.searchField}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <CategoryChip
            label="Все"
            active={activeCat === null}
            onPress={() => setActiveCat(null)}
          />
          {categories.map(c => (
            <CategoryChip
              key={c.id}
              label={c.name}
              active={activeCat === c.id}
              onPress={() => setActiveCat(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={gestures}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🤷"
              title={error ? 'Ошибка загрузки' : 'Жесты не найдены'}
              description={
                error ??
                (debouncedSearch || activeCat !== null
                  ? 'Попробуйте изменить поиск или фильтр'
                  : 'Здесь появятся жесты, как только они будут добавлены')
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  greeting: { color: colors.textMuted, fontSize: 13, marginBottom: 2 },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  searchField: { marginBottom: spacing.sm },
  chipsRow: { paddingVertical: spacing.xs, paddingRight: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: {
    paddingHorizontal: spacing.md - spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  cell: { flex: 1, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
  cellLeft: {},
  cellRight: {},
});

export default HomeScreen;
