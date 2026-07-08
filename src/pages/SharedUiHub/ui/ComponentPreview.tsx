import type { ReactNode } from 'react'

import {
  Badge,
  Button,
  ChatInput,
  Checkbox,
  EmptyState,
  InputBox,
  LiveStatus,
  Logo,
  Modal,
  ModifyInput,
  Panel,
  ProjectMenuItem,
  Radio,
  Segment,
  SegmentItem,
  Toast,
  UserInfo,
} from '../../../shared/ui'
import type { ComponentRouteKey } from '../model/componentReview'

export function ComponentPreview({ route }: { route: ComponentRouteKey }) {
  return <div className="flex min-w-0 flex-col gap-m">{renderPreview(route)}</div>
}

function renderPreview(route: ComponentRouteKey): ReactNode {
  switch (route) {
    case 'design-tokens':
      return <DesignTokensPreview />
    case 'button':
      return <ButtonPreview />
    case 'input-box':
      return <InputBoxPreview />
    case 'panel':
      return <PanelPreview />
    case 'project-menu-item':
      return <ProjectMenuItemPreview />
    case 'segment':
      return <SegmentPreview />
    case 'checkbox-radio':
      return <SelectionPreview />
    case 'badge':
      return <BadgePreview />
    case 'modal':
      return <ModalPreview />
    case 'toast':
      return <ToastPreview />
    case 'empty-state':
      return <EmptyStatePreview />
    case 'logo':
      return <LogoPreview />
    case 'live-status':
      return <LiveStatusPreview />
    case 'user-info':
      return <UserInfoPreview />
    case 'chat-input':
      return <ChatInputPreview />
    case 'modify-input':
      return <ModifyInputPreview />
  }
}

function DesignTokensPreview() {
  const colorTokens = [
    'bg-primary-100',
    'bg-primary-300',
    'bg-primary-500',
    'bg-gray-100',
    'bg-gray-300',
    'bg-gray-900',
  ]

  return (
    <>
      <div className="flex flex-wrap gap-xs">
        {colorTokens.map((colorToken) => (
          <span className={`${colorToken} rounded-s border-stroke-md border-line-default px-m py-l`} key={colorToken}>
            <span className="sr-only">{colorToken}</span>
          </span>
        ))}
      </div>
      <div className="grid gap-xs">
        <p className="typo-heading">Heading</p>
        <p className="typo-title-01">Title01</p>
        <p className="typo-title-02">Title02</p>
        <p className="typo-body-01">Body01</p>
        <p className="typo-body-02">Body02</p>
        <p className="typo-caption">Caption</p>
      </div>
    </>
  )
}

function ButtonPreview() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-s">
        <Button size="large">Primary</Button>
        <Button size="large" variant="primaryLine">
          Primary Line
        </Button>
        <Button size="large" variant="fillGray100">
          Gray
        </Button>
        <Button size="large" variant="basic">
          Basic
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-s">
        <Button size="medium">Medium</Button>
        <Button size="small">Small</Button>
        <Button disabled size="large">
          Disabled
        </Button>
      </div>
    </>
  )
}

function InputBoxPreview() {
  return (
    <div className="grid gap-s">
      <InputBox label="프로젝트명" placeholder="프로젝트명을 입력하세요" size="large" />
      <InputBox label="검색" placeholder="회의록 검색" visualState="active" />
      <InputBox errorText="필수 입력 항목입니다" label="역할" placeholder="역할을 입력하세요" />
      <InputBox disabled label="비활성 입력" placeholder="입력할 수 없습니다" />
    </div>
  )
}

function PanelPreview() {
  return (
    <div className="flex flex-wrap gap-m">
      <Panel
        footer={<UserInfo email="hong@synq.ai" name="홍길동" />}
        header={
          <div className="flex w-full items-center justify-between gap-s">
            <Logo />
            <Button size="small" variant="basic">
              접기
            </Button>
          </div>
        }
        type="unfolded"
      >
        <ProjectMenuItem visualState="active">회의 보조 AI, 씽큐</ProjectMenuItem>
        <ProjectMenuItem>서비스 디자인</ProjectMenuItem>
      </Panel>
      <Panel header={<Logo variant="symbol" />} type="fold" />
    </div>
  )
}

function ProjectMenuItemPreview() {
  return (
    <div className="grid max-w-[172px] gap-xs">
      <ProjectMenuItem>Default</ProjectMenuItem>
      <ProjectMenuItem visualState="hover">Hover</ProjectMenuItem>
      <ProjectMenuItem visualState="active">Active</ProjectMenuItem>
    </div>
  )
}

function SegmentPreview() {
  return (
    <Segment>
      <SegmentItem visualState="active">요약</SegmentItem>
      <SegmentItem>원문</SegmentItem>
    </Segment>
  )
}

function SelectionPreview() {
  return (
    <div className="flex flex-wrap gap-s">
      <Checkbox defaultChecked label="체크됨" />
      <Checkbox label="체크 안 됨" />
      <Radio defaultChecked label="선택됨" name="review-radio" />
      <Radio label="선택 안 됨" name="review-radio" />
    </div>
  )
}

function BadgePreview() {
  return (
    <div className="flex flex-wrap gap-xs">
      <Badge>진행중</Badge>
      <Badge size="extraSmall">새 회의</Badge>
    </div>
  )
}

function ModalPreview() {
  return (
    <div className="grid gap-m xl:grid-cols-2">
      <Modal description="선택한 회의 기록을 삭제하면 다시 복구할 수 없습니다." title="회의 기록을 삭제할까요?" />
      <Modal cancelLabel="닫기" title="회의 이해 힌트" type="info">
        역할별 영향을 다시 확인하고 팀과 맞출 질문을 정리하세요.
      </Modal>
    </div>
  )
}

function ToastPreview() {
  return (
    <div className="grid gap-m">
      <Toast description="프로젝트 설정이 반영되었습니다." title="저장되었습니다" type="success" />
      <Toast description="잠시 후 다시 시도해주세요." title="저장에 실패했습니다" type="error" />
      <Toast description="Sub Title" size="compact" title="Title" type="success" />
    </div>
  )
}

function EmptyStatePreview() {
  return (
    <EmptyState
      action={<Button variant="primaryLine">프로젝트 만들기</Button>}
      description="새 프로젝트를 만들고 회의 자료를 연결해보세요."
      title="아직 프로젝트가 없습니다"
    />
  )
}

function LogoPreview() {
  return (
    <div className="flex flex-wrap items-center gap-m">
      <Logo />
      <Logo variant="symbol" />
    </div>
  )
}

function LiveStatusPreview() {
  return (
    <div className="flex flex-wrap gap-s">
      <LiveStatus status="live" />
      <LiveStatus status="offline" />
    </div>
  )
}

function UserInfoPreview() {
  return (
    <div className="grid max-w-[172px] gap-xs">
      <UserInfo email="hong@synq.ai" name="홍길동" />
      <UserInfo email="hong@synq.ai" name="홍길동" visualState="hover" />
      <UserInfo email="hong@synq.ai" name="홍길동" visualState="active" />
    </div>
  )
}

function ChatInputPreview() {
  return <ChatInput placeholder="팀과 맞춰야 할 질문을 입력하세요" />
}

function ModifyInputPreview() {
  return <ModifyInput defaultValue="회의 중 나온 결정 사항을 수정합니다." />
}
