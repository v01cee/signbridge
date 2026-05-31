import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

const Header: React.FC<Props> = ({ title, onBack, right }) => {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { width: 40, alignItems: 'flex-start' },
  backText: { color: colors.accent, fontSize: 32, lineHeight: 32 },
  title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
});

export default Header;
