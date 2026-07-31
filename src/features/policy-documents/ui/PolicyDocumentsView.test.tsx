import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PolicyDocumentsView } from './PolicyDocumentsView'

describe('PolicyDocumentsView', () => {
  it('renders the Figma terms document with tokenized Body01 copy', () => {
    render(<PolicyDocumentsView />)

    expect(screen.getByRole('heading', { name: '정책 문서' })).toBeInTheDocument()
    const activeTab = screen.getByRole('tab', { name: '이용 약관' })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
    expect(activeTab).toHaveClass(
      'font-semibold!',
      'typo-title-02',
      'text-fg-tab-active',
    )
    expect(screen.getByText('시행일자: 2026년 7월 28일')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(12)
    const introduction = screen.getByText(
      /이 약관은 SynQ.*프로젝트 맥락 기반 AI 회의 이해 보조 서비스/,
    )
    expect(introduction).toHaveClass('text-fg-secondary')
    expect(introduction.closest('section')).toHaveClass('typo-body-01')
  })

  it('switches to the Figma privacy policy and preserves table geometry', async () => {
    const browserUser = userEvent.setup()
    const { container } = render(<PolicyDocumentsView />)

    await browserUser.click(screen.getByRole('tab', { name: '개인정보 처리 방침' }))

    const privacyTab = screen.getByRole('tab', { name: '개인정보 처리 방침' })
    expect(privacyTab).toHaveAttribute('aria-selected', 'true')
    expect(privacyTab).toHaveClass(
      'font-semibold!',
      'typo-title-02',
      'text-fg-tab-active',
    )
    expect(
      screen.getByText(/SynQ.*이용자의 개인정보를 중요시하며/),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    expect(screen.getAllByRole('table')).toHaveLength(1)
    expect(screen.getByText('간편 회원가입')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '3. 개인정보의 보유 및 이용 기간' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '4. 개인정보의 제3자 제공' })).not.toBeInTheDocument()

    const collectionColumns = container.querySelectorAll('table:first-of-type col')
    expect(collectionColumns[0]).toHaveStyle({ width: '180px' })
    expect(collectionColumns[2]).toHaveStyle({ width: '65px' })
  })
})
