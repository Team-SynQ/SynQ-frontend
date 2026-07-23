import { useEffect, useRef, type RefObject } from 'react'

type UseDismissableLayerOptions = {
  open: boolean
  onDismiss: () => void
  restoreFocusRef?: RefObject<HTMLElement | null>
}

export function useDismissableLayer<T extends HTMLElement>({
  open,
  onDismiss,
  restoreFocusRef,
}: UseDismissableLayerOptions) {
  const layerRef = useRef<T>(null)

  useEffect(() => {
    if (!open) return

    const dismiss = () => {
      onDismiss()
      restoreFocusRef?.current?.focus()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node
        && !layerRef.current?.contains(event.target)
      ) {
        dismiss()
      }
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
  }, [onDismiss, open, restoreFocusRef])

  return layerRef
}
