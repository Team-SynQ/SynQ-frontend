const MEETING_TUTORIAL_HIDDEN_STORAGE_KEY = 'synq:meeting-tutorial:hidden'

export function isMeetingTutorialHidden() {
  try {
    return window.localStorage.getItem(MEETING_TUTORIAL_HIDDEN_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setMeetingTutorialHidden(hidden: boolean) {
  try {
    if (hidden) {
      window.localStorage.setItem(MEETING_TUTORIAL_HIDDEN_STORAGE_KEY, 'true')
      return
    }

    window.localStorage.removeItem(MEETING_TUTORIAL_HIDDEN_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}
