import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../store/auth';
import { colors, radius, spacing } from '../theme';

interface Props {
  navigation: any;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const Profile: React.FC<Props> = ({ navigation }) => {
  const { token, user, logout } = useAuth();

  if (!token || !user) {
    return (
      <ScreenContainer scroll={false}>
        <Header title="Профиль" />
        <EmptyState
          icon="👤"
          title="Войдите в аккаунт"
          description="Чтобы увидеть профиль и избранное"
          actionLabel="Войти"
          onAction={() => navigation.navigate('Login')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <Header title="Профиль" />
      <ScreenContainer>
        <View style={styles.card}>
          <Text style={styles.emoji}>🤟</Text>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.created_at ? (
            <Text style={styles.meta}>Аккаунт создан: {formatDate(user.created_at)}</Text>
          ) : null}
        </View>

        <View style={styles.linksCard}>
          <Pressable
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.linkText}>★ Избранное</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            onPress={() => navigation.navigate('CreateGesture')}
          >
            <Text style={styles.linkText}>+ Добавить жест</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton
            title="Выйти"
            onPress={() => {
              logout();
            }}
            style={styles.logoutBtn}
          />
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
    padding: spacing.lg,
    alignItems: 'center',
  },
  emoji: { fontSize: 64, marginBottom: spacing.sm },
  username: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  email: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.md },
  meta: { color: colors.textMuted, fontSize: 12 },
  linksCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  linkPressed: { backgroundColor: colors.bg },
  linkText: { color: colors.text, fontSize: 16 },
  chevron: { color: colors.textMuted, fontSize: 22 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  logoutBtn: { backgroundColor: colors.error },
});

export default Profile;
