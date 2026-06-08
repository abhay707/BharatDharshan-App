import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MapViewProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function SafeMapView({ latitude, longitude, name }: MapViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.coords}>
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`)
        }
      >
        <Text style={styles.buttonText}>Open in Google Maps →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: 'rgba(201,144,26,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,144,26,0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    padding: 20,
    gap: 12,
  },
  icon: { fontSize: 40 },
  name: {
    color: '#1A0A00',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  coords: {
    color: '#8B7355',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#E8580A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
