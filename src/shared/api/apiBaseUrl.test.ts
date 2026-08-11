import { afterEach, describe, expect, it, vi } from 'vitest'

async function importBaseUrl(configured: string) {
  vi.stubEnv('VITE_API_BASE_URL', configured)
  vi.resetModules()
  const module = await import('./apiBaseUrl')
  return module.API_BASE_URL
}

describe('API_BASE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('설정값을 그대로 쓴다', async () => {
    await expect(importBaseUrl('https://api.example.com')).resolves.toBe('https://api.example.com')
  })

  // 소비자가 `${API_BASE_URL}/path`로 이어 붙이므로 끝 슬래시가 남으면 경로가 `//path`가 된다.
  it('환경변수의 끝 슬래시를 벗긴다', async () => {
    await expect(importBaseUrl('https://api.example.com/')).resolves.toBe('https://api.example.com')
    await expect(importBaseUrl('/api//')).resolves.toBe('/api')
  })
})
