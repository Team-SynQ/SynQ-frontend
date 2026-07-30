import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AccountSettingsPage } from '../../pages/AccountSettingsPage'
import LoginPage from '../../pages/LoginPage'
import { MeetingDetailPage } from '../../pages/MeetingDetailPage'
import { MeetingPage } from '../../pages/MeetingPage'
import { MeetingStartPage } from '../../pages/MeetingStartPage'
import { MeetingTutorialPage } from '../../pages/MeetingTutorialPage'
import { ProjectMainboardPage } from '../../pages/ProjectMainboardPage'
import { projectMockActorFixture } from '../../shared/api/mock/fixtures/projects.fixture'
import { LandingRoute, OnboardingRoute } from './EntryFlowRoutes'
import {
  UserPerspectiveSetupRoute,
  UserRoleSetupRoute,
  UserSetupFlow,
  UserSetupPreviewRoute,
} from './UserSetupFlow'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingRoute />} path="/" />
      <Route element={<OnboardingRoute />} path="/onboarding" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProjectMainboardPage user={projectMockActorFixture} />} path="/projects" />
      <Route
        element={<AccountSettingsPage user={projectMockActorFixture} />}
        path="/settings/account"
      />
      <Route element={<UserSetupFlow />} path="/setup">
        <Route index element={<Navigate replace to="role" />} />
        <Route element={<UserRoleSetupRoute />} path="role" />
        <Route element={<UserPerspectiveSetupRoute />} path="perspectives" />
        <Route element={<UserSetupPreviewRoute />} path="preview" />
      </Route>
      <Route element={<MeetingStartPage />} path="/meetings/:meetingId/start" />
      <Route element={<MeetingTutorialPage />} path="/meetings/:meetingId/tutorial" />
      <Route element={<MeetingPage />} path="/meetings/:meetingId/live" />
      <Route
        element={<MeetingDetailPage user={projectMockActorFixture} />}
        path="/meetings/:meetingRecordId/detail"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
