import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '../../../shared/lib/cn'
import {
  meetingTutorialContent,
  meetingTutorialSteps,
  type MeetingTutorialStep,
} from '../model/meetingTutorial.config'
import { MeetingTutorialFrame } from './MeetingTutorialFrame'

export type MeetingTutorialOverlayProps = {
  open?: boolean
  contained?: boolean
  step: MeetingTutorialStep
  dontShowAgain?: boolean
  onDontShowAgainChange?: (checked: boolean) => void
  onStepChange?: (step: MeetingTutorialStep) => void
  onSkip?: () => void
}

const VIEWBOX_WIDTH = 1440
const VIEWBOX_HEIGHT = 1024

type MeasuredRect = {
  css: { x: number; y: number; width: number; height: number }
  viewBox: { x: number; y: number; width: number; height: number; radius: number }
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getViewportScale() {
  if (typeof window === 'undefined') return 1
  return Math.min(window.innerWidth / VIEWBOX_WIDTH, window.innerHeight / VIEWBOX_HEIGHT)
}

export function MeetingTutorialOverlay({
  open = true,
  contained = false,
  step,
  dontShowAgain = false,
  onDontShowAgainChange,
  onStepChange,
  onSkip,
}: MeetingTutorialOverlayProps) {
  const generatedId = useId()
  const maskId = `meeting-tutorial-mask-${generatedId.replaceAll(':', '')}`
  const content = meetingTutorialContent[step]
  const [viewportScale, setViewportScale] = useState(getViewportScale)
  const [measuredRects, setMeasuredRects] = useState<MeasuredRect[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const renderScale = contained ? 1 : viewportScale

  useEffect(() => {
    const handleResize = () => setViewportScale(getViewportScale())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!open) return

    const section = sectionRef.current
    if (!section) return

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const getFocusableElements = () => Array.from(
      section.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

    const focusableElements = getFocusableElements()
    ;(focusableElements[0] ?? section).focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const currentFocusableElements = getFocusableElements()
      if (currentFocusableElements.length === 0) {
        event.preventDefault()
        section.focus()
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    section.addEventListener('keydown', handleKeyDown)

    return () => {
      section.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
      previousFocusRef.current = null
    }
  }, [open])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const lastTargetId = content.targetIds.at(-1)
    const lastTarget = lastTargetId
      ? document.querySelector<HTMLElement>(`[data-tutorial-target="${lastTargetId}"]`)
      : null

    lastTarget?.scrollIntoView({ block: 'nearest', inline: 'nearest' })

    const measure = () => {
      const sectionRect = section.getBoundingClientRect()
      const nextRects = content.targetIds.flatMap((targetId) => {
        const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${targetId}"]`)
        if (!target) return []

        const targetRect = target.getBoundingClientRect()
        const css = {
          height: targetRect.height,
          width: targetRect.width,
          x: targetRect.left - sectionRect.left,
          y: targetRect.top - sectionRect.top,
        }
        const borderRadius = Number.parseFloat(getComputedStyle(target).borderRadius) || 0

        return [{
          css,
          viewBox: {
            height: (css.height / sectionRect.height) * VIEWBOX_HEIGHT,
            radius: contained ? borderRadius : borderRadius / sectionRect.width * VIEWBOX_WIDTH,
            width: (css.width / sectionRect.width) * VIEWBOX_WIDTH,
            x: (css.x / sectionRect.width) * VIEWBOX_WIDTH,
            y: (css.y / sectionRect.height) * VIEWBOX_HEIGHT,
          },
        }]
      })

      setMeasuredRects(nextRects)
    }

    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(section)
    content.targetIds.forEach((targetId) => {
      const target = document.querySelector<HTMLElement>(`[data-tutorial-target="${targetId}"]`)
      if (target) observer?.observe(target)
    })
    window.addEventListener('resize', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [contained, content.targetIds, step])

  if (!open) return null

  const highlights = measuredRects.length === content.targetIds.length
    ? measuredRects.map(({ viewBox }) => viewBox)
    : content.highlights
  const positionedRects = measuredRects.map(({ css }) => css)
  const tooltipPosition = (() => {
    if (measuredRects.length !== content.targetIds.length) {
      return {
        left: `${(content.tooltip.x / VIEWBOX_WIDTH) * 100}%`,
        top: `${(content.tooltip.y / VIEWBOX_HEIGHT) * 100}%`,
      }
    }

    if (step === 1) {
      return {
        left: positionedRects[0].x + 152 * renderScale,
        top: positionedRects[2].y + positionedRects[2].height + 63 * renderScale,
      }
    }

    if (step === 2) {
      return {
        left: positionedRects[1].x + 138 * renderScale,
        top: positionedRects[1].y - 136 * renderScale,
      }
    }

    return {
      left: positionedRects[0].x + 37 * renderScale,
      top: positionedRects[3].y + positionedRects[3].height + 54 * renderScale,
    }
  })()
  const connectorPath = step === 2 && measuredRects.length === content.targetIds.length
    ? (() => {
        const panel = measuredRects[0].viewBox
        const selected = measuredRects[1].viewBox
        const circleX = panel.x - 20
        const connectorY = selected.y - 106
        const verticalX = selected.x + selected.width - 102
        return { circleX, connectorY, path: `M ${circleX} ${connectorY} H ${verticalX} V ${selected.y}` }
      })()
    : null

  return (
    <section
      aria-label={`회의 튜토리얼 ${step}단계`}
      aria-modal="true"
      className={cn(contained ? 'absolute' : 'fixed', 'inset-0 z-50 overflow-hidden')}
      data-meeting-tutorial-step={step}
      ref={sectionRef}
      role="dialog"
      tabIndex={-1}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <defs>
          <mask id={maskId}>
            <rect fill="white" height={VIEWBOX_HEIGHT} width={VIEWBOX_WIDTH} />
            {highlights.map((highlight) => (
              <rect
                fill="black"
                height={highlight.height}
                key={`${highlight.x}-${highlight.y}`}
                rx={highlight.radius}
                width={highlight.width}
                x={highlight.x}
                y={highlight.y}
              />
            ))}
          </mask>
        </defs>

        <rect
          fill="var(--color-overlay-black-60)"
          height={VIEWBOX_HEIGHT}
          mask={`url(#${maskId})`}
          width={VIEWBOX_WIDTH}
        />

        {content.connectorPath ? (
          <>
            <path
              d={connectorPath?.path ?? content.connectorPath}
              fill="none"
              stroke="var(--color-fg-inverse)"
              strokeDasharray="5 7"
              strokeLinecap="round"
              strokeWidth="2"
            />
            {step === 2 ? <circle cx={connectorPath?.circleX ?? 918} cy={connectorPath?.connectorY ?? 492} fill="var(--color-fg-inverse)" r="5" /> : null}
          </>
        ) : null}
      </svg>

      <MeetingTutorialFrame
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={onDontShowAgainChange}
        onSkip={onSkip}
        scale={renderScale}
      />

      <div
        className="absolute flex items-start bg-brand-primary text-fg-inverse"
        style={{
          borderRadius: 12 * renderScale,
          gap: 5 * renderScale,
          height: step === 2 ? 84 * renderScale : undefined,
          left: tooltipPosition.left,
          minHeight: 58 * renderScale,
          padding: `${16 * renderScale}px ${24 * renderScale}px`,
          top: tooltipPosition.top,
          width: step === 1 ? 'max-content' : content.tooltip.width * renderScale,
        }}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute bg-brand-primary',
            content.tooltip.pointer === 'top'
              ? 'bottom-full [clip-path:polygon(50%_0,100%_100%,0_100%)]'
              : 'top-full [clip-path:polygon(0_0,100%_0,50%_100%)]',
          )}
          style={{ height: 19 * renderScale, left: 20 * renderScale, width: 28 * renderScale }}
        />
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ height: 24 * renderScale, width: 24 * renderScale }}
        >
          <span
            className="flex items-center justify-center rounded-full bg-surface-elevated font-medium leading-none text-brand-primary"
            style={{ fontSize: 12 * renderScale, height: 16 * renderScale, width: 16 * renderScale }}
          >
            {step}
          </span>
        </span>
        <p
          className={cn('m-0 font-medium leading-[1.6]', step === 1 && 'whitespace-nowrap')}
          style={{ fontSize: 16 * renderScale, letterSpacing: -0.4 * renderScale }}
        >
          {content.description}
        </p>
      </div>

      <nav
        aria-label="튜토리얼 단계"
        className="absolute left-1/2 flex -translate-x-1/2 items-center bg-surface-elevated"
        style={{
          borderRadius: 100 * renderScale,
          gap: 6 * renderScale,
          padding: `${8 * renderScale}px ${24 *renderScale}px`,
          top: `${(970 / VIEWBOX_HEIGHT) * 100}%`,
        }}
      >
        {meetingTutorialSteps.map((targetStep) => (
          <button
            aria-current={targetStep === step ? 'step' : undefined}
            aria-label={`${targetStep}단계로 이동`}
            className={cn('rounded-full transition-colors', targetStep === step ? 'bg-brand-primary' : 'bg-line-strong hover:bg-gray-500')}
            key={targetStep}
            onClick={() => onStepChange?.(targetStep)}
            style={{ height: 6 * renderScale, width: 6 * renderScale }}
            type="button"
          />
        ))}
      </nav>
    </section>
  )
}
