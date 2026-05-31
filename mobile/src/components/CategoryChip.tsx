import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  active?: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<Props> = ({ label, active, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
    height: 32,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  text: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  textActive: { color: '#fff', fontWeight: '600' },
});

export default CategoryChip;
