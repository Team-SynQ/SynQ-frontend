import { useEffect, useMemo, useState } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  useOutletContext,
} from 'react-router-dom'

import { AccountSettingsPage } from '../../pages/AccountSettingsPage'
import { HelpPage } from '../../pages/HelpPage'
import { KakaoCallbackPage } from '../../pages/KakaoCallbackPage'
import LoginPage from '../../pages/LoginPage'
import { MeetingDetailPage } from '../../pages/MeetingDetailPage'
import { MeetingPage } from '../../pages/MeetingPage'
import { MeetingStartPage } from '../../pages/MeetingStartPage'
import { MeetingTutorialPage } from '../../pages/MeetingTutorialPage'
import { NaverCallbackPage } from '../../pages/NaverCallbackPage'
import { PolicyDocumentsPage } from '../../pages/PolicyDocumentsPage'
import { PrivacyPage } from '../../pages/PrivacyPage'
import { ProjectInvitePage } from '../../pages/ProjectInvitePage'
import { ProjectMainboardPage } from '../../pages/ProjectMainboardPage'
import { TermsPage } from '../../pages/TermsPage'
import { toProviderLabel } from '../../features/account-settings'
import {
  changeMyName,
  changeMyProfileImage,
  loadCurrentUser,
  resetMyProfileImage,
  type CurrentUser,
} from '../../entities/user'
import { readAccessToken } from '../../shared/lib/authStorage'
import { LandingRoute, OnboardingRoute } from './EntryFlowRoutes'
import {
  ProjectJoinPerspectiveSetupRoute,
  ProjectJoinPreviewRoute,
  ProjectJoinRoleSetupRoute,
  ProjectJoinSetupFlow,
} from './ProjectJoinSetupFlow'
import {
  UserPerspectiveSetupRoute,
  UserRoleSetupRoute,
  UserSetupFlow,
  UserSetupPreviewRoute,
} from './UserSetupFlow'

type AuthenticatedOutletContext = {
  user: CurrentUser
  onUserChange: (user: CurrentUser) => void
}

function useAuthenticatedContext() {
  return useOutletContext<AuthenticatedOutletContext>()
}

function useAuthenticatedUser() {
  return useAuthenticatedContext().user
}

/**
 * 로그인이 필요한 화면의 공통 진입점입니다.
 * 토큰이 없으면 곧바로, 토큰이 만료됐으면 /users/me 실패 시 로그인 화면으로 보냅니다.
 */
function AuthenticatedLayout() {
  const [user, setUser] = useState<CurrentUser>()
  const [isRejected, setIsRejected] = useState(false)
  const hasAccessToken = Boolean(readAccessToken())

  useEffect(() => {
    if (!hasAccessToken) return

    let isSubscribed = true
    void loadCurrentUser()
      .then((currentUser) => {
        if (!isSubscribed) return
        setUser(currentUser)
      })
      .catch(() => {
        if (!isSubscribed) return
        setIsRejected(true)
      })

    return () => {
      isSubscribed = false
    }
  }, [hasAccessToken])

  if (!hasAccessToken || isRejected) return <Navigate replace to="/login" />
  if (!user) return null

  return <Outlet context={{ user, onUserChange: setUser } satisfies AuthenticatedOutletContext} />
}

function ProjectMainboardRoute() {
  return <ProjectMainboardPage user={useAuthenticatedUser()} />
}

function AccountSettingsRoute() {
  const { user, onUserChange } = useAuthenticatedContext()

  return (
    <AccountSettingsPage
      initialProfileImageUrl={user.profileImageUrl ?? undefined}
      onSaveName={async (name) => {
        onUserChange(await changeMyName(name))
      }}
      // 업로드 API가 저장까지 처리하므로, 저장 단계에서는 삭제(기본 이미지)와 상태 반영만 담당합니다.
      onSaveProfileImage={async (imageUrl) => {
        if (imageUrl === undefined) await resetMyProfileImage()
        onUserChange({ ...user, profileImageUrl: imageUrl ?? null })
      }}
      onUploadProfileImage={changeMyProfileImage}
      providerLabel={toProviderLabel(user.provider)}
      user={user}
    />
  )
}

function HelpRoute() {
  return <HelpPage user={useAuthenticatedUser()} />
}

function PolicyDocumentsRoute() {
  return <PolicyDocumentsPage user={useAuthenticatedUser()} />
}

function MeetingDetailRoute() {
  return <MeetingDetailPage user={useAuthenticatedUser()} />
}

function MeetingRoute() {
  return <MeetingPage user={useAuthenticatedUser()} />
}

/**
 * 회의 이탈 방지의 `useBlocker`가 데이터 라우터를 요구하므로 라우트를 객체로 변환해 둡니다.
 * 정의는 JSX 그대로 유지합니다.
 */
const appRoutes = createRoutesFromElements(
  <>
    <Route element={<LandingRoute />} path="/" />
    <Route element={<OnboardingRoute />} path="/onboarding" />
    <Route element={<LoginPage />} path="/login" />
    <Route element={<KakaoCallbackPage />} path="/login/callback" />
    <Route element={<NaverCallbackPage />} path="/login/callback/naver" />
    <Route element={<TermsPage />} path="/terms" />
    <Route element={<PrivacyPage />} path="/privacy" />
    <Route element={<ProjectJoinSetupFlow />} path="/invite/setup">
      <Route index element={<Navigate replace to="role" />} />
      <Route element={<ProjectJoinRoleSetupRoute />} path="role" />
      <Route element={<ProjectJoinPerspectiveSetupRoute />} path="perspectives" />
      <Route element={<ProjectJoinPreviewRoute />} path="preview" />
    </Route>
    <Route element={<ProjectInvitePage />} path="/invite/:inviteToken" />
    <Route element={<AuthenticatedLayout />}>
      <Route element={<ProjectMainboardRoute />} path="/projects" />
      <Route element={<AccountSettingsRoute />} path="/settings/account" />
      <Route element={<HelpRoute />} path="/settings/help" />
      <Route element={<PolicyDocumentsRoute />} path="/settings/policy" />
      <Route element={<UserSetupFlow />} path="/setup">
        <Route index element={<Navigate replace to="role" />} />
        <Route element={<UserRoleSetupRoute />} path="role" />
        <Route element={<UserPerspectiveSetupRoute />} path="perspectives" />
        <Route element={<UserSetupPreviewRoute />} path="preview" />
      </Route>
      <Route element={<MeetingStartPage />} path="/meetings/:meetingId/start" />
      <Route element={<MeetingTutorialPage />} path="/meetings/:meetingId/tutorial" />
      <Route element={<MeetingRoute />} path="/meetings/:meetingId/live" />
      <Route element={<MeetingDetailRoute />} path="/meetings/:meetingRecordId/detail" />
    </Route>
    <Route element={<Navigate replace to="/" />} path="*" />
  </>,
)

export function AppRouter() {
  // 마운트 시점의 주소로 라우터를 만듭니다. 모듈 로드 시점에 만들면 테스트가 주소를 바꿔도 반영되지 않습니다.
  const router = useMemo(() => createBrowserRouter(appRoutes), [])

  return <RouterProvider router={router} />
}
