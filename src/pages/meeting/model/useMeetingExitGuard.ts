import { useCallback, useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

type UseMeetingExitGuardOptions = {
  /** 회의가 진행 중일 때만 막는다. 로딩·오류 화면에서는 그대로 나갈 수 있어야 한다. */
  enabled: boolean
}

/**
 * 회의 진행 중 이탈을 막는다.
 *
 * 앱 내부 이동은 라우터에서 가로채 확인 모달로 넘기고, 탭 닫기·새로고침은 브라우저 기본 경고에 맡긴다.
 * 기본 경고는 문구를 지정할 수 없고 새로고침과 탭 닫기를 구분하지도 못한다. 브라우저 제약이다.
 */
export function useMeetingExitGuard({ enabled }: UseMeetingExitGuardOptions) {
  // 종료·나가기를 마친 뒤의 이동까지 막지 않도록 두는 통행증.
  // 확인 직후 곧바로 navigate를 부르므로, 리렌더를 기다리는 state로는 늦다.
  const exitAllowedRef = useRef(false)

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        enabled && !exitAllowedRef.current && currentLocation.pathname !== nextLocation.pathname,
      [enabled],
    ),
  )

  useEffect(() => {
    if (!enabled) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (exitAllowedRef.current) return
      event.preventDefault()
      // Chrome·Edge 119 미만은 preventDefault를 무시하고 returnValue만 본다.
      // 빈 문자열은 "경고 없음"이라 값이 있어야 한다.
      event.returnValue = true
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [enabled])

  const dismiss = useCallback(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  return {
    /** 가로챈 이동이 대기 중인지. 확인 모달을 여는 조건으로 쓴다. */
    isBlocked: blocker.state === 'blocked',
    /** 대기 중인 이동을 취소하고 회의 화면에 남는다. */
    dismiss,
    /** 이후의 이동을 허용한다. 종료·나가기 처리를 마치고 navigate하기 직전에 부른다. */
    allowExit: useCallback(() => {
      exitAllowedRef.current = true
      dismiss()
    }, [dismiss]),
  }
}
