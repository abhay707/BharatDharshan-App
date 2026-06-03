import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface Props {
  text: string;
  color?: string;
  textColor?: string;
}

export function Badge({ text, color = colors.saffron, textColor = colors.white }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.text, { color: color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
