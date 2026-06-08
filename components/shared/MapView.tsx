import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapViewProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function SafeMapView({ latitude, longitude, name }: MapViewProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={name}
          pinColor="#E8580A"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: { flex: 1 },
});
