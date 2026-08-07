import React from 'react'
import { useNavigate } from 'react-router-dom'

export const PrivacyPage: React.FC = () => {
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
          <h1 className="text-base font-bold text-gray-900">개인정보 처리방침</h1>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pr-2 text-xs md:text-sm text-gray-600 space-y-6 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-800">SynQ 이용약관</p>
            <p className="text-gray-400 text-xs">시행일자: 2026년 7월 28일</p>
          </div>

          <p className="font-semibold text-gray-800 leading-snug">
            SynQ(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을
            준수하고 있습니다.
            <span className="block font-normal text-gray-600 pt-1">
              회사는 본 개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 목적과 방식으로
              이용되며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </span>
          </p>

          <section className="space-y-3">
            <h2 className="font-bold text-gray-900">1. 수집하는 개인정보 항목</h2>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#BAE6FD] text-[#0284C7] font-bold text-center">
                    <th className="py-2 px-2 border-r border-gray-100 w-[28%]">구분</th>
                    <th className="py-2 px-2 border-r border-gray-100">수집항목</th>
                    <th className="py-2 px-2 w-[18%]">필수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      간편 회원가입
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-100">
                      이메일, 프로필 이름, 프로필 사진
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-gray-800">O</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      서비스 이용
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-100">
                      역할·관점 설정 정보, 프로젝트명, 회의 제목, 프로젝트 참여 정보
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-gray-800">O</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      회의 및 AI 기능 이용
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-100">
                      회의 음성 녹음, 실시간 전사 텍스트, 프로젝트 업로드 자료, AI Chat 질문 및 답변
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-gray-800">O</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      자동 수집 정보
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-100">
                      IP 주소, 접속 기기 정보, 접속 로그, 쿠키
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-gray-800">X</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              ※ 회의 음성에는 진행자 본인 외에 다른 회의 참가자의 음성 및 발화 내용이 포함될 수
              있습니다. 이 경우 개인정보 수집의 근거는 회의를 진행하는 회원이 참가자로부터 받은
              동의에 있으며, 회사는 회의 시작 전 녹음 및 AI 처리 여부를 참가자에게 고지할 수 있는
              기능을 제공합니다.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">2. 개인정보의 수집 및 이용 목적</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>회원 식별 및 로그인 처리</li>
              <li>프로젝트·회의 생성, 참여, 관리</li>
              <li>회의 음성의 실시간 전사 제공</li>
              <li>SynQ 힌트(의미·내 영향·팀 질문), AI Chat 답변, 전체·개인별 정리 생성</li>
              <li>서비스 문의 및 불만 처리</li>
              <li>서비스 품질 개선 및 오류 분석</li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>회원 탈퇴 시 회원의 개인정보는 지체 없이 파기합니다.</li>
              <li>
                다만, 프로젝트 자료 및 회의 기록 중 다른 프로젝트 멤버와 공유된 정보(전사, 전체
                정리)는 프로젝트가 삭제되거나 해당 회의 기록이 삭제될 때까지 보관될 수 있으며,
                탈퇴한 회원의 개인별 정리·AI Chat 기록은 즉시 삭제됩니다.
              </li>
              <li>관계 법령에 따라 보존이 필요한 정보는 해당 법령이 정한 기간 동안 보관합니다.</li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우는
              예외로 합니다.
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
                요구가 있는 경우
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-gray-900">5. 개인정보 처리 위탁</h2>
            <p>서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#BAE6FD] text-[#0284C7] font-bold text-center">
                    <th className="py-2 px-2 border-r border-gray-100 w-[40%]">수탁업체</th>
                    <th className="py-2 px-2">위탁업무 내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      AWS (Amazon Web Services)
                    </td>
                    <td className="py-2.5 px-2">서버 호스팅, 데이터 저장</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      OpenAI, Gemini
                    </td>
                    <td className="py-2.5 px-2">
                      회의 음성의 텍스트 전사, AI 정리·힌트·Chat 응답 생성
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 border-r border-gray-100 font-medium text-center bg-gray-50/50">
                      카카오, 네이버, 구글
                    </td>
                    <td className="py-2.5 px-2">
                      회의 음성 녹음·소셜 로그인 인증, 실시간 전사 텍스트, 프로젝트 업로드 자료, AI
                      Chat 질문 및 답변
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              ※ 회사는 회의 음성, 전사, 프로젝트 자료를 AI 처리 목적 외의 별도 AI 모델 학습 데이터로
              사용하지 않으며, 위탁업체에도 이를 요구하지 않습니다.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">6. 이용자의 권리와 행사 방법</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
                <ul className="list-alpha list-inside pl-4 pt-1 space-y-0.5 text-gray-500">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리 정지 요구</li>
                </ul>
              </li>
              <li>
                권리 행사는 서비스 내 설정 화면 또는 아래 문의처를 통해 요청할 수 있으며, 회사는
                지체 없이 조치합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">7. 개인정보의 파기 절차 및 방법</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>이용 목적이 달성되거나 보유 기간이 경과한 개인정보는 지체 없이 파기합니다.</li>
              <li>전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
            </ol>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">8. 쿠키(Cookie)의 운영</h2>
            <p>
              회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다. 이용자는
              브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우 서비스 이용에 일부 제한이
              있을 수 있습니다.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">9. 개인정보의 안전성 확보 조치</h2>
            <p>회사는 개인정보 보호를 위해 다음 조치를 취하고 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>통신 구간 암호화(HTTPS 등) 적용</li>
              <li>개인정보에 대한 접근 권한 최소화 및 관리</li>
              <li>
                개인별 정리, AI Chat 기록 등 개인 전용 데이터에 대한 접근 통제 (본인만 조회 가능)
              </li>
            </ol>
          </section>

          {/* 10. 고지의 의무 */}
          <section className="space-y-1">
            <h2 className="font-bold text-gray-900">10. 고지의 의무</h2>
            <p>
              이 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 경우 개정 최소 7일 전부터 서비스
              내 공지사항을 통해 고지합니다.
            </p>
          </section>
        </div>
      </div>

      <footer className="mt-6 text-xs text-gray-400 text-center flex items-center gap-1.5">
        <span>다른 내용도 궁금하신가요?</span>
        <button
          type="button"
          onClick={() => navigate('/terms')}
          className="text-[#0284C7] hover:underline font-medium"
        >
          이용 약관 보기
        </button>
      </footer>
    </div>
  )
}

export default PrivacyPage
