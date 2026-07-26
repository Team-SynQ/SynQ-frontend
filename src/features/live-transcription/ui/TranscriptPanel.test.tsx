import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { TranscriptPanelActions, TranscriptPanelState } from '../model/transcript.types'
import { TranscriptPanel } from './TranscriptPanel'

const segment = {
  id: 'segment-1',
  sequenceIndex: 1,
  startedAtSeconds: 284,
  text: '온보딩 개선이 가장 큰 임팩트를 줄 수 있습니다.',
  isEdited: false,
  editedAt: null,
}

const hint = {
  transcriptId: 'segment-1',
  notice: null,
  meaning: '온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.',
  personalImpact: '일정과 리소스 배분에 영향이 있을 수 있습니다.',
  teamQuestion: '온보딩 개선의 완료 기준은 무엇인가요?',
}

function createActions(): TranscriptPanelActions {
  return {
    onAskAi: vi.fn(),
    onCancelEdit: vi.fn(),
    onEditDraftChange: vi.fn(),
    onRefresh: vi.fn(),
    onRetryHint: vi.fn(),
    onSaveEdit: vi.fn(),
    onSelectSegment: vi.fn(),
    onStartEdit: vi.fn(),
  }
}

function createActiveState(
  overrides: Partial<Extract<TranscriptPanelState, { kind: 'active' }>> = {},
): Extract<TranscriptPanelState, { kind: 'active' }> {
  return {
    kind: 'active',
    editState: { status: 'idle' },
    hintState: { status: 'idle' },
    isSpeaking: false,
    segments: [segment],
    selectedSegmentId: 'segment-1',
    ...overrides,
  }
}

describe('TranscriptPanel', () => {
  it('shows actions for the selected transcript and forwards both actions', async () => {
    const user = userEvent.setup()
    const actions = createActions()

    render(<TranscriptPanel actions={actions} state={createActiveState()} />)

    const option = screen.getByRole('option', { name: /온보딩 개선/ })
    expect(option).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('button', { name: '전사 수정' }))
    await user.click(screen.getByRole('button', { name: 'AI에게 질문하기' }))

    expect(actions.onStartEdit).toHaveBeenCalledWith('segment-1')
    expect(actions.onAskAi).toHaveBeenCalledWith('segment-1')
  })

  it('separates the selected transcript and hint surfaces with Figma token radii', async () => {
    const user = userEvent.setup()
    const onCollapseHint = vi.fn()
    const actions = {
      ...createActions(),
      onCollapseHint,
    } as TranscriptPanelActions & {
      onCollapseHint: (transcriptId: string) => void
    }

    render(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          hintState: {
            status: 'ready',
            transcriptId: 'segment-1',
            hint,
          },
        })}
      />,
    )

    expect(screen.getByText('의미')).toBeInTheDocument()
    expect(screen.getByText('내 영향')).toBeInTheDocument()
    expect(screen.getByText('팀 질문')).toBeInTheDocument()
    expect(screen.getByText(hint.teamQuestion)).toBeInTheDocument()
    const option = screen.getByRole('option', { name: segment.text })
    const transcriptSurface = screen.getByRole('button', { name: segment.text }).parentElement
    const hintSurface = screen.getByText(hint.teamQuestion).closest('article')

    expect(option).toHaveClass('gap-xs')
    expect(option).not.toHaveClass('bg-surface-muted', 'p-s')
    expect(transcriptSurface).not.toBe(option)
    expect(transcriptSurface).toHaveClass('rounded-m', 'bg-surface-muted', 'p-s')
    expect(hintSurface).toHaveClass('rounded-m', 'bg-surface-muted', 'p-s')
    expect(hintSurface).not.toHaveClass('mt-xs')
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-gray-800')
    for (const label of ['의미', '내 영향', '팀 질문']) {
      expect(screen.getByText(label)).toHaveClass('rounded-[var(--radius-s)]', 'bg-gray-100')
    }

    const collapseButton = screen.getByRole('button', { name: 'SynQ 힌트 접기' })
    expect(collapseButton.querySelector('img')?.getAttribute('src')).toContain(
      'M0.6%205.93333L5.93333%200.6L11.2667%205.93333',
    )
    await user.click(collapseButton)

    expect(onCollapseHint).toHaveBeenCalledWith('segment-1')
  })

  it('renders hint loading and error states and forwards retry', async () => {
    const user = userEvent.setup()
    const actions = createActions()
    const { rerender } = render(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          hintState: { status: 'loading', transcriptId: 'segment-1' },
        })}
      />,
    )

    expect(screen.getByText('SynQ 힌트를 불러오는 중입니다.')).toBeInTheDocument()

    rerender(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          hintState: {
            status: 'error',
            transcriptId: 'segment-1',
            message: 'SynQ 힌트를 불러오지 못했습니다.',
          },
        })}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('SynQ 힌트를 불러오지 못했습니다.')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(actions.onRetryHint).toHaveBeenCalledWith('segment-1')
  })

  it('enables confirmation only after the edit draft changes to non-empty text', async () => {
    const user = userEvent.setup()
    const actions = createActions()
    const originalText = segment.text
    const { rerender } = render(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          editState: {
            status: 'editing',
            transcriptId: 'segment-1',
            originalText,
            draftText: originalText,
            errorMessage: null,
            isSaving: false,
          },
        })}
      />,
    )

    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled()
    await user.clear(screen.getByRole('textbox', { name: '전사 내용' }))
    await user.type(screen.getByRole('textbox', { name: '전사 내용' }), '수정 문장')
    expect(actions.onEditDraftChange).toHaveBeenCalled()

    rerender(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          editState: {
            status: 'editing',
            transcriptId: 'segment-1',
            originalText,
            draftText: '수정 문장',
            errorMessage: null,
            isSaving: false,
          },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: '확인' })).toBeEnabled()

    rerender(
      <TranscriptPanel
        actions={actions}
        state={createActiveState({
          editState: {
            status: 'editing',
            transcriptId: 'segment-1',
            originalText,
            draftText: '   ',
            errorMessage: null,
            isSaving: false,
          },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled()
  })

  it('keeps a failed edit draft visible with an alert', () => {
    render(
      <TranscriptPanel
        actions={createActions()}
        state={createActiveState({
          editState: {
            status: 'editing',
            transcriptId: 'segment-1',
            originalText: segment.text,
            draftText: '저장에 실패한 초안',
            errorMessage: '전사 내용을 수정하지 못했습니다.',
            isSaving: false,
          },
        })}
      />,
    )

    expect(screen.getByRole('textbox', { name: '전사 내용' })).toHaveValue('저장에 실패한 초안')
    expect(screen.getByRole('alert')).toHaveTextContent('전사 내용을 수정하지 못했습니다.')
  })

  it('marks a successfully edited transcript', () => {
    render(
      <TranscriptPanel
        actions={createActions()}
        state={createActiveState({
          segments: [
            {
              ...segment,
              text: '수정된 전사 문장',
              isEdited: true,
              editedAt: '2026-07-27T00:00:00.000Z',
            },
          ],
        })}
      />,
    )

    expect(screen.getByText('수정됨')).toBeInTheDocument()
    expect(screen.getByText('수정된 전사 문장')).toBeInTheDocument()
  })
})
