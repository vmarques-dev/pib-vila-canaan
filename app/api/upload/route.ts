import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { fileTypeFromBuffer } from 'file-type'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { STORAGE_CONFIG } from '@/lib/constants/config'

/**
 * Server-side image upload endpoint.
 *
 * Replaces the previous browser-direct upload flow so that the actual
 * bytes of every file are inspected before they reach Storage. The
 * client now POSTs `multipart/form-data` here and we:
 *
 * 1. Authenticate the caller via the auth cookie
 * 2. Authorize: confirm the user is an active row in `usuarios_admin`
 * 3. Read the file bytes and detect the real MIME from the magic
 *    numbers (the browser-reported `file.type` is untrusted)
 * 4. Reject anything that is not in `STORAGE_CONFIG.ALLOWED_IMAGE_TYPES`
 * 5. Upload to Storage using the service-role client. RLS is bypassed
 *    safely here because steps 1–4 already enforced the policy at the
 *    application layer.
 */
const ALLOWED_MIMES: readonly string[] = STORAGE_CONFIG.ALLOWED_IMAGE_TYPES
const ALLOWED_BUCKETS: readonly string[] = Object.values(STORAGE_CONFIG.BUCKETS)

export async function POST(request: Request) {
  // 1. Authenticate
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Route handlers don't refresh sessions — set/remove are no-ops.
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Authorize: must be an active admin
  const { data: admin, error: adminError } = await supabase
    .from('usuarios_admin')
    .select('ativo')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !admin || !admin.ativo) {
    logger.warn('Upload attempt by non-admin or inactive admin', {
      userId: user.id,
      context: 'upload-api',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Parse the multipart form
  let formData: FormData
  try {
    formData = await request.formData()
  } catch (error) {
    logger.error('Failed to parse multipart form', error, { context: 'upload-api' })
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const bucket = (formData.get('bucket') as string | null) ?? STORAGE_CONFIG.BUCKETS.EVENTOS
  const folder = formData.get('folder') as string | null

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  // 4. Size sanity check
  if (file.size === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 })
  }

  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  // 5. Magic-byte validation: read the actual content. The browser-
  // reported `file.type` is derived from the extension and can be
  // forged (e.g. `evil.exe` renamed to `evil.jpg` reports
  // `image/jpeg`). `file-type` parses the binary header instead.
  const buffer = new Uint8Array(await file.arrayBuffer())
  const detected = await fileTypeFromBuffer(buffer)

  if (!detected || !ALLOWED_MIMES.includes(detected.mime)) {
    logger.warn('Rejected upload with unexpected magic bytes', {
      reportedMime: file.type,
      detectedMime: detected?.mime ?? 'unknown',
      context: 'upload-api',
    })
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG and WebP images are accepted.' },
      { status: 415 }
    )
  }

  // 6. Generate a unique filename (use the detected extension, not
  // whatever extension the user happened to send)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const filename = `${timestamp}-${random}.${detected.ext}`
  const path = folder ? `${folder}/${filename}` : filename

  // 7. Upload via service-role client. RLS is bypassed deliberately:
  // we already enforced "only active admins can upload images of
  // allowed types" above, in code we control.
  const adminClient = createSupabaseAdminClient()
  const { data, error } = await adminClient.storage.from(bucket).upload(path, buffer, {
    cacheControl: '3600',
    upsert: false,
    contentType: detected.mime,
  })

  if (error) {
    logger.error('Storage upload failed', error, { context: 'upload-api' })
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(bucket).getPublicUrl(data.path)

  logger.info('Upload validated and stored', {
    bucket,
    path: data.path,
    size: file.size,
    mime: detected.mime,
    context: 'upload-api',
  })

  return NextResponse.json({ url: publicUrl, path: data.path }, { status: 200 })
}
