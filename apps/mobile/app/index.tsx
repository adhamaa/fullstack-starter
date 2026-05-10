import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { createApiClient } from "@fullstack/api-client";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
const api = createApiClient({ baseUrl: apiUrl });

export default function HomeScreen() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .health()
      .then((health) => setStatus(`${health.service}: ${health.status}`))
      .catch(() => setStatus("Node API is not reachable yet"));
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Fullstack Starter</Text>
        <Text style={styles.title}>Expo mobile app</Text>
        <Text style={styles.body}>
          Connected to {apiUrl}. Use Keycloak for auth and the Node API for app-facing features.
        </Text>
        <Text style={styles.status}>API: {status}</Text>
        <Text style={styles.meta}>Runtime: {Constants.executionEnvironment}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: 24
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#111827"
  },
  eyebrow: {
    color: "#38bdf8",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    marginTop: 12,
    color: "#e2e8f0",
    fontSize: 36,
    fontWeight: "800"
  },
  body: {
    marginTop: 12,
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 24
  },
  status: {
    marginTop: 24,
    color: "#bae6fd",
    fontWeight: "700"
  },
  meta: {
    marginTop: 8,
    color: "#94a3b8"
  }
});
