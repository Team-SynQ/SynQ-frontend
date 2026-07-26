import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '../../pages/LoginPage'
import { MeetingPage } from '../../pages/MeetingPage'
import { MeetingSummaryPlaceholderPage } from '../../pages/MeetingSummaryPlaceholderPage'
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
        element={<MeetingSummaryPlaceholderPage />}
        path="/meetings/:meetingRecordId/summary"
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
