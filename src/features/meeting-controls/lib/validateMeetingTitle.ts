export function validateMeetingTitle(draft: string, currentTitle: string, maxLength = 50) {
  const normalizedDraft = draft.trim()

  return (
    normalizedDraft.length > 0 &&
    draft.length <= maxLength &&
    normalizedDraft !== currentTitle.trim()
  )
}
