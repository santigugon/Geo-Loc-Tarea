import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function App() {
  const [ubicacion, setUbicacion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mostrarTrafico, setMostrarTrafico] = useState(false);
  const [tipoMapa, setTipoMapa] = useState("standard");
  const [tempMarker, setTempMarker] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso de acceso a la ubicación denegado");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUbicacion(location.coords);
    })();
  }, []);

  if (!ubicacion) {
    return (
      <View style={styles.container}>
        <Text>Cargando ubicación...</Text>
      </View>
    );
  }

  const restaurantes = [
    {
      id: 1,
      nombre: "Casa Mary",
      coordenadas: {
        latitude: ubicacion.latitude + 0.005,
        longitude: ubicacion.longitude + 0.005,
      },
    },
    {
      id: 2,
      nombre: "Casa Erika",
      coordenadas: {
        latitude: ubicacion.latitude - 0.005,
        longitude: ubicacion.longitude - 0.005,
      },
    },
  ];

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const distancia = calcularDistancia(
      ubicacion.latitude,
      ubicacion.longitude,
      latitude,
      longitude
    );

    setTempMarker({
      latitude,
      longitude,
    });

    Alert.alert(
      "Distancia",
      `La distancia en línea recta desde tu ubicación es de ${distancia} km.`
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsTraffic={mostrarTrafico}
        mapType={tipoMapa}
        onPress={handleMapPress}
      >
        <Marker coordinate={ubicacion} title="Mi Ubicación" />

        {restaurantes.map((restaurante) => (
          <Marker
            key={restaurante.id}
            coordinate={restaurante.coordenadas}
            title={restaurante.nombre}
            pinColor="red"
            onPress={() =>
              Alert.alert(
                "Distancia",
                `Distancia desde tu ubicación: ${calcularDistancia(
                  ubicacion.latitude,
                  ubicacion.longitude,
                  restaurante.coordenadas.latitude,
                  restaurante.coordenadas.longitude
                )} km`
              )
            }
          >
            <Callout>
              <Text>{restaurante.nombre}</Text>
              <Text>Presiona para calcular la distancia</Text>
            </Callout>
          </Marker>
        ))}

        {/* Temporary marker */}
        {tempMarker && (
          <Marker
            coordinate={tempMarker}
            title="Ubicación Seleccionada"
            pinColor="blue"
          >
            <Callout>
              <Text>Ubicación Temporal</Text>
              <Text>Haz clic en otro lugar para moverla</Text>
            </Callout>
          </Marker>
        )}
      </MapView>

      {/* Toggle for Traffic */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { bottom: 100, backgroundColor: mostrarTrafico ? "#4CAF50" : "#fff" },
        ]}
        onPress={() => setMostrarTrafico(!mostrarTrafico)}
      >
        <MaterialCommunityIcons
          name="traffic-light"
          size={24}
          color={mostrarTrafico ? "white" : "black"}
        />
        <Text style={styles.buttonText}>
          {mostrarTrafico ? "Ocultar Tráfico" : "Mostrar Tráfico"}
        </Text>
      </TouchableOpacity>

      {/* Toggle for Map Type */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            bottom: 40,
            backgroundColor: tipoMapa === "satellite" ? "#2196F3" : "#fff",
          },
        ]}
        onPress={() =>
          setTipoMapa(tipoMapa === "standard" ? "satellite" : "standard")
        }
      >
        <MaterialIcons
          name="satellite"
          size={24}
          color={tipoMapa === "satellite" ? "white" : "black"}
        />
        <Text style={styles.buttonText}>
          {tipoMapa === "satellite" ? "Vista Estándar" : "Vista Satélite"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
});
