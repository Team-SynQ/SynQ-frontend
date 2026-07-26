const MOCK_API_DELAY_MS = 350

export class MockApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
    this.code = code
  }
}

export async function waitForMockApi() {
  if (import.meta.env.MODE === 'test') return

  await new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_API_DELAY_MS)
  })
}
