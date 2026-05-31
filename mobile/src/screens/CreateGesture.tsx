import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../store/auth';
import { apiJson, ApiError } from '../api/client';
import { fetchCategories } from '../api/categories';
import type { Category, Gesture } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  navigation: any;
}

const CreateGesture: React.FC<Props> = ({ navigation }) => {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      setLoadingCats(true);
      try {
        const cats = await fetchCategories();
        if (mounted) setCategories(cats);
      } catch (e) {
        if (mounted) {
          const msg = e instanceof ApiError ? e.message : 'Не удалось загрузить категории';
          setError(msg);
        }
      } finally {
        if (mounted) setLoadingCats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (!token) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Добавить жест" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="🔒"
          title="Нужна авторизация"
          description="Войдите в аккаунт, чтобы добавлять новые жесты"
          actionLabel="Войти"
          onAction={() => navigation.navigate('Login')}
        />
      </ScreenContainer>
    );
  }

  const submit = async () => {
    setError(null);
    setTitleError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Введите название жеста');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim() ? description.trim() : undefined,
        category_id: categoryId ?? undefined,
      };
      const created = await apiJson<Gesture>(
        '/gestures/',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token,
      );
      navigation.navigate('GestureDetail', { id: created.id });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Не удалось создать жест';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Header title="Добавить жест" onBack={() => navigation.goBack()} />
      <ScreenContainer>
        <View style={styles.card}>
          <TextField
            label="Название *"
            placeholder="Например: Привет"
            value={title}
            onChangeText={setTitle}
            errorText={titleError}
            maxLength={120}
          />

          <Text style={styles.label}>Категория</Text>
          {loadingCats ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.md }} />
          ) : (
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={categoryId ?? -1}
                onValueChange={(v) => setCategoryId(v === -1 ? null : Number(v))}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
              >
                <Picker.Item label="Без категории" value={-1} color={colors.textMuted} />
                {categories.map((c) => (
                  <Picker.Item key={c.id} label={c.name} value={c.id} color={colors.text} />
                ))}
              </Picker>
            </View>
          )}

          <TextField
            label="Описание"
            placeholder="Как выполняется жест..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.multiline}
            containerStyle={{ marginTop: spacing.md }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton title="Сохранить жест" onPress={submit} loading={submitting} />
          </View>
        </View>
      </ScreenContainer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  pickerWrap: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  picker: { color: colors.text },
  pickerItemIOS: { color: colors.text, backgroundColor: colors.bg },
  multiline: { minHeight: 100, paddingTop: 12 },
  errorText: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
});

export default CreateGesture;
