// components/game/ActionButtons.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionButton } from './ActionButton';
import { ActionType } from '@/types';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  disabledActions?: ActionType[];
  currentAction?: ActionType;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  disabledActions = [],
  currentAction
}) => {
  const actions = [
    { type: 'pass' as ActionType, label: 'Passe', icon: '→' },
    { type: 'shot' as ActionType, label: 'Tir', icon: '⚽' },
    { type: 'dribble' as ActionType, label: 'Dribble', icon: '⚡' },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <ActionButton
          key={action.type}
          action={action.type}
          label={action.label}
          icon={action.icon}
          onPress={() => onAction(action.type)}
          disabled={disabledActions.includes(action.type)}
          isSelected={currentAction === action.type}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
  },
});