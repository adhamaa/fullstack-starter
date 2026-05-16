import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const STORAGE_KEY = 'fullstack.tokens.v1'

/** SecureStore is native-only; use localStorage on web (Expo web stub is empty). */
export async function loadTokens(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(STORAGE_KEY)
  }
  return SecureStore.getItemAsync(STORAGE_KEY)
}

export async function saveTokens(value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
    return
  }
  if (value) {
    await SecureStore.setItemAsync(STORAGE_KEY, value)
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY)
  }
}
