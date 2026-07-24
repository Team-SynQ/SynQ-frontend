import { useEffect, useRef, type RefObject } from 'react'

type UseDismissableLayerOptions = {
  open: boolean
  onDismiss: () => void
  triggerRef?: RefObject<HTMLElement | null>
}

export function useDismissableLayer<T extends HTMLElement>({
  open,
  onDismiss,
  triggerRef,
}: UseDismissableLayerOptions) {
  const layerRef = useRef<T>(null)

  useEffect(() => {
    if (!open) return

    const dismiss = () => {
      onDismiss()
      window.setTimeout(() => triggerRef?.current?.focus(), 0)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (layerRef.current?.contains(event.target)) return
      if (triggerRef?.current?.contains(event.target)) return

      dismiss()
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDismiss, open, triggerRef])

  return layerRef
}
