export type PrivacyPolicySection = {
  description?: string
  items?: readonly string[]
  title: string
}

export type PrivacyPolicyTable = {
  columns: readonly string[]
  rows: readonly (readonly string[])[]
}

export const privacyPolicyDocument = {
  effectiveDate: '2026년 7월 28일',
  name: 'SynQ 이용약관',
  introduction: [
    'SynQ(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.',
    '회사는 본 개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 목적과 방식으로 이용되며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.',
  ],
  collection: {
    title: '1. 수집하는 개인정보 항목',
    table: {
      columns: ['구분', '수집항목', '필수'],
      rows: [
        ['간편 회원가입', '이메일, 프로필 이름, 프로필 사진', 'O'],
        [
          '서비스 이용',
          '역할·관점 설정 정보, 프로젝트명, 회의 제목, 프로젝트 참여 정보',
          'O',
        ],
        [
          '회의 및 AI 기능 이용',
          '회의 음성 녹음, 실시간 전사 텍스트, 프로젝트 업로드 자료, AI Chat 질문 및 답변',
          'O',
        ],
        ['자동 수집 정보', 'IP 주소, 접속 기기 정보, 접속 로그, 쿠키', 'X'],
      ],
    } satisfies PrivacyPolicyTable,
    note: '※ 회의 음성에는 진행자 본인 외에 다른 회의 참가자의 음성 및 발화 내용이 포함될 수 있습니다. 이 경우 개인정보 수집의 근거는 회의를 진행하는 회원이 참가자로부터 받은 동의에 있으며, 회사는 회의 시작 전 녹음 및 AI 처리 여부를 참가자에게 고지할 수 있는 기능을 제공합니다.',
  },
  sections: [
    {
      title: '2. 개인정보의 수집 및 이용 목적',
      items: [
        '회원 식별 및 로그인 처리',
        '프로젝트·회의 생성, 참여, 관리',
        '회의 음성의 실시간 전사 제공',
        'SynQ 힌트(의미·내 영향·팀 질문), AI Chat 답변, 전체·개인별 정리 생성',
        '서비스 문의 및 불만 처리',
        '서비스 품질 개선 및 오류 분석',
      ],
    },
    {
      title: '3. 개인정보의 보유 및 이용 기간',
      items: [
        '회원 탈퇴 시 회원의 개인정보는 지체 없이 파기합니다.',
        '다만, 프로젝트 자료 및 회의 기록 중 다른 프로젝트 멤버와 공유된 정보(전사, 전체 정리)는 프로젝트가 삭제되거나 해당 회의 기록이 삭제될 때까지 보관될 수 있으며, 탈퇴한 회원의 개인별 정리·AI Chat 기록은 즉시 삭제됩니다.',
        '관계 법령에 따라 보존이 필요한 정보는 해당 법령이 정한 기간 동안 보관합니다.',
      ],
    },
  ] satisfies readonly PrivacyPolicySection[],
} as const
