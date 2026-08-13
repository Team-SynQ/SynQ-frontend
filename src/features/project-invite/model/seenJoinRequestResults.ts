const STORAGE_KEY_PREFIX = 'seenJoinRequestResults'

/**
 * 서버는 참여 요청 결과의 읽음 상태를 관리하지 않는다. 조회할 때마다 처리된 요청이 전부 온다.
 * 그래서 이미 보여 준 요청을 여기서 기억한다. 계정을 바꿔 쓰는 경우가 있어 사용자별로 나눠 둔다.
 */
function storageKey(userId: number) {
  return `${STORAGE_KEY_PREFIX}.${userId}`
}

export function readSeenJoinRequestResults(userId: number): ReadonlySet<number> {
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return new Set()

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()

    return new Set(parsed.filter((value): value is number => typeof value === 'number'))
  } catch {
    // 저장값이 깨졌으면 아무것도 안 본 것으로 본다. 결과를 한 번 더 보여 주는 편이 삼키는 것보다 낫다.
    return new Set()
  }
}

export function markJoinRequestResultSeen(userId: number, requestId: number) {
  const seen = new Set(readSeenJoinRequestResults(userId))
  if (seen.has(requestId)) return

  seen.add(requestId)
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify([...seen]))
  } catch {
    // 저장에 실패해도 이번 화면의 안내는 이미 끝났다. 다음 진입에 다시 뜨는 정도의 손해다.
  }
}
