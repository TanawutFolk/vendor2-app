import { describe, expect, test } from 'bun:test'

import { createTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

import { getChipSx, getReadableStatusTone } from './statusChipStyles'

const resolveBaseStyle = (sx: SxProps<Theme>, theme: Theme) => {
  const base = Array.isArray(sx) ? sx[0] : sx

  if (typeof base !== 'function') throw new Error('Expected theme-aware Chip styles')

  return base(theme) as Record<string, unknown>
}

describe('statusChipStyles', () => {
  test('keeps the configured status colors in light mode', () => {
    const style = resolveBaseStyle(
      getChipSx(getReadableStatusTone('approved')),
      createTheme({ palette: { mode: 'light' } })
    )

    expect(style.bgcolor).toBe('#D6F4E6')
    expect(style.color).toBe('#087B55')
    expect(style.borderColor).toBe('#5AD6A3')
  })

  test('derives readable status colors from the active dark theme', () => {
    const tone = getReadableStatusTone('approved')
    const style = resolveBaseStyle(getChipSx(tone), createTheme({ palette: { mode: 'dark' } }))

    expect(style.bgcolor).not.toBe(tone.bg)
    expect(style.color).not.toBe(tone.color)
    expect(style.borderColor).not.toBe(tone.border)
    expect(style['& .MuiChip-icon']).toEqual({ color: 'inherit' })
  })
})
