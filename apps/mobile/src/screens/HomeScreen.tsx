import { Link, type Href } from "expo-router";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { apiBaseUrl, makeApi } from "../lib/api";

export function HomeScreen() {
  const { getAccessToken, signOut } = useAuth();
  const [status, setStatus] = useState("checking…");
  const [me, setMe] = useState<{ email?: string; name?: string | null; id: string } | null>(
    null
  );

  useEffect(() => {
    const api = makeApi(getAccessToken);
    api
      .health()
      .then((health) => setStatus(`${health.service}: ${health.status}`))
      .catch(() => setStatus("Node API is not reachable yet"));
    api
      .me()
      .then((response) => setMe(response.user))
      .catch(() => setMe(null));
  }, [getAccessToken]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="grow items-center justify-center p-6">
        <View className="w-full rounded-3xl bg-bg-elevated p-6">
          <Text className="font-bold uppercase tracking-widest text-accent">
            Fullstack Starter
          </Text>
          <Text className="mt-3 text-3xl font-extrabold text-ink">
            Welcome{me?.name ? `, ${me.name}` : ""}
          </Text>
          <Text className="mt-3 text-base text-ink-muted leading-6">
            Connected to {apiBaseUrl}.
          </Text>

          <View className="mt-4 self-start rounded-full bg-bg-muted px-4 py-2">
            <Text className="font-bold text-[#bae6fd]">API: {status}</Text>
          </View>
          <Text className="mt-2 text-ink-subtle">
            Runtime: {Constants.executionEnvironment}
          </Text>

          {me && (
            <View className="mt-4 gap-2">
              <View className="rounded-xl bg-bg-muted p-3">
                <Text className="text-xs uppercase tracking-wider text-ink-subtle">
                  User ID
                </Text>
                <Text className="font-mono text-[#bae6fd]">{me.id}</Text>
              </View>
              {me.email && (
                <View className="rounded-xl bg-bg-muted p-3">
                  <Text className="text-xs uppercase tracking-wider text-ink-subtle">
                    Email
                  </Text>
                  <Text className="font-mono text-[#bae6fd]">{me.email}</Text>
                </View>
              )}
            </View>
          )}

          <View className="mt-6 flex-row flex-wrap gap-3">
            <Link href={"/upload" as Href} asChild>
              <Pressable className="rounded-lg bg-accent px-4 py-3">
                <Text className="font-bold text-accent-fg">Upload demo</Text>
              </Pressable>
            </Link>
            <Pressable
              onPress={() => {
                void signOut();
              }}
              className="rounded-lg border border-slate-700 px-4 py-3"
            >
              <Text className="font-semibold text-ink-muted">Sign out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
