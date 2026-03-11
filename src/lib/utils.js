import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Professional muted color palette for client blocks
export const CLIENT_COLORS = [
  { name: 'Sky', value: '#93c5fd', bg: '#dbeafe', dark: '#1e3a5f', darkBg: '#1e293b' },
  { name: 'Rose', value: '#fda4af', bg: '#ffe4e6', dark: '#9f1239', darkBg: '#3b1c2c' },
  { name: 'Amber', value: '#fcd34d', bg: '#fef3c7', dark: '#92400e', darkBg: '#3b2f1c' },
  { name: 'Emerald', value: '#6ee7b7', bg: '#d1fae5', dark: '#065f46', darkBg: '#1c3b2f' },
  { name: 'Violet', value: '#c4b5fd', bg: '#ede9fe', dark: '#5b21b6', darkBg: '#2e1c3b' },
  { name: 'Orange', value: '#fdba74', bg: '#ffedd5', dark: '#c2410c', darkBg: '#3b291c' },
  { name: 'Teal', value: '#5eead4', bg: '#ccfbf1', dark: '#115e59', darkBg: '#1c3b38' },
  { name: 'Pink', value: '#f9a8d4', bg: '#fce7f3', dark: '#9d174d', darkBg: '#3b1c2e' },
  { name: 'Lime', value: '#bef264', bg: '#ecfccb', dark: '#3f6212', darkBg: '#2a3b1c' },
  { name: 'Indigo', value: '#a5b4fc', bg: '#e0e7ff', dark: '#3730a3', darkBg: '#1c1e3b' },
  { name: 'Cyan', value: '#67e8f9', bg: '#cffafe', dark: '#155e75', darkBg: '#1c333b' },
  { name: 'Fuchsia', value: '#e879f9', bg: '#fae8ff', dark: '#86198f', darkBg: '#351c3b' },
]

export function getNextColor(existingColors) {
  for (const c of CLIENT_COLORS) {
    if (!existingColors.includes(c.value)) return c.value
  }
  return CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)].value
}

export function getColorInfo(colorValue) {
  return CLIENT_COLORS.find(c => c.value === colorValue) || CLIENT_COLORS[0]
}

// Calculate relative luminance of a hex color
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

// Get accessible text color for a given background
export function getTextColorForBg(bgHex, isDark) {
  const colorInfo = getColorInfo(bgHex)
  if (isDark) {
    // In dark mode, the block bg is the color at ~19% opacity on a near-black bg (#0a0a0a)
    // Approximate the composited color and check contrast
    const bg = 0.04 // luminance of #0a0a0a
    const fg = luminance(bgHex)
    const compositedLum = fg * 0.19 + bg * 0.81
    // If composited bg is dark, use light text; otherwise use the dark variant
    return compositedLum < 0.18 ? '#e5e7eb' : colorInfo?.dark || '#333'
  }
  // Light mode: bg is color at 19% on white — always light, use dark text
  return colorInfo?.dark || '#333'
}
