import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonProps {
  action: string;
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  label,
  icon,
  onPress,
  disabled = false,
  isSelected = false
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        isSelected && styles.selected
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  icon: {
    fontSize: 24,
    marginBottom: 5,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});