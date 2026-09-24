import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, IconTile, Screen } from '../../components';
import { colors, spacing, type GradientToken, type IoniconName } from '../../theme';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'LogActivity'>;

const options: Array<{ type: 'contact' | 'event' | 'followUp'; title: string; description: string; icon: IoniconName; tone: GradientToken }> = [
  { type: 'contact', title: 'Contact', description: "Add a new contact you've met", icon: 'people-outline', tone: 'barOrange' },
  { type: 'event', title: 'Event', description: 'Log an event you attended', icon: 'calendar-outline', tone: 'barAmber' },
  { type: 'followUp', title: 'Follow-up', description: 'Schedule or record a follow up', icon: 'clipboard-outline', tone: 'barLime' },
];

export function LogActivityScreen({ navigation }: Props) {
  return (
    <Screen>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}><Ionicons name="chevron-back" size={27} color={colors.textPrimary} /></Pressable>
      <AppText variant="display">Log Activity</AppText>
      <AppText variant="subtitle" color={colors.textSecondary} style={styles.prompt}>What would you like to log?</AppText>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable key={option.type} onPress={() => navigation.navigate('LogEntry', { type: option.type })} style={styles.option}>
            <IconTile icon={option.icon} tone={option.tone} size="lg" />
            <View style={styles.copy}><AppText variant="subtitle">{option.title}</AppText><AppText variant="body" color={colors.textSecondary}>{option.description}</AppText></View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: spacing.md, marginLeft: -spacing.sm },
  prompt: { marginTop: spacing.sm },
  options: { gap: spacing.md, marginTop: spacing.lg },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  copy: { flex: 1, gap: 4 },
});
