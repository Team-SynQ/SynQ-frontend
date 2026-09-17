import '@testing-library/jest-dom/vitest'

/**
 * Node 22+는 전역 Web Storage(localStorage·sessionStorage)를 갖고 있어서, jsdom이 심어 주는
 * Storage와 겹치면 테스트 파일에 따라 window.localStorage.getItem이 함수가 아닌 상태로 잡힙니다.
 * CI는 Node 20이라 드러나지 않고 로컬 Node 22에서만 대량으로 깨지므로, 어느 환경에서 돌리든
 * 같은 결과가 나오도록 모든 테스트 파일에 동일한 Storage 구현을 한 번씩 심어 둡니다.
 *
 * vi.fn()이 아니라 평범한 함수로 만드는 이유는, 테스트가 afterEach에서 vi.restoreAllMocks()나
 * vi.resetAllMocks()를 불러도 저장소 구현이 지워지지 않게 하기 위함입니다.
 */
function createStorageMock(): Storage {
  let store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(String(key)) ?? null,
    setItem: (key: string, value: string) => {
      store.set(String(key), String(value))
    },
    removeItem: (key: string) => {
      store.delete(String(key))
    },
    clear: () => {
      store = new Map()
    },
  }
}

// 테스트 파일마다 setup이 새로 실행되므로, 파일 사이에 저장소가 새지 않습니다.
for (const storageName of ['localStorage', 'sessionStorage'] as const) {
  Object.defineProperty(window, storageName, {
    value: createStorageMock(),
    configurable: true,
    writable: true,
  })
}
