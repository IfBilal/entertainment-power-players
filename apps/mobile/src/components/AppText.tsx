import { Text, type TextProps } from 'react-native';
import { colors, typography, type TypographyToken } from '../theme';

type AppTextProps = TextProps & {
  variant?: TypographyToken;
  color?: string;
};

export function AppText({ variant = 'body', color = colors.textPrimary, style, ...rest }: AppTextProps) {
  return <Text style={[typography[variant], { color }, style]} {...rest} />;
}
