import { useCallback, useEffect, useState } from 'react'

type UseTransientVisibilityOptions = {
  visibleDuration?: number
  exitDuration?: number
}

export function useTransientVisibility({
  visibleDuration = 2200,
  exitDuration = 300,
}: UseTransientVisibilityOptions = {}) {
  const [cycle, setCycle] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (cycle === 0) return

    const enterFrame = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })
    const leaveTimer = window.setTimeout(() => {
      setIsVisible(false)
    }, visibleDuration)
    const removeTimer = window.setTimeout(() => {
      setIsMounted(false)
    }, visibleDuration + exitDuration)

    return () => {
      window.cancelAnimationFrame(enterFrame)
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [cycle, exitDuration, visibleDuration])

  const show = useCallback(() => {
    setIsMounted(true)
    setIsVisible(false)
    setCycle((current) => current + 1)
  }, [])

  return {
    isMounted,
    isVisible,
    show,
  }
}
