export const theme = {
  font: {
    sans: "'IBM Plex Sans', sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },
  color: {
    canvasOuter: '#eef1f4',
    canvasInner: '#f6f8f9',
    surface: '#ffffff',
    border: '#e2e7ea',
    borderStrong: '#dfe4e8',
    borderFaint: '#eef1f2',
    textPrimary: '#16232c',
    textSecondary: '#7c8894',
    textMuted: '#9aa6ae',
    accent: '#0e7c86',
    accentHover: '#0b616a',
    accentTint: '#eaf5f4',
    sidebarBg: '#16232c',
    sidebarBorder: '#2a3944',
    sidebarTextMuted: '#8ea3ad',
    sidebarTextFaint: '#647884',
    status: {
      normal: '#1e8a5c',
      elevated: '#c47f17',
      critical: '#c0392b',
    },
  },
} as const

export type Status = 'Normal' | 'Elevated' | 'Critical'

export function statusColor(status: Status): string {
  switch (status) {
    case 'Critical':
      return theme.color.status.critical
    case 'Elevated':
      return theme.color.status.elevated
    default:
      return theme.color.status.normal
  }
}
