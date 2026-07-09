/**
 * detectBrowser.ts — detecta se o visitante está no Chrome (ou outro Chromium
 * que não seja Chrome, como Edge/Opera/Brave, que também disparam
 * "beforeinstallprompt" mas não são o Chrome propriamente).
 */

export type DetectedBrowser = 'chrome' | 'other'

export function detectBrowser(): DetectedBrowser {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent || ''
  const isChromium = /Chrome\//.test(ua)
  const isOtherChromiumBrowser = /Edg\/|OPR\/|Brave\//.test(ua)
  return isChromium && !isOtherChromiumBrowser ? 'chrome' : 'other'
}
