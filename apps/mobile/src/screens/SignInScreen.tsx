import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthContext'

export function SignInScreen() {
  const { signIn, signingIn } = useAuth()

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-bg p-6">
      <View className="w-full rounded-3xl bg-bg-elevated p-6">
        <Text className="font-bold uppercase tracking-widest text-accent">Fullstack Starter</Text>
        <Text className="mt-3 text-3xl font-extrabold text-ink">Sign in</Text>
        <Text className="mt-3 text-base text-ink-muted leading-6">
          Authenticate with your Keycloak account to access the dashboard and upload files.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={signingIn}
          onPress={() => {
            void signIn()
          }}
          className={`mt-6 self-start rounded-lg bg-accent px-4 py-3 ${
            signingIn ? 'opacity-60' : ''
          }`}
        >
          <View className="flex-row items-center gap-2">
            {signingIn && <ActivityIndicator color="#0f172a" />}
            <Text className="font-bold text-accent-fg">
              {signingIn ? 'Opening browser…' : 'Sign in with Keycloak'}
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
