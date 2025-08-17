export type Step = {
  id: string
  name: string
  prompt: string
  enabled?: boolean
}

export type Pipeline = {
  model: string
  steps: Step[]
}

export const defaultPipeline: Pipeline = {
  model: 'google/gemini-2.5-pro',
  steps: [
    { id: 's1', name: '要約', prompt: '会議を5-8行で要約してください。' },
    { id: 's2', name: 'TODO', prompt: '参加者ごとにTODO（担当・期日）を列挙してください。' },
    { id: 's3', name: 'リスク', prompt: '主要なリスクと対策案を箇条書きで示してください。' }
  ]
}

export function withLangPrefix(p: string, lang: string) {
  return `Please make a response in ${lang}.
` + p
}
