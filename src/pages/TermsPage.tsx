import React from 'react'
import { useNavigate } from 'react-router-dom'

export const TermsPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center bg-[#F4F6F9] select-none p-4">
      <div className="w-full max-w-[480px] h-[640px] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-7 flex flex-col text-left">
        <div className="relative flex items-center justify-center pb-6 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="absolute left-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900">이용 약관</h1>
        </div>

        {/* Scrollable Content (내부 스크롤) */}
        <div className="flex-1 overflow-y-auto pt-6 pr-2 text-xs md:text-sm text-gray-600 space-y-6 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-800">SynQ 이용약관</p>
            <p className="text-gray-400 text-xs">시행일자: 2026년 7월 28일</p>
          </div>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제1조 (목적)</h2>
            <p>
              이 약관은 SynQ(이하 "회사")가 제공하는 프로젝트 맥락 기반 AI 회의 이해 보조 서비스
              "SynQ"(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타
              필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제2조 (용어의 정의)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                서비스: 회사가 제공하는 SynQ 웹 서비스 및 이에 부수하는 모든 기능을 의미합니다.
              </li>
              <li>
                회원: 이 약관에 동의하고 소셜 로그인을 통해 회사와 이용계약을 체결한 자를
                의미합니다.
              </li>
              <li>
                프로젝트: 회원이 팀원과 함께 자료, 회의 기록, 맥락 정보를 축적하는 단위 공간을
                의미합니다.
              </li>
              <li>
                회의: 프로젝트 내에서 진행되며 음성 녹음 및 실시간 전사가 이루어지는 세션을
                의미합니다.
              </li>
              <li>
                AI 정리: 회의 음성·전사와 프로젝트 맥락을 바탕으로 SynQ가 생성하는 힌트(의미·내
                영향·팀 질문), 전체 정리, 개인별 정리를 의미합니다.
              </li>
              <li>
                프로젝트 자료: 회원이 프로젝트에 업로드한 문서, 참고자료 등 일체의 콘텐츠를
                의미합니다.
              </li>
              <li>콘텐츠: 회원이 서비스 내에서 생성, 업로드, 게시한 모든 정보를 의미합니다.</li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>이 약관은 서비스 화면 또는 기타 방법으로 공지함으로써 효력을 발생합니다.</li>
              <li>
                회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자
                및 개정사유를 명시하여 사전 공지합니다.
              </li>
              <li>
                회원이 개정약관 시행일 이후에도 서비스를 계속 이용하는 경우 개정약관에 동의한 것으로
                봅니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제4조 (회원가입 및 계정 관리)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회원가입은 카카오, 네이버, 구글 등 회사가 제공하는 소셜 로그인을 통해 이루어집니다.
              </li>
              <li>
                회원은 본인의 계정 정보를 스스로 관리해야 하며, 계정 정보 유출 또는 제3자 사용에
                대한 책임은 회원에게 있습니다.
              </li>
              <li>
                회원은 가입 시 기본 역할·관점을 설정할 수 있으며, 프로젝트별로 이를 재설정할 수
                있습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제5조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다.</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>프로젝트 생성 및 참여</li>
              <li>프로젝트 자료·지난 회의 맥락 축적</li>
              <li>회의 생성 및 진행 (녹음, 실시간 전사 공유)</li>
              <li>SynQ 힌트 (의미·내 영향·팀 질문) 제공</li>
              <li>AI Chat을 통한 개인 질의응답</li>
              <li>회의 후 전체 정리 및 개인별 정리 제공</li>
              <li>프로젝트 단위 회의 기록 조회</li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제6조 (회원의 의무)</h2>
            <p>회원은 다음 행위를 해서는 안 됩니다.</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>타인의 계정을 무단으로 사용하는 행위</li>
              <li>회의 참가자 전원의 동의 없이 녹음 및 AI 처리를 진행하는 행위</li>
              <li>불법 자료, 타인의 저작권을 침해하는 자료를 프로젝트에 업로드하는 행위</li>
              <li>악성 코드, 스팸 등 서비스 운영을 방해하는 행위</li>
              <li>타인의 개인정보를 본인 동의 없이 프로젝트 자료로 업로드하는 행위</li>
            </ol>
            <p className="text-gray-500 pt-1">
              회의 녹음 및 AI 활용에 대해 다른 참가자의 동의를 받는 것은 회의를 진행하는 회원의
              책임입니다. 회사는 이를 위한 고지 기능을 제공하나, 실제 동의 확보의 책임은 회원에게
              있습니다.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제7조 (프로젝트 데이터의 소유권)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                프로젝트에 업로드된 자료 및 회의 기록(녹음, 전사, 전체 정리)의 소유권은 해당
                프로젝트의 소유자 및 작성자에게 있습니다.
              </li>
              <li>
                회사는 서비스 제공을 위해 필요한 범위 내에서만 이를 처리하며, 회원의 동의 없이 타
                목적으로 이용하지 않습니다.
              </li>
              <li>프로젝트 내 회의 기록과 전체 정리는 프로젝트 멤버 전원에게 공유됩니다.</li>
              <li>
                개인별 정리, AI 힌트, AI Chat 기록은 이를 생성한 해당 회원에게만 제공되며, 다른
                참여자나 프로젝트 관리자에게 공개되지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제8조 (AI 기능 이용에 관한 사항)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                SynQ 힌트, AI Chat 답변, 전체·개인별 정리는 AI가 생성한 참고 정보이며, 그 정확성과
                완전성을 보장하지 않습니다.
              </li>
              <li>
                AI가 추정한 의미, 영향, 질문은 사실 확인이나 팀의 최종 합의를 대체하지 않으며,
                담당자·일정·범위에 대한 최종 판단은 회원과 팀이 직접 내려야 합니다.
              </li>
              <li>
                회사는 회원의 회의 음성, 전사, 프로젝트 자료를 서비스 제공 목적 외의 AI 모델 학습에
                사용하지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제9조 (서비스의 변경 및 중단)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                회사는 서비스 개선을 위해 기능을 추가, 변경할 수 있으며 이 경우 사전에 공지합니다.
              </li>
              <li>
                회사는 시스템 점검, 서버 장애, 천재지변 등 불가피한 사유로 서비스 제공을 일시 중단할
                수 있습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제10조 (계약 해지 및 탈퇴)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>회원은 언제든지 서비스 내 기능을 통해 탈퇴를 요청할 수 있습니다.</li>
              <li>
                탈퇴 시 회원의 개인정보는 개인정보처리방침에 따라 처리되며, 프로젝트 자료 및 회의
                기록은 프로젝트 소유권 및 다른 멤버와의 공유 관계를 고려하여 처리됩니다.
              </li>
              <li>
                회원이 탈퇴하더라도 팀의 원활한 협업을 위해 공유 공간에 기록된 공통 회의 전사 및
                전체 정리는 삭제되지 않으며, 개인별 정리 및 개인 AI Chat 기록만 즉시 파기됩니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제11조 (책임의 제한)</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>회원은 AI가 생성한 결과를 최종 의사결정의 유일한 근거로 사용해서는 안 됩니다.</li>
              <li>
                회사는 AI가 생성한 정리, 힌트, 답변의 내용에 대해 발생한 손해에 대해 고의 또는
                중대한 과실이 없는 한 책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원 간 회의 녹음 동의와 관련하여 발생하는 분쟁에 대해 책임을 지지 않습니다.
              </li>
              <li>
                회사는 천재지변, 제3자(클라우드, API 제공사 등)의 서비스 장애로 인해 발생한 손해에
                대해 책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">제12조 (준거법 및 관할)</h2>
            <p>
              이 약관과 관련한 분쟁에 대해서는 대한민국 법령을 준거법으로 하며, 관련 법령에 따른
              관할 법원에 제소합니다.
            </p>
          </section>
        </div>
      </div>

      <footer className="mt-6 text-xs text-gray-400 text-center flex items-center gap-1.5">
        <span>다른 내용도 궁금하신가요?</span>
        <button
          type="button"
          onClick={() => navigate('/privacy')}
          className="text-[#0284C7] hover:underline font-medium"
        >
          개인정보 처리방침 보기
        </button>
      </footer>
    </div>
  )
}

export default TermsPage
