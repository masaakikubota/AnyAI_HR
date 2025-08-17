export type Settings = {
  backendUrl: string
  model: string
  shareContext: boolean
  fallbackAppendTranscript: boolean
  // emailTo, lang, jobDescription are moved out as they are runtime parameters for GUI tests.
  transcript?: string // for testing
}

export const SETTINGS_KEY = 'tldv_gui_settings_v1'
export const PIPELINE_KEY = 'tldv_gui_pipeline_v1'
export const COMPOSER_KEY = 'tldv_gui_composer_v1'

export function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY)
  const defaults: Settings = {
    backendUrl: 'http://localhost:8787',
    model: 'google/gemini-2.5-pro',
    shareContext: true,
    fallbackAppendTranscript: true
  }
  if (!raw) return defaults
  try {
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}
