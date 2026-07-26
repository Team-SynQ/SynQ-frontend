import { useEffect, useMemo, useState } from 'react'

import {
  componentReviewItems,
  componentRouteKeys,
  getFigmaNodeUrl,
  type ComponentReviewItem,
  type ComponentRouteKey,
  type ComponentStatus,
} from '../model/componentReview'
import { ComponentPreview } from './ComponentPreview'

type HubRoute = ComponentRouteKey | 'components' | null

const statusLabels: Record<ComponentStatus, string> = {
  implemented: '구현 완료',
}

const statusClasses: Record<ComponentStatus, string> = {
  implemented: 'border-primary-300 bg-primary-100 text-brand-primary',
}

function getRouteFromHash(): HubRoute {
  if (typeof window === 'undefined') {
    return null
  }

  const route = window.location.hash.replace('#', '')

  if (route === 'components') {
    return 'components'
  }

  return componentRouteKeys.has(route as ComponentRouteKey) ? (route as ComponentRouteKey) : null
}

export function SharedUiHubPage() {
  const [selectedRoute, setSelectedRoute] = useState<HubRoute>(() => getRouteFromHash())

  useEffect(() => {
    const syncRoute = () => setSelectedRoute(getRouteFromHash())

    window.addEventListener('hashchange', syncRoute)
    syncRoute()

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const selectedItem = useMemo(
    () =>
      selectedRoute && selectedRoute !== 'components'
        ? (componentReviewItems.find((item) => item.route === selectedRoute) ?? null)
        : null,
    [selectedRoute],
  )

  return (
    <main className="min-h-screen bg-surface-muted px-m py-l text-fg-primary">
      <div className="flex w-full flex-col gap-l">
        <PageHeader selectedItem={selectedItem} selectedRoute={selectedRoute} />
        {selectedItem ? (
          <ComponentDetail item={selectedItem} />
        ) : selectedRoute === 'components' ? (
          <ComponentList />
        ) : (
          <HubLanding />
        )}
      </div>
    </main>
  )
}

function PageHeader({
  selectedItem,
  selectedRoute,
}: {
  selectedItem: ComponentReviewItem | null
  selectedRoute: HubRoute
}) {
  return (
    <header className="flex flex-col gap-s">
      <div className="flex flex-col gap-xs">
        <h1 className="typo-heading">SynQ 공통 컴포넌트 허브</h1>
        <p className="max-w-screen-md typo-body-01 text-fg-secondary">
          Figma 공통 컴포넌트 노드와 공통 UI 구현을 FSD 페이지 슬라이스에서 확인합니다.
        </p>
      </div>
      {selectedRoute ? (
        <nav className="flex flex-wrap gap-xs" aria-label="공통 컴포넌트">
          <RouteLink
            active={selectedRoute === 'components'}
            href="#components"
            label="공통 컴포넌트"
          />
          {componentReviewItems.map((item) => (
            <RouteLink
              active={selectedItem?.route === item.route}
              href={`#${item.route}`}
              key={item.route}
              label={item.title}
            />
          ))}
        </nav>
      ) : null}
    </header>
  )
}

function HubLanding() {
  return (
    <section className="max-w-screen-md rounded-s border-stroke-md border-line-default bg-surface-elevated p-m">
      <a className="flex flex-col gap-s text-fg-primary" href="#components">
        <span className="typo-title-02">공통 컴포넌트 허브</span>
        <span className="typo-body-02 text-fg-secondary">
          버튼, 입력, 모달, 토스트, 사이드바 등 SynQ 공통 UI 컴포넌트를 한 번에 확인합니다.
        </span>
      </a>
    </section>
  )
}

function ComponentList() {
  return (
    <section className="grid gap-s md:grid-cols-2 xl:grid-cols-3" aria-label="컴포넌트 목록">
      {componentReviewItems.map((item) => (
        <ComponentCard item={item} key={item.route} />
      ))}
    </section>
  )
}

function ComponentDetail({ item }: { item: ComponentReviewItem }) {
  return (
    <section className="grid gap-m lg:grid-cols-3">
      <aside className="flex flex-col gap-s rounded-s border-stroke-md border-line-default bg-surface-elevated p-m">
        <a className="typo-body-02 text-brand-primary" href="#components">
          공통 컴포넌트
        </a>
        <div className="flex flex-col gap-xs">
          <StatusPill status={item.status} />
          <h2 className="typo-title-02">{item.title}</h2>
          <p className="typo-body-02 text-fg-secondary">{item.summary}</p>
        </div>
        <dl className="grid gap-xs typo-caption text-fg-secondary">
          <div className="grid gap-xs">
            <dt className="text-fg-primary">Figma node</dt>
            <dd className="flex flex-wrap gap-xs">
              {item.figmaNodes.map((nodeId) => (
                <a
                  className="text-brand-primary"
                  href={getFigmaNodeUrl(nodeId)}
                  key={nodeId}
                  rel="noreferrer"
                  target="_blank"
                >
                  {nodeId}
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </aside>

      <div className="min-w-0 rounded-s border-stroke-md border-line-default bg-surface-elevated p-m lg:col-span-2">
        <div className="mb-m flex flex-wrap items-center justify-between gap-s">
          <h2 className="typo-title-02">{item.title}</h2>
          <StatusPill status={item.status} />
        </div>
        <ComponentPreview route={item.route} />
      </div>
    </section>
  )
}

function ComponentCard({ item }: { item: ComponentReviewItem }) {
  return (
    <a
      className="flex min-h-full flex-col justify-between gap-s rounded-s border-stroke-md border-line-default bg-surface-elevated p-m text-fg-primary transition-colors hover:border-line-strong"
      href={`#${item.route}`}
    >
      <span className="flex items-start justify-between gap-s">
        <span className="min-w-0">
          <span className="block typo-title-02">{item.title}</span>
          <span className="block typo-caption text-fg-secondary">{item.figmaNodes.join(', ')}</span>
        </span>
        <StatusPill status={item.status} />
      </span>
      <span className="typo-body-02 text-fg-secondary">{item.summary}</span>
    </a>
  )
}

function RouteLink({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <a
      className={`rounded-s border-stroke-md px-xs py-xs typo-caption transition-colors ${
        active
          ? 'border-primary-300 bg-primary-100 text-brand-primary'
          : 'border-line-default bg-surface-elevated text-fg-secondary'
      }`}
      href={href}
    >
      {label}
    </a>
  )
}

function StatusPill({ status }: { status: ComponentStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-s border-stroke-md px-xs py-xs typo-caption ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}
