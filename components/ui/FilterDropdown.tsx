import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

export interface DropdownOption {
  label: string;
  value: string;
}

interface Props {
  label: string;
  selected: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  style?: object;
}

export function FilterDropdown({ label, selected, options, onSelect, style }: Props) {
  const [open, setOpen] = useState(false);
  const displayLabel = options.find((o) => o.value === selected)?.label ?? label;
  const hasValue = selected !== '';

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, hasValue && styles.triggerActive, style]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.value, hasValue && styles.valueActive]} numberOfLines={1}>
          {displayLabel}
        </Text>
        <Text style={[styles.chevron, hasValue && styles.chevronActive]}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: opt }) => (
                <TouchableOpacity
                  style={[styles.option, opt.value === selected && styles.optionActive]}
                  onPress={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      opt.value === selected && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {opt.value === selected && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  triggerActive: {
    backgroundColor: colors.saffron + '15',
    borderColor: colors.saffron + '55',
  },
  value: {
    flex: 1,
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink + 'AA',
  },
  valueActive: {
    color: colors.saffron,
    fontFamily: fontFamily.dmSansMedium,
  },
  chevron: { fontSize: 11, color: colors.ink + '55' },
  chevronActive: { color: colors.saffron },

  // ── Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,5,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '65%',
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: colors.ink + '22',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 24,
    color: colors.ink,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.parchment,
  },
  optionActive: { backgroundColor: colors.saffron + '0E' },
  optionText: {
    flex: 1,
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink + 'CC',
  },
  optionTextActive: {
    color: colors.saffron,
    fontFamily: fontFamily.dmSansMedium,
  },
  check: {
    fontSize: 16,
    color: colors.saffron,
  },
});
