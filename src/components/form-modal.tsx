import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { useAppThemeColors } from '@/src/hooks/use-app-theme-colors';

type FormModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  children: ReactNode;
};

/**
 * The add/edit dialog from Manage Rooms, shared so every form behaves the same
 * way around the keyboard:
 *
 * - the card shrinks while the keyboard is up, so the action row stays visible
 *   above it, and the fields scroll inside the card;
 * - tapping the backdrop, an empty part of the card, or dragging the fields
 *   dismisses the keyboard;
 * - submitting or closing always dismisses it.
 */
export function FormModal({
  visible,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel,
  submitting = false,
  error,
  children,
}: FormModalProps) {
  const colors = useAppThemeColors();
  const styles = createStyles(colors);
  const { height: screenHeight } = useWindowDimensions();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const submit = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={styles.backdrop}
          onPress={submitting ? Keyboard.dismiss : close}
          accessibilityLabel="Close"
        />

        <View
          style={[
            styles.card,
            {
              maxHeight: keyboardVisible
                ? screenHeight * 0.55
                : screenHeight * 0.8,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Taps on the empty parts of the form close the keyboard. */}
            <Pressable onPress={Keyboard.dismiss} accessible={false}>
              {children}

              {error ? (
                <HelperText type="error" visible style={styles.error}>
                  {error}
                </HelperText>
              ) : null}
            </Pressable>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              mode="text"
              onPress={close}
              disabled={submitting}
              textColor={colors.textPrimary}
            >
              Cancel
            </Button>

            <Button
              mode="text"
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              textColor={colors.secondary}
              labelStyle={styles.submitLabel}
            >
              {submitLabel}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeColors>) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    card: {
      width: '90%',
      maxWidth: 420,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
    },

    header: {
      paddingHorizontal: 24,
      paddingTop: 22,
      paddingBottom: 14,
    },

    title: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: colors.textSecondary,
    },

    scroll: {
      flexGrow: 0,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 8,
    },

    error: {
      paddingHorizontal: 0,
    },

    actions: {
      minHeight: 64,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },

    submitLabel: {
      fontWeight: '700',
    },
  });

/** Shared look for the inputs inside a FormModal. */
export function useFormInputProps() {
  const colors = useAppThemeColors();

  return {
    mode: 'outlined' as const,
    style: { marginBottom: 13, backgroundColor: colors.surface },
    textColor: colors.textPrimary,
    outlineColor: colors.textFieldOutline,
    activeOutlineColor: colors.textFieldActiveOutline,
    placeholderTextColor: colors.textFieldPlaceholder,
  };
}
