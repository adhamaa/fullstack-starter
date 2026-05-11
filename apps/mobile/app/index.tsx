import { ActivityIndicator, SafeAreaView, View } from 'react-native'
import { useAuth } from '../src/auth/AuthContext'
import { HomeScreen } from '../src/screens/HomeScreen'
import { SignInScreen } from '../src/screens/SignInScreen'

export default function Index() {
  const { ready, accessToken } = useAuth()

  if (!ready) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#38bdf8" />
        </View>
      </SafeAreaView>
    )
  }

  return accessToken ? <HomeScreen /> : <SignInScreen />
}
