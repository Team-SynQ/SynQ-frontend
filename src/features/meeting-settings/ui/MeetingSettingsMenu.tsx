import { useRef, useState } from 'react'

export type MeetingMember = {
  id: string
  name: string
  role?: string
  isOwner?: boolean
  avatarUrl?: string
}

type MeetingSettingsMenuProps = {
  members?: MeetingMember[]
  onEditTitle?: () => void
  onDeleteMeeting?: () => void
  onManageMembers?: () => void
  onInviteMember?: () => void
}

export function MeetingSettingsMenu({
  members = [],
  onEditTitle,
  onDeleteMeeting,
  onManageMembers,
  onInviteMember,
}: MeetingSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex size-8 items-center justify-center rounded-m hover:bg-surface-muted transition-colors"
        aria-label="더보기 메뉴"
      >
        <svg className="size-5 text-fg-secondary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-[280px] rounded-l border border-line-default bg-surface-default p-m shadow-floating text-fg-primary">
            <div className="flex items-center justify-between pb-s border-b border-line-default">
              <div className="flex items-center gap-xs font-medium typo-body-01">
                <svg className="size-4 text-fg-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>멤버</span>
                <span className="typo-caption text-fg-tertiary">{members.length} / 10</span>
              </div>
              <div className="flex items-center gap-s">
                <button
                  onClick={onInviteMember}
                  className="flex items-center gap-1 typo-caption text-brand-primary font-medium hover:underline"
                >
                  {/* 수정된 링크/초대 아이콘 */}
                  <svg className="size-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>초대</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-fg-tertiary hover:text-fg-primary">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="py-s space-y-s border-b border-line-default max-h-[160px] overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between typo-body-02">
                  <div className="flex items-center gap-xs min-w-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="size-6 rounded-full object-cover" />
                    ) : (
                      <div className="size-6 rounded-full bg-surface-muted flex items-center justify-center text-fg-secondary font-medium typo-caption">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <span className="truncate text-fg-primary font-medium">
                      {member.name}{member.role ? `/${member.role}` : ''}
                    </span>
                  </div>
                  {member.isOwner && (
                    <span className="shrink-0 px-xs py-[2px] bg-brand-primary/10 text-brand-primary typo-caption font-semibold rounded">
                      소유자
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-s space-y-xs typo-body-02 font-medium text-fg-secondary">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onManageMembers?.()
                }}
                className="w-full flex items-center gap-xs px-xs py-s rounded-m hover:bg-surface-muted transition-colors text-left"
              >
                <svg className="size-4 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>멤버 관리</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onEditTitle?.()
                }}
                className="w-full flex items-center gap-xs px-xs py-s rounded-m hover:bg-surface-muted transition-colors text-left"
              >
                <svg className="size-4 text-fg-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>회의 제목 수정하기</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onDeleteMeeting?.()
                }}
                className="w-full flex items-center gap-xs px-xs py-s rounded-m hover:bg-surface-muted transition-colors text-left text-status-negative"
              >
                <svg className="size-4 text-status-negative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>회의 삭제하기</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}