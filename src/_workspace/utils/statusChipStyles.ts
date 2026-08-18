import { alpha, lighten } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

type ChipTone = {
  bg: string
  color: string
  border: string
}

const STATUS_TONES: Record<string, ChipTone> = {
  registered: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' },
  'not registered': { bg: '#FFE0E2', color: '#D92D43', border: '#FF8B98' },
  'cannot register': { bg: '#E4E7EC', color: '#344054', border: '#98A2B3' },
  'in progress': { bg: '#FFF0D9', color: '#D96D00', border: '#FFB35C' },
  rejected: { bg: '#FFE0E2', color: '#B42335', border: '#FF8B98' },
  completed: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' },
  approved: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' },
  waiting: { bg: '#FFF0D9', color: '#D96D00', border: '#FFB35C' },
  skipped: { bg: '#D8F2FF', color: '#0277A8', border: '#6ACCF2' },
  pending: { bg: '#E4E7EC', color: '#344054', border: '#98A2B3' }
}

const REGION_TONES: Record<string, ChipTone> = {
  local: { bg: '#D6F4E6', color: '#087B55', border: '#5AD6A3' },
  oversea: { bg: '#D8F2FF', color: '#0277A8', border: '#6ACCF2' }
}

const normalize = (value: unknown) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const hexToTone = (accent?: string): ChipTone => {
  if (!accent || !/^#[0-9a-f]{6}$/i.test(accent)) {
    return { bg: '#E4E7EC', color: '#344054', border: '#98A2B3' }
  }

  return {
    bg: `${accent}2E`,
    color: accent,
    border: `${accent}80`
  }
}

export const getReadableStatusTone = (status: unknown, accent?: string): ChipTone => {
  const key = normalize(status)
  const exactMatch = STATUS_TONES[key]
  const matchedKey = Object.keys(STATUS_TONES)
    .sort((a, b) => b.length - a.length)
    .find(statusKey => key.includes(statusKey))

  return exactMatch || (matchedKey ? STATUS_TONES[matchedKey] : hexToTone(accent))
}

export const getRegionTone = (region: unknown): ChipTone => {
  return REGION_TONES[normalize(region)] || REGION_TONES.local
}

const getToneAccent = (tone: ChipTone) => {
  const color = [tone.border, tone.color].find(value => /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value))

  return color?.slice(0, 7)
}

const chipBaseSx = (tone: ChipTone): SxProps<Theme> => theme => {
  const isDarkMode = theme.palette.mode === 'dark'
  const accent = getToneAccent(tone) || theme.palette.primary.main

  return {
    bgcolor: isDarkMode ? alpha(accent, 0.2) : tone.bg,
    color: isDarkMode ? lighten(accent, 0.24) : tone.color,
    border: '1px solid',
    borderColor: isDarkMode ? alpha(accent, 0.58) : tone.border,
    fontWeight: 700,
    fontSize: '0.72rem',
    height: 24,
    '& .MuiChip-label': {
      px: 1.25
    },
    '& .MuiChip-icon': {
      color: 'inherit'
    }
  }
}

export const getChipSx = (tone: ChipTone, extra?: SxProps<Theme>): SxProps<Theme> => {
  const base = chipBaseSx(tone)

  if (!extra) return base
  return [base, ...(Array.isArray(extra) ? extra : [extra])] as SxProps<Theme>
}
