import { Animated, ViewStyle, StyleProp, View, Image } from 'react-native';
import { StudentColors as C } from '../../Utilities/Theme';

// ─── BounceIn ─────────────────────────────────────────────────────────────────
// Animations removed: Now renders children immediately with static layout.
export function BounceIn({
  children,
  delay = 0,
  flex = false,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  flex?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[flex && { flex: 1 }, style]}>
      {children}
    </View>
  );
}

// ─── FloatingImage ────────────────────────────────────────────────────────────
// Animations removed: Image is now static.
export function FloatingImage({
  source,
  style,
}: {
  source: any;
  style: StyleProp<any>;
}) {
  return (
    <Image
      source={source}
      style={style}
      resizeMode="contain"
    />
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// Animations removed: Pulsing disabled, static placeholder bar.
export function Skeleton({
  w = '100%',
  h = 16,
  r = 8,
}: {
  w?: any;
  h?: number;
  r?: number;
}) {
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: r,
        backgroundColor: C.mint,
        opacity: 0.5,
        marginBottom: 8,
      }}
    />
  );
}
