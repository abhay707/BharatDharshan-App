import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '../hooks/useSearch';
import { colors } from '../constants/colors';
import { fontFamily, fontSize } from '../constants/fonts';

// ─── Result row ───────────────────────────────────────────────────────────────
type ResultType = 'state' | 'monument' | 'festival';

interface ResultItem {
  slug: string;
  name: string;
  type: ResultType;
  subtitle?: string;
}

const ICON_MAP: Record<ResultType, React.ComponentProps<typeof Ionicons>['name']> = {
  state: 'map-outline',
  monument: 'business-outline',
  festival: 'sparkles-outline',
};

function ResultRow({ item }: { item: ResultItem }) {
  function handlePress() {
    if (item.type === 'state') router.push(`/states/${item.slug}` as any);
    else if (item.type === 'monument') router.push(`/heritage/${item.slug}` as any);
    else router.push(`/festivals/${item.slug}` as any);
  }

  return (
    <TouchableOpacity style={s.row} onPress={handlePress} activeOpacity={0.7}>
      <View style={s.rowIcon}>
        <Ionicons name={ICON_MAP[item.type]} size={18} color={colors.saffron} />
      </View>
      <View style={s.rowText}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        {!!item.subtitle && (
          <Text style={s.rowSub} numberOfLines={1}>{item.subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={15} color={colors.ink + '35'} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearch(query);

  // Shape API data into SectionList sections
  const sections: Array<{ title: string; data: ResultItem[] }> = [];
  if (data?.states?.length) {
    sections.push({
      title: 'States',
      data: (data.states as any[]).map((x) => ({
        slug: x.slug,
        name: x.name,
        type: 'state' as ResultType,
        subtitle: x.region,
      })),
    });
  }
  if (data?.monuments?.length) {
    sections.push({
      title: 'Monuments',
      data: (data.monuments as any[]).map((x) => ({
        slug: x.slug,
        name: x.name,
        type: 'monument' as ResultType,
        subtitle: x.state_name ?? x.type,
      })),
    });
  }
  if (data?.festivals?.length) {
    sections.push({
      title: 'Festivals',
      data: (data.festivals as any[]).map((x) => ({
        slug: x.slug,
        name: x.name,
        type: 'festival' as ResultType,
        subtitle: x.month ?? x.state_name,
      })),
    });
  }

  const trimmed = query.trim();
  const showSpinner = isLoading && trimmed.length >= 2;
  const showEmpty = !isLoading && trimmed.length >= 2 && sections.length === 0;
  const showHint = trimmed.length < 2;

  return (
    <SafeAreaView style={s.screen}>
      {/* ── Search bar ── */}
      <View style={s.bar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={s.inputWrap}>
          <Ionicons name="search-outline" size={18} color={colors.ink + '55'} />
          <TextInput
            style={s.input}
            placeholder="Search states, monuments, festivals…"
            placeholderTextColor={colors.ink + '55'}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.ink + '55'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Spinner ── */}
      {showSpinner && (
        <ActivityIndicator
          color={colors.saffron}
          size="large"
          style={{ marginTop: 48 }}
        />
      )}

      {/* ── Empty state ── */}
      {showEmpty && (
        <View style={s.center}>
          <Ionicons name="search-outline" size={40} color={colors.ink + '25'} />
          <Text style={s.emptyText}>No results for "{query}"</Text>
        </View>
      )}

      {/* ── Hint ── */}
      {showHint && !showSpinner && (
        <View style={s.center}>
          <Ionicons name="search" size={52} color={colors.ink + '18'} />
          <Text style={s.hintText}>Type at least 2 characters</Text>
        </View>
      )}

      {/* ── Results ── */}
      {sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.type}-${item.slug}`}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={s.list}
          renderSectionHeader={({ section: { title } }) => (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{title}</Text>
              <View style={s.sectionLine} />
            </View>
          )}
          renderItem={({ item }) => <ResultRow item={item} />}
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },

  // Search bar
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backBtn: { padding: 2 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.dmSans,
    fontSize: fontSize.base,
    color: colors.ink,
    padding: 0,
  },

  // States
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: {
    fontFamily: fontFamily.dmSans,
    fontSize: fontSize.base,
    color: colors.ink + '60',
    textAlign: 'center',
  },
  hintText: {
    fontFamily: fontFamily.dmSans,
    fontSize: fontSize.sm,
    color: colors.ink + '45',
    textAlign: 'center',
  },

  // Section list
  list: { paddingBottom: 40 },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cream,
  },
  sectionTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.parchment,
  },

  // Result row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.saffron + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowName: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  rowSub: {
    fontFamily: fontFamily.dmSans,
    fontSize: fontSize.xs,
    color: colors.ink + '60',
    marginTop: 2,
  },
  separator: { height: 1, backgroundColor: colors.parchment + 'BB', marginLeft: 68 },
});
