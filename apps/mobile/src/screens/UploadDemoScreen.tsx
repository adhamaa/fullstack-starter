import type { Upload } from '@fullstack/types'
import { uploadFile } from '@fullstack/api-client'
import * as DocumentPicker from 'expo-document-picker'
import { Link } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthContext'
import { makeApi } from '../lib/api'

export function UploadDemoScreen() {
  const { getAccessToken } = useAuth()
  const [uploads, setUploads] = useState<Upload[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const result = await makeApi(getAccessToken).listUploads()
      setUploads(result.uploads)
    } catch (error) {
      setMessage((error as Error).message)
    }
  }, [getAccessToken])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const pickAndUpload = useCallback(async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    })
    if (picked.canceled || !picked.assets?.[0]) return
    const asset = picked.assets[0]

    setBusy(true)
    setMessage(null)

    try {
      const fileResponse = await fetch(asset.uri)
      const blob = await fileResponse.blob()
      const contentType = asset.mimeType ?? 'application/octet-stream'

      await uploadFile(
        makeApi(getAccessToken),
        {
          file: blob,
          filename: asset.name,
          contentType,
        },
        {
          put: async (url, headers, body) => {
            const putResponse = await fetch(url, { method: 'PUT', headers, body })
            if (!putResponse.ok) throw new Error(`upload failed: ${putResponse.status}`)
          },
        },
      )

      setMessage(`Uploaded ${asset.name}`)
      await refresh()
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }, [getAccessToken, refresh])

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 p-6">
        <View className="rounded-3xl bg-bg-elevated p-6">
          <Text className="font-bold uppercase tracking-widest text-accent">Uploads</Text>
          <Text className="mt-3 text-2xl font-extrabold text-ink">Pick a file</Text>
          <Text className="mt-3 text-ink-muted leading-6">
            Files are uploaded directly to S3/MinIO using a presigned URL from the Node API.
          </Text>

          <Pressable
            disabled={busy}
            onPress={() => {
              void pickAndUpload()
            }}
            className={`mt-4 self-start rounded-lg bg-accent px-4 py-3 ${busy ? 'opacity-60' : ''}`}
          >
            <View className="flex-row items-center gap-2">
              {busy && <ActivityIndicator color="#0f172a" />}
              <Text className="font-bold text-accent-fg">
                {busy ? 'Uploading…' : 'Pick a file'}
              </Text>
            </View>
          </Pressable>

          {message && (
            <View className="mt-3 self-start rounded-full bg-bg-muted px-4 py-2">
              <Text className="text-[#bae6fd]">{message}</Text>
            </View>
          )}

          <Link href="/" asChild>
            <Pressable className="mt-4 self-start rounded-lg border border-slate-700 px-4 py-2">
              <Text className="font-semibold text-ink-muted">Back home</Text>
            </Pressable>
          </Link>
        </View>

        <View className="mt-4 flex-1 rounded-3xl bg-bg-elevated p-4">
          <Text className="mb-2 px-2 text-lg font-semibold text-ink">Recent uploads</Text>
          <FlatList
            data={uploads}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text className="px-2 text-ink-subtle">No uploads yet.</Text>}
            renderItem={({ item }) => (
              <View className="m-1 rounded-xl bg-bg-muted p-3">
                <Text className="font-bold text-ink">{item.filename}</Text>
                <Text className="text-ink-subtle text-xs">
                  {item.contentType} · {(item.sizeBytes / 1024).toFixed(1)} KB · {item.status}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
