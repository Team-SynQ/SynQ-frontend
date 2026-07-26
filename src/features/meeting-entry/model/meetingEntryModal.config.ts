export const meetingEntryModalVariants = [
  'startConfirmation',
  'microphonePermissionRequired',
  'microphonePermissionFailed',
  'projectAccessDenied',
  'recordingUnsupported',
  'meetingStartFailed',
  'activeMeetingFound',
  'sessionExpired',
] as const

export type MeetingEntryModalVariant = (typeof meetingEntryModalVariants)[number]

type MeetingEntryModalContent = {
  title: string
  description?: string
  notice?: string
  actions: {
    primary: string
    secondary?: string
  }
}

export const meetingEntryModalContent: Record<MeetingEntryModalVariant, MeetingEntryModalContent> =
  {
    startConfirmation: {
      title: '회의를 시작할까요?',
      description:
        '이 회의는 실시간으로 전사되며, SynQ가 프로젝트 자료와 지난 회의 맥락을 함께 참고해 회의 중 이해를 돕습니다.',
      notice: '회의 참여자에게 녹음 및 전사 사용 사실을 고지한 뒤 시작해 주세요.',
      actions: {
        primary: '동의하고 시작',
        secondary: '취소',
      },
    },
    microphonePermissionRequired: {
      title: '마이크 접근 권한이 필요합니다.',
      notice: '회의를 녹음하고 전사하려면 마이크 사용 권한이 필요합니다.',
      actions: {
        primary: '권한 허용하기',
        secondary: '취소',
      },
    },
    microphonePermissionFailed: {
      title: '마이크 권한을 확인하지 못했습니다.\n다시 시도해 주세요',
      actions: {
        primary: '닫기',
      },
    },
    projectAccessDenied: {
      title: '이 프로젝트에서 회의를 시작할 수 없습니다.',
      actions: {
        primary: '닫기',
      },
    },
    recordingUnsupported: {
      title: '현재 환경에서는 녹음을 사용할 수 없습니다.',
      notice: '현재 브라우저 또는 기기에서 녹음을 지원하지 않습니다',
      actions: {
        primary: '닫기',
      },
    },
    meetingStartFailed: {
      title: '회의를 시작하지 못했습니다.\n다시 시도해 주세요.',
      actions: {
        primary: '다시 시도하기',
        secondary: '취소',
      },
    },
    activeMeetingFound: {
      title: '현재 진행 중인 회의가 있습니다.',
      actions: {
        primary: '회의 참여하기',
        secondary: '취소',
      },
    },
    sessionExpired: {
      title: '로그인이 만료되었습니다.\n다시 로그인 후 이용해주세요.',
      actions: {
        primary: '로그인하기',
        secondary: '취소',
      },
    },
  }
