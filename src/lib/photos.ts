import { supabase } from './supabase'

const BUCKET = 'trip-photos'
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

// Resize/compress client-side before upload — a phone photo doesn't need to
// be full resolution for a shared gallery, and this keeps the group
// comfortably inside Supabase's free storage tier over the weekend.
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', JPEG_QUALITY)
  })
}

export function getPhotoUrl(storagePath: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

export async function uploadPhoto({
  file,
  playerId,
  dayId,
  stopId,
  caption,
}: {
  file: File
  playerId: string
  dayId: string | null
  stopId: string | null
  caption: string | null
}) {
  const compressed = await compressImage(file)
  const path = `${playerId}/${crypto.randomUUID()}.jpg`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('photos').insert({
    storage_path: path,
    uploaded_by: playerId,
    day_id: dayId,
    stop_id: stopId,
    caption: caption?.trim() || null,
  })
  if (insertError) throw insertError
}

export async function deletePhoto(id: string, storagePath: string) {
  await supabase.storage.from(BUCKET).remove([storagePath])
  await supabase.from('photos').delete().eq('id', id)
}
