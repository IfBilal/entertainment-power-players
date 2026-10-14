import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Generic reusable bottom sheet (spec §12/§91) — translate-from-bottom modal,
 * tap backdrop to dismiss, content taps don't bubble to the backdrop. Drives
 * its own slide/fade rather than relying on Modal's animationType, which
 * doesn't animate consistently on web.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const reduceMotion = useReducedMotion();
  // Keep the Modal mounted through the closing animation, then unmount.
  const [rendered, setRendered] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(320)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      if (reduceMotion || process.env.NODE_ENV === 'test') {
        backdropOpacity.setValue(1);
        sheetTranslateY.setValue(0);
        return;
      }
      const animation = Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(sheetTranslateY, { toValue: 0, speed: 16, bounciness: 4, useNativeDriver: true }),
      ]);
      animation.start();
      return () => animation.stop();
    }

    if (reduceMotion || process.env.NODE_ENV === 'test') {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(320);
      setRendered(false);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 320, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) setRendered(false);
    });
    return () => animation.stop();
  }, [visible, reduceMotion, backdropOpacity, sheetTranslateY]);

  if (!rendered) return null;

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdropTouchable} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View
        style={[styles.sheetWrap, { transform: [{ translateY: sheetTranslateY }] }]}
        pointerEvents="box-none"
      >
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {children}
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropTouchable: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheetWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
});
