import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import './marketingLanding.css'

export type MarketingLandingPageProps = {
  /** '씽큐 시작하기'를 눌렀을 때. 로그인 여부에 따른 진입 경로는 호출자가 정한다. */
  onStart: () => void
}

/**
 * 배경에 흐르는 파도. 층마다 진폭·주기·속도가 달라 서로 어긋나며 겹친다.
 * color 는 rgba() 에 그대로 끼워 넣으려고 성분만 담았다.
 */
const WAVE_LAYERS = [
  { amp: 0.09, freq: 1.1, speed: 0.22, y: 0.62, alpha: 0.1, color: '0,144,255' },
  { amp: 0.12, freq: 0.8, speed: -0.17, y: 0.72, alpha: 0.08, color: '87,182,255' },
  { amp: 0.07, freq: 1.6, speed: 0.3, y: 0.84, alpha: 0.07, color: '20,88,183' },
  { amp: 0.1, freq: 0.6, speed: -0.12, y: 0.95, alpha: 0.09, color: '0,144,255' },
]

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * 서비스 소개 랜딩. 도메인을 앱과 합치면서 루트('/')가 이 화면이 되었다.
 * 스타일은 marketingLanding.css 한 벌로 두고 .marketing-landing 아래로만 적용한다.
 */
export function MarketingLandingPage({ onStart }: MarketingLandingPageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 배경색·부드러운 스크롤은 html·body 에 걸려야 해서, 이 화면이 떠 있는 동안만 표시를 남긴다.
  useEffect(() => {
    const { documentElement, body } = document
    documentElement.classList.add('marketing-landing-page')
    body.classList.add('marketing-landing-page')

    return () => {
      documentElement.classList.remove('marketing-landing-page')
      body.classList.remove('marketing-landing-page')
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    // 테스트 환경(jsdom)에는 2D 컨텍스트가 없다. 배경일 뿐이니 조용히 넘어간다.
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let scrollY = window.scrollY
    let smoothScroll = scrollY
    let frame = 0

    const resize = () => {
      // 고해상도 화면에서 선이 뭉개지지 않게 맞추되, 2배를 넘기면 비용만 커진다.
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (time: number) => {
      // 스크롤 값을 그대로 쓰면 파도가 튄다. 목표값을 조금씩 따라가 부드럽게 만든다.
      smoothScroll += (scrollY - smoothScroll) * 0.08
      const shift = smoothScroll * 0.0025
      const lift = Math.min(smoothScroll / 900, 1)

      ctx.clearRect(0, 0, width, height)

      WAVE_LAYERS.forEach((layer, index) => {
        const phase =
          time * 0.0006 * layer.speed * 4 + shift * (index % 2 ? -1 : 1) * (1 + index * 0.3)
        const base = height * (layer.y - lift * 0.28 * (1 - index * 0.15))
        const amplitude = height * layer.amp

        ctx.beginPath()
        ctx.moveTo(0, height)
        for (let x = 0; x <= width; x += 8) {
          const nx = x / width
          ctx.lineTo(
            x,
            base +
              Math.sin(nx * Math.PI * 2 * layer.freq + phase) * amplitude +
              Math.sin(nx * Math.PI * 2 * layer.freq * 2.3 - phase * 0.7) * amplitude * 0.28,
          )
        }
        ctx.lineTo(width, height)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, base - amplitude, 0, height)
        gradient.addColorStop(0, `rgba(${layer.color},${layer.alpha})`)
        gradient.addColorStop(1, `rgba(${layer.color},0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })
    }

    const handleScroll = () => {
      scrollY = window.scrollY
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    if (prefersReducedMotion()) {
      draw(0)
    } else {
      const loop = (time: number) => {
        draw(time)
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.rv'))
    const viewportHeight = window.innerHeight
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.remove('pre')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    // 첫 화면에 이미 보이는 것은 숨기지 않는다. 아래쪽에 있는 것만 나타나게 한다.
    targets.forEach((element) => {
      if (element.getBoundingClientRect().top <= viewportHeight * 0.9) return
      element.classList.add('pre')
      observer.observe(element)
    })

    // 관찰이 어긋나더라도 내용이 영영 숨어 있으면 안 된다.
    const safetyTimer = window.setTimeout(() => {
      targets.forEach((element) => {
        if (element.getBoundingClientRect().top < viewportHeight) element.classList.remove('pre')
      })
    }, 3000)

    return () => {
      observer.disconnect()
      window.clearTimeout(safetyTimer)
    }
  }, [])

  return (
    <div className="marketing-landing" ref={rootRef}>
      <canvas aria-hidden="true" id="waves" ref={canvasRef} />

      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="SynQ 홈">
            <img src="/assets/images/landing-wordmark.png" alt="SynQ" />
          </a>
          <nav className="nav-links" aria-label="페이지 내 이동">
            <a href="#problem">왜 SynQ인가</a>
            <a href="#features">핵심 기능</a>
            <a href="#flow">사용 흐름</a>
            <a href="#roles">역할과 관점</a>
          </nav>
          <button className="btn btn-primary" onClick={onStart} type="button">
            씽큐 시작하기
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="hero-grid" aria-hidden="true"></div>
          <div className="wrap">
            <div className="hero-inner">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true"></span>회의 중에 함께 듣고, 함께 이해하는
                AI
              </span>
              <h1>
                같이 들었지만
                <br />
                <em>다르게 이해하는 순간</em>을 없앱니다
              </h1>
              <p className="lead">
                SynQ는 프로젝트 자료와 지난 회의 맥락을 학습한 AI가 회의 중 실시간으로 발언의
                <strong>의미</strong>, <strong>내 역할에 미치는 영향</strong>,
                <strong>팀과 맞춰야 할 질문</strong>을 연결해 주는 협업 AI입니다.
              </p>
              <div className="hero-cta">
                <button className="btn btn-primary btn-lg" onClick={onStart} type="button">
                  씽큐 시작하기
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <a className="btn btn-ghost btn-lg" href="#features">
                  핵심 기능 보기
                </a>
              </div>
              <p className="hero-note">
                카카오 · 네이버 · 구글 계정으로 바로 시작 · 데스크톱 브라우저에 최적화
              </p>
            </div>

            <div className="frame-wrap">
              <div className="hint-float a">
                <b>의미</b>
                <span>온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.</span>
              </div>
              <div className="hint-float b">
                <b>내 영향</b>
                <span>일정과 리소스 배분에 영향이 있을 수 있습니다.</span>
              </div>
              <div className="hint-float c">
                <b>팀 질문</b>
                <span>온보딩 개선의 완료 기준은 무엇인가요?</span>
              </div>
              <div className="frame">
                <div className="frame-bar" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                  <div className="url">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    synqai.co.kr
                  </div>
                </div>
                <img
                  src="/assets/images/onboarding-step1.png"
                  alt="SynQ 실시간 회의 화면 — 왼쪽에 전체 전사와 SynQ 힌트(의미·내 영향·팀 질문), 오른쪽에 AI Chat"
                  width="1373"
                  height="993"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="problem" id="problem">
          <div className="wrap">
            <div className="sec-head rv">
              <div className="kicker">Why SynQ</div>
              <h2>회의는 함께 하지만, 이해는 항상 함께 이루어지지 않습니다</h2>
              <p>
                같은 문장을 들어도 각자 먼저 떠올리는 것이 다릅니다. 그 간극은 회의가 끝난 뒤에야
                드러나고, 다시 맞추는 데 또 다른 회의가 필요해집니다.
              </p>
            </div>

            <div className="quote rv" style={{ '--d': '140ms' } as CSSProperties}>
              <span className="t">16:02</span>
              <span>
                “일정을 조금 타이트하게 잡아봤는데요. 온보딩 개선을 4월 말까지 베타로 제공하고 5월
                초 정식 릴리즈를 목표로 하고 있습니다.”
              </span>
            </div>
            <div className="readings">
              <div className="reading rv" style={{ '--d': '320ms' } as CSSProperties}>
                <span className="role">PM</span>
                <h3>일정과 범위</h3>
                <p>
                  베타 4월 말, 정식 5월 초. QA 기간은 확보되는지, 어디까지가 베타 범위인지부터
                  계산합니다.
                </p>
              </div>
              <div className="reading rv" style={{ '--d': '500ms' } as CSSProperties}>
                <span className="role d">디자이너</span>
                <h3>화면에 미치는 영향</h3>
                <p>
                  온보딩 3단계 화면이 전부 바뀌는지, 디자인 완료 일정이 개발 착수 전에 맞춰지는지를
                  먼저 떠올립니다.
                </p>
              </div>
              <div className="reading rv" style={{ '--d': '680ms' } as CSSProperties}>
                <span className="role v">개발자</span>
                <h3>구현 난이도와 리스크</h3>
                <p>
                  결제 모듈 연동 테스트와 일정이 겹치는지, 예외 케이스 처리에 얼마나 걸릴지를
                  계산합니다.
                </p>
              </div>
            </div>
            <p className="problem-foot rv" style={{ '--d': '860ms' } as CSSProperties}>
              SynQ는 이 <strong>같이 들었지만 다르게 이해하는 순간</strong>을 회의 중에 바로
              좁힙니다. 놓친 의미를 즉시 이해하고, 내 역할 기준의 영향을 파악하고, 팀과 맞춰야 할
              질문을 놓치지 않도록.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features">
          <div className="wrap">
            <div className="sec-head center rv">
              <div className="kicker">Core features</div>
              <h2>회의 중, 회의 후, 그리고 그 다음 회의까지</h2>
              <p>기록보다 이해, 이해보다 실행까지. SynQ는 회의의 세 순간을 하나로 잇습니다.</p>
            </div>

            <div className="feature" style={{ marginTop: '72px' }}>
              <div className="f-text rv from-left">
                <div className="f-num">01 — 회의 중</div>
                <h3>실시간 전사 위에, 발언마다 SynQ 힌트</h3>
                <p>
                  회의를 녹음하면 발언이 실시간으로 전사됩니다. 중요한 발언에는 SynQ가 프로젝트
                  자료와 지난 회의를 근거로 세 가지 힌트를 붙여 줍니다.
                </p>
                <div className="hint-card" aria-label="SynQ 힌트 예시">
                  <div className="hc-title">
                    <span>SynQ 힌트</span>
                    <span aria-hidden="true">⌄</span>
                  </div>
                  <div className="row">
                    <b>의미</b>
                    <span>온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.</span>
                  </div>
                  <div className="row">
                    <b>내 영향</b>
                    <span>일정과 리소스 배분에 영향이 있을 수 있습니다.</span>
                  </div>
                  <div className="row">
                    <b>팀 질문</b>
                    <span>온보딩 개선의 완료 기준은 무엇인가요?</span>
                  </div>
                </div>
              </div>
              <div
                className="f-media crop rv from-right zoom"
                style={{ '--d': '120ms' } as CSSProperties}
              >
                <div className="shot">
                  <img
                    src="/assets/images/onboarding-step1.png"
                    alt="실시간 전사와 SynQ 힌트가 표시된 회의 화면"
                  />
                </div>
              </div>
            </div>

            <div className="feature flip">
              <div className="f-text rv from-right">
                <div className="f-num">02 — 회의 중</div>
                <h3>흐름을 끊지 않고, 궁금한 발언을 골라 바로 질문</h3>
                <p>
                  이해가 필요한 순간 발언을 선택해 “AI에게 질문하기”를 누르면, 그 발언을 고정한 채
                  나만의 AI Chat에서 바로 물어볼 수 있습니다. 답변은 PRD 같은 프로젝트 자료와 지난
                  회의 기록을 근거로 돌아옵니다.
                </p>
                <ul className="f-list">
                  <li className="rv" style={{ '--d': '160ms' } as CSSProperties}>
                    “이 일정의 현실성과 리스크를 분석해 줘” — 답변 끝에 출처(현재 회의 10:04 ·
                    PRD.pdf)를 함께 표시
                  </li>
                  <li className="rv" style={{ '--d': '250ms' } as CSSProperties}>
                    “지난 회의에서는 이 범위 어디까지 정했어?” — 지난 회의 맥락까지 이어서 답변
                  </li>
                  <li className="rv" style={{ '--d': '340ms' } as CSSProperties}>
                    내 질문과 답변은 나에게만 보이는 개인 AI Chat에 남습니다
                  </li>
                </ul>
              </div>
              <div
                className="f-media crop crop-right rv from-left zoom"
                style={{ '--d': '120ms' } as CSSProperties}
              >
                <div className="shot">
                  <img
                    src="/assets/images/onboarding-step2.png"
                    alt="발언을 고정하고 AI Chat에 질문한 화면 — 일정 리스크 분석 답변과 PRD.pdf 출처"
                  />
                </div>
              </div>
            </div>

            <div className="feature">
              <div className="f-text rv from-left">
                <div className="f-num">03 — 회의 후</div>
                <h3>회의가 끝나면, 내 역할과 관점 기준으로 자동 정리</h3>
                <p>
                  종료와 동시에 전사본이 저장되고, 참여자마다 다른 정리본이 만들어집니다. PM에게는
                  일정·범위·의사결정 중심으로, 개발자에게는 기술 리스크 중심으로.
                </p>
                <ul className="f-list">
                  <li className="rv" style={{ '--d': '160ms' } as CSSProperties}>
                    내 관점 요약 · 나에게 영향 있는 내용 · 내 액션 아이템
                  </li>
                  <li className="rv" style={{ '--d': '250ms' } as CSSProperties}>
                    다시 확인하면 좋은 질문 — 팀과 맞춰야 할 것을 놓치지 않도록
                  </li>
                  <li className="rv" style={{ '--d': '340ms' } as CSSProperties}>
                    개인별 정리 / 전체 정리 / 전체 전사를 오가며 확인, 회의 후에도 AI Chat 이어가기
                  </li>
                </ul>
              </div>
              <div
                className="f-media rv from-right zoom"
                style={{ '--d': '120ms' } as CSSProperties}
              >
                <div className="shot">
                  <img
                    src="/assets/images/onboarding-step3.png"
                    alt="회의 기록 화면 — PM 관점 요약, 나에게 영향 있는 내용, 내 액션 아이템, 다시 확인하면 좋은 질문"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="flow" id="flow">
          <div className="wrap">
            <div className="sec-head center rv">
              <div className="kicker">How it works</div>
              <h2>프로젝트 하나로 시작해, 회의가 쌓일수록 똑똑해집니다</h2>
              <p>
                SynQ는 회의를 프로젝트 단위로 묶습니다. 자료와 지난 회의가 쌓일수록 다음 회의의
                힌트와 답변이 정확해집니다.
              </p>
            </div>
            <div className="steps">
              <div className="step rv" style={{ '--d': '0ms' } as CSSProperties}>
                <div className="n">1</div>
                <h3>프로젝트 만들기</h3>
                <p>
                  프로젝트를 만들고 초대 링크로 팀원을 부릅니다. 참여자는 각자 역할과 관점을
                  설정합니다.
                </p>
              </div>
              <div className="step rv" style={{ '--d': '110ms' } as CSSProperties}>
                <div className="n">2</div>
                <h3>참고 자료 올리기</h3>
                <p>
                  PRD, 기획서, 디자인 문서 등 프로젝트 자료를 올리면 AI가 회의의 근거로 사용합니다.
                </p>
              </div>
              <div className="step rv" style={{ '--d': '220ms' } as CSSProperties}>
                <div className="n">3</div>
                <h3>회의 시작</h3>
                <p>
                  마이크만 켜면 됩니다. 실시간 전사와 SynQ 힌트, 개인 AI Chat이 회의를 따라갑니다.
                </p>
              </div>
              <div className="step rv" style={{ '--d': '330ms' } as CSSProperties}>
                <div className="n">4</div>
                <h3>기록으로 남기기</h3>
                <p>
                  종료하면 자동으로 정리됩니다. 이 기록은 다음 회의의 맥락이 되어 다시 쓰입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles">
          <div className="wrap">
            <div className="sec-head rv">
              <div className="kicker">Role &amp; perspective</div>
              <h2>같은 회의, 나에게 맞춘 정리</h2>
              <p>
                가입할 때 역할과 관심 관점을 고르면, 힌트의 “내 영향”과 회의 후 정리가 그 기준으로
                맞춰집니다. 프로젝트마다 다르게 설정할 수도 있습니다.
              </p>
            </div>
            <div className="two">
              <div className="rv from-left">
                <h3>역할</h3>
                <div className="sub">내가 회의에서 맡는 일</div>
                <div className="chips">
                  <span className="chip on">기획 · 운영</span>
                  <span className="chip">디자인 · 콘텐츠</span>
                  <span className="chip">개발 · 기술</span>
                  <span className="chip">마케팅 · 브랜딩</span>
                  <span className="chip">영업 · 고객</span>
                  <span className="chip">데이터 · 리서치</span>
                  <span className="chip">전략 · 경영</span>
                  <span className="chip">기타</span>
                </div>
              </div>
              <div className="rv from-right" style={{ '--d': '120ms' } as CSSProperties}>
                <h3>관심 관점</h3>
                <div className="sub">회의에서 내가 먼저 챙기는 것</div>
                <div className="chips">
                  <span className="chip on">일정</span>
                  <span className="chip on">범위</span>
                  <span className="chip on">의사결정</span>
                  <span className="chip">UX</span>
                  <span className="chip">기술 리스크</span>
                  <span className="chip">비용 · 성과</span>
                  <span className="chip">고객 반응</span>
                  <span className="chip">운영 이슈</span>
                  <span className="chip">액션 아이템</span>
                  <span className="chip">팀 질문</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="wrap">
            <div className="cta-box rv zoom">
              <img src="/assets/images/landing-symbol.png" alt="" aria-hidden="true" />
              <h2>다음 회의부터, 같은 이해로 시작하세요</h2>
              <p>
                프로젝트를 만들고 자료를 올리는 데 몇 분이면 충분합니다. 지금 바로 SynQ와 함께
                회의를 시작해 보세요.
              </p>
              <button className="btn btn-primary btn-lg" onClick={onStart} type="button">
                씽큐 시작하기
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <div className="social">
                <span>카카오</span>
                <span>네이버</span>
                <span>구글 계정으로 로그인</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <a href="#top" aria-label="SynQ">
            <img src="/assets/images/landing-wordmark.png" alt="SynQ" />
          </a>
          <nav aria-label="정책 문서">
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
            <a href="#top">synqai.co.kr</a>
          </nav>
          <span>© 2026 SynQ</span>
        </div>
      </footer>
    </div>
  )
}

export default MarketingLandingPage
