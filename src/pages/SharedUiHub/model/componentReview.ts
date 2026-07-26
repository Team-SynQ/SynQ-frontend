export type ComponentStatus = 'implemented'

export type ComponentRouteKey =
  | 'design-tokens'
  | 'button'
  | 'input-box'
  | 'panel'
  | 'project-menu-item'
  | 'segment'
  | 'checkbox-radio'
  | 'badge'
  | 'modal'
  | 'toast'
  | 'empty-state'
  | 'logo'
  | 'live-status'
  | 'user-info'
  | 'chat-input'
  | 'modify-input'

export type ComponentReviewItem = {
  route: ComponentRouteKey
  title: string
  figmaNodes: string[]
  target: string
  status: ComponentStatus
  summary: string
}

export const componentReviewItems: ComponentReviewItem[] = [
  {
    route: 'design-tokens',
    title: 'Design Tokens',
    figmaNodes: ['521:247'],
    target: 'shared/styles, shared/config/theme',
    status: 'implemented',
    summary: '공통 UI가 참조하는 색상, 간격, radius, shadow, typography 토큰입니다.',
  },
  {
    route: 'button',
    title: 'Button',
    figmaNodes: ['523:490'],
    target: 'shared/ui/Button',
    status: 'implemented',
    summary:
      'Primary Fill, Primary Line, Fill Gray, Basic과 large, medium, small 크기를 제공합니다.',
  },
  {
    route: 'input-box',
    title: 'InputBox',
    figmaNodes: ['525:442', '673:4248'],
    target: 'shared/ui/InputBox',
    status: 'implemented',
    summary:
      'default, hover, active, error, disabled, filled 상태와 label, helper text, slot을 제공합니다.',
  },
  {
    route: 'panel',
    title: 'Panel',
    figmaNodes: ['565:1574'],
    target: 'shared/ui/Panel',
    status: 'implemented',
    summary: 'unfolded, fold 사이드 패널 컨테이너를 제공합니다.',
  },
  {
    route: 'project-menu-item',
    title: 'ProjectMenuItem',
    figmaNodes: ['568:559'],
    target: 'shared/ui/ProjectMenuItem',
    status: 'implemented',
    summary: '프로젝트 사이드 메뉴의 default, hover, active 상태를 제공합니다.',
  },
  {
    route: 'segment',
    title: 'Segment',
    figmaNodes: ['992:5121', '992:5179'],
    target: 'shared/ui/Segment',
    status: 'implemented',
    summary: 'Segment와 SegmentItem으로 탭형 전환 UI를 구성합니다.',
  },
  {
    route: 'checkbox-radio',
    title: 'Checkbox / Radio',
    figmaNodes: ['639:3586', '639:3582'],
    target: 'shared/ui/Checkbox, shared/ui/Radio',
    status: 'implemented',
    summary: 'Figma 기준의 커스텀 체크박스와 라디오 선택 UI를 제공합니다.',
  },
  {
    route: 'badge',
    title: 'Badge',
    figmaNodes: ['641:2295'],
    target: 'shared/ui/Badge',
    status: 'implemented',
    summary: 'Primary small, extraSmall 배지를 제공합니다.',
  },
  {
    route: 'modal',
    title: 'Modal',
    figmaNodes: ['574:1866', '1089:4807'],
    target: 'shared/ui/Modal',
    status: 'implemented',
    summary: 'confirm, form, info 타입으로 버튼 조합과 정보 박스 변형을 제공합니다.',
  },
  {
    route: 'toast',
    title: 'Toast',
    figmaNodes: ['642:1844', '1089:5216'],
    target: 'shared/ui/Toast',
    status: 'implemented',
    summary: 'success, error 타입과 default, compact 크기 변형을 제공합니다.',
  },
  {
    route: 'empty-state',
    title: 'EmptyState',
    figmaNodes: ['1358:14272'],
    target: 'shared/ui/EmptyState',
    status: 'implemented',
    summary: '데이터가 없는 상태를 안내하고 후속 액션을 연결합니다.',
  },
  {
    route: 'logo',
    title: 'Logo',
    figmaNodes: ['638:2160'],
    target: 'shared/ui/Logo',
    status: 'implemented',
    summary: 'wordmark, symbol 로고 변형을 제공합니다.',
  },
  {
    route: 'live-status',
    title: 'LiveStatus',
    figmaNodes: ['1159:5275'],
    target: 'shared/ui/LiveStatus',
    status: 'implemented',
    summary: 'Live, Offline 회의 연결 상태 pill을 제공합니다.',
  },
  {
    route: 'user-info',
    title: 'UserInfo',
    figmaNodes: ['1353:7967'],
    target: 'shared/ui/UserInfo',
    status: 'implemented',
    summary: 'Panel 하단 사용자 이름, 이메일, 프로필 표시를 제공합니다.',
  },
  {
    route: 'chat-input',
    title: 'ChatInput',
    figmaNodes: ['728:4209'],
    target: 'shared/ui/ChatInput',
    status: 'implemented',
    summary: '회의 중 AI Chat 질문 입력과 전송 액션을 제공합니다.',
  },
  {
    route: 'modify-input',
    title: 'ModifyInput',
    figmaNodes: ['1089:6413'],
    target: 'shared/ui/ModifyInput',
    status: 'implemented',
    summary: '전사나 텍스트 수정에 쓰는 단일 행 입력 UI를 제공합니다.',
  },
]

export const componentRouteKeys = new Set<ComponentRouteKey>(
  componentReviewItems.map((item) => item.route),
)

export const figmaFileKey = 'FHZ49MS3HLNgs6JOIv13HX'

export function getFigmaNodeUrl(nodeId: string) {
  return `https://www.figma.com/design/${figmaFileKey}/SynQ?node-id=${nodeId.replace(':', '-')}`
}
