import { Redirect } from 'expo-router'
import { useAuth } from '../src/auth/AuthContext'
import { UploadDemoScreen } from '../src/screens/UploadDemoScreen'

export default function UploadRoute() {
  const { ready, accessToken } = useAuth()
  if (!ready) return null
  if (!accessToken) return <Redirect href="/" />
  return <UploadDemoScreen />
}
