/**
 * Labels API adapter.
 *
 * Backend is not available yet — `fetchLabels` returns hardcoded maps.
 * When the backoffice labels API is ready, replace HARDCODED_* with a real
 * POST (same shape as sample_micro_fe: /backoffice-service/txn/labels/list).
 */

import { FALLBACK_AR } from './fallbackAr'
import { FALLBACK_EN } from './fallbackEn'

export const LABELS_API_PATH = '/backoffice-service/txn/labels/list'
export const LABELS_API_SUCCESS_CODE = '000000'

export type LabelsCriteria = {
  unit?: string
  channel?: string
  screenId?: string
}

export type LabelsListResponse = {
  status?: { code?: string; description?: string }
  data?: Record<string, string> | null
}

export const DEFAULT_LABELS_CRITERIA: Required<LabelsCriteria> = {
  unit: 'PRD',
  channel: 'GATEWAY',
  screenId: 'Gateway',
}

/** Hardcoded EN overlay — swap for API response later. */
const HARDCODED_EN: Record<string, string> = { ...FALLBACK_EN }

/** Hardcoded AR overlay — swap for API response later. */
const HARDCODED_AR: Record<string, string> = { ...FALLBACK_AR }

export function normalizeLabelsMap(data: unknown): Record<string, string> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const map: Record<string, string> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value == null || value === '') continue
    map[key] = String(value)
  }
  return map
}

export class LabelsApiError extends Error {
  statusCode?: number
  payload?: unknown

  constructor(message: string, statusCode?: number, payload?: unknown) {
    super(message)
    this.name = 'LabelsApiError'
    this.statusCode = statusCode
    this.payload = payload
  }
}

/**
 * Fetch i18n keys for one language.
 * Currently hardcoded; keep the same signature for a future real backend.
 */
export async function fetchLabels(
  langCode: string,
  _criteria: LabelsCriteria = {},
): Promise<Record<string, string>> {
  // Simulate a short network delay so callers behave like a real API.
  await new Promise((resolve) => setTimeout(resolve, 50))
  const map = langCode === 'ar' ? HARDCODED_AR : HARDCODED_EN
  return normalizeLabelsMap(map)
}
