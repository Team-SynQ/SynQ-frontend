import { useState } from 'react'

import { cn } from '../../../shared/lib/cn'
import { PrivacyPolicyContent } from './PrivacyPolicyContent'
import { TermsDocumentContent } from './TermsDocumentContent'

type PolicyDocumentTab = 'privacy' | 'terms'

const policyTabs = [
  { id: 'terms' as const, label: '이용 약관' },
  { id: 'privacy' as const, label: '개인정보 처리 방침' },
]

export function PolicyDocumentsView() {
  const [activeTab, setActiveTab] = useState<PolicyDocumentTab>('terms')

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-l self-stretch overflow-hidden">
      <header className="flex shrink-0 flex-col gap-xs">
        <h1 className="m-0 typo-title-01 text-fg-primary">정책 문서</h1>
        <div
          aria-label="정책 문서 유형"
          className="flex w-full border-b-2 border-line-strong"
          role="tablist"
        >
          {policyTabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                aria-selected={isActive}
                className={cn(
                  'h-[64px] w-[190px] border-b-2 px-m typo-title-02',
                  isActive
                    ? 'border-fg-primary font-semibold! text-fg-tab-active'
                    : 'border-transparent text-fg-secondary',
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      {activeTab === 'terms' ? <TermsDocumentContent /> : <PrivacyPolicyContent />}
    </section>
  )
}
