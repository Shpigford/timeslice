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
