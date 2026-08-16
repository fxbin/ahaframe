import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const configuredOrigins = (Deno.env.get('AHAFRAME_ALLOWED_ORIGINS') || 'https://ahaframe.com,http://localhost:8080')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

function corsHeaders(origin: string | null) {
  const allowed = origin && configuredOrigins.includes(origin) ? origin : configuredOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(origin: string | null, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(origin) })
}

function text(value: unknown, max = 256) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function locale(value: unknown) {
  const parsed = text(value, 16)
  return parsed === 'zh-CN' ? 'zh-CN' : 'en'
}

function cohort(value: unknown) {
  const parsed = text(value, 80).toLowerCase()
  return /^[a-z0-9][a-z0-9._-]{0,79}$/.test(parsed) ? parsed : ''
}

function validDate(value: unknown) {
  const parsed = typeof value === 'string' ? Date.parse(value) : NaN
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
}

function object(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

async function ingestEvent(body: Record<string, unknown>) {
  const eventId = text(body.eventId, 120)
  const anonymousUserId = text(body.anonymousUserId, 120)
  const sessionId = text(body.sessionId, 120)
  const name = text(body.name, 120)
  const eventTs = validDate(body.ts)
  if (!eventId || !anonymousUserId || !sessionId || !name || !eventTs) throw new Error('invalid event payload')

  const row = {
    event_id: eventId,
    anonymous_user_id: anonymousUserId,
    session_id: sessionId,
    cohort_id: cohort(body.cohortId),
    locale: locale(body.locale),
    name,
    props: object(body.props),
    path: text(body.path, 500),
    event_ts: eventTs,
    page_type: text(body.pageType, 80),
    layer: text(body.layer, 80),
    lab_id: text(body.labId, 120),
    lab_version: text(body.labVersion, 40),
    visit_count: Math.max(1, Math.min(10000, Number(body.visitCount) || 1)),
    return_visit: body.returnVisit === true,
    utm_source: text(body.utmSource, 180),
    utm_medium: text(body.utmMedium, 180),
    utm_campaign: text(body.utmCampaign, 240),
    first_utm_source: text(body.firstUtmSource, 180),
    referrer: text(body.referrer, 1000),
    device_class: text(body.deviceClass, 40),
  }
  const { error } = await supabase.from('validation_events').upsert(row, { onConflict: 'event_id', ignoreDuplicates: true })
  if (error) throw error
  return 'event'
}

async function ingestFeedback(body: Record<string, unknown>) {
  const feedbackId = text(body.feedbackId, 120)
  const anonymousUserId = text(body.anonymousUserId, 120)
  const sessionId = text(body.sessionId, 120)
  const labId = text(body.labId, 120)
  const rating = text(body.rating, 20)
  const submittedAt = validDate(body.submittedAt)
  if (!feedbackId || !anonymousUserId || !sessionId || !labId || !['no', 'little', 'yes', 'aha'].includes(rating) || !submittedAt) throw new Error('invalid feedback payload')

  const row = {
    feedback_id: feedbackId,
    anonymous_user_id: anonymousUserId,
    session_id: sessionId,
    cohort_id: cohort(body.cohortId),
    locale: locale(body.locale),
    layer: text(body.layer, 80),
    lab_id: labId,
    lab_version: text(body.labVersion, 40),
    path: text(body.path, 500),
    rating,
    strong_aha: body.strongAha === true,
    note: text(body.note, 1200),
    attribution: object(body.attribution),
    device_class: text(body.deviceClass, 40),
    submitted_at: submittedAt,
  }
  const { error } = await supabase.from('aha_feedback').upsert(row, { onConflict: 'feedback_id', ignoreDuplicates: true })
  if (error) throw error
  return 'feedback'
}

async function ingestProductFeedback(body: Record<string, unknown>) {
  const productFeedbackId = text(body.productFeedbackId, 120)
  const anonymousUserId = text(body.anonymousUserId, 120)
  const sessionId = text(body.sessionId, 120)
  const feedbackType = text(body.feedbackType, 20)
  const message = text(body.message, 4000)
  const submittedAt = validDate(body.submittedAt)
  const email = text(body.email, 320).toLowerCase()
  if (!productFeedbackId || !anonymousUserId || !sessionId || !['bug', 'confusing', 'feature', 'other'].includes(feedbackType) || !message || !submittedAt) throw new Error('invalid product feedback payload')
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('invalid product feedback email')

  const row = {
    product_feedback_id: productFeedbackId,
    anonymous_user_id: anonymousUserId,
    session_id: sessionId,
    cohort_id: cohort(body.cohortId),
    locale: locale(body.locale),
    page_type: text(body.pageType, 80),
    layer: text(body.layer, 80),
    lab_id: text(body.labId, 120),
    lab_version: text(body.labVersion, 40),
    feedback_type: feedbackType,
    message,
    email,
    path: text(body.path, 500),
    page_url: text(body.pageUrl, 1000),
    device_class: text(body.deviceClass, 40),
    attribution: object(body.attribution),
    submitted_at: submittedAt,
  }
  const { error } = await supabase.from('product_feedback').upsert(row, { onConflict: 'product_feedback_id', ignoreDuplicates: true })
  if (error) throw error
  return 'product-feedback'
}

async function ingestWaitlist(body: Record<string, unknown>) {
  const email = text(body.email, 320).toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('invalid waitlist payload')
  const row = {
    email,
    intent: text(body.intent, 120) || 'waitlist',
    source: text(body.source, 500),
    anonymous_user_id: text(body.anonymousUserId, 120),
    session_id: text(body.sessionId, 120),
    cohort_id: cohort(body.cohortId),
    locale: locale(body.locale),
    layer: text(body.layer, 80),
    lab_id: text(body.labId, 120),
    lab_version: text(body.labVersion, 40),
    utm_source: text(body.utmSource, 180),
    utm_medium: text(body.utmMedium, 180),
    utm_campaign: text(body.utmCampaign, 240),
    first_utm_source: text(body.firstUtmSource, 180),
    referrer: text(body.referrer, 1000),
    device_class: text(body.deviceClass, 40),
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('validation_waitlist').upsert(row, { onConflict: 'email' })
  if (error) throw error
  return 'waitlist'
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  if (origin && !configuredOrigins.includes(origin)) return json(origin, { ok: false, error: 'origin not allowed' }, 403)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (req.method !== 'POST') return json(origin, { ok: false, error: 'method not allowed' }, 405)

  const length = Number(req.headers.get('content-length') || 0)
  if (length > 24_000) return json(origin, { ok: false, error: 'payload too large' }, 413)

  try {
    const body = object(await req.json())
    let kind = ''
    if (body.eventId && body.name) kind = await ingestEvent(body)
    else if (body.productFeedbackId && body.feedbackType) kind = await ingestProductFeedback(body)
    else if (body.feedbackId && body.rating) kind = await ingestFeedback(body)
    else if (body.email) kind = await ingestWaitlist(body)
    else return json(origin, { ok: false, error: 'unknown payload' }, 400)
    return json(origin, { ok: true, kind })
  } catch (error) {
    console.error('validation-ingest', error)
    return json(origin, { ok: false, error: 'invalid request' }, 400)
  }
})
