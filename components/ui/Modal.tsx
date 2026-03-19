import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal as RNModal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}
          {children}
        </View>
      </Pressable>
    </RNModal>
  );
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: { label: string; onPress: () => void; danger?: boolean }[];
}

export function ActionSheet({ visible, onClose, title, options }: ActionSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handlePress = async (onPress: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.actionSheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {title && (
            <Text style={[styles.actionSheetTitle, { color: colors.textSecondary }]}>
              {title}
            </Text>
          )}
          {options.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? colors.surface : colors.background },
              ]}
              onPress={() => handlePress(option.onPress)}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: option.danger ? colors.expense : colors.primary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: pressed ? colors.surface : colors.background },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>取消</Text>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    gap: 8,
  },
  actionSheetTitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});