import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LandingPage } from '@/pages/Landing'
import { DashboardPage } from '@/pages/Dashboard'
import { TasksPage } from '@/pages/Tasks'
import { LeavePage } from '@/pages/Leave'
import { AttendancePage } from '@/pages/Attendance'
import { UsersPage } from '@/pages/Users'
import { ProfilePage } from '@/pages/Profile'
import { MeetingsPage } from '@/pages/Meetings'
import { ChatPage } from '@/pages/Chat'
import { BriefingPage } from '@/pages/Briefing'
import { NotificationsPage } from '@/pages/Notifications'
import { CommunityPage } from '@/pages/Community'
import { AnalyticsPage } from '@/pages/Analytics'
import { AnnouncementsPage } from '@/pages/Announcements'
import { MoodCheckInPage } from '@/pages/MoodCheckIn'
import { EndOfDayReportPage } from '@/pages/EndOfDayReport'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout title="Dashboard">
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout title="Tasks">
                <TasksPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <AppLayout title="Leave">
                <LeavePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AppLayout title="Attendance">
                <AttendancePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppLayout title="Users">
                <UsersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <AppLayout title="Meetings">
                <MeetingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout title="Team Chat">
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/briefing"
          element={
            <ProtectedRoute>
              <AppLayout title="AI Briefing">
                <BriefingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout title="Notifications">
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <AppLayout title="Community">
                <CommunityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout title="Performance Insights">
                <AnalyticsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AppLayout title="Announcements">
                <AnnouncementsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <AppLayout title="Mood Check-in">
                <MoodCheckInPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/end-of-day"
          element={
            <ProtectedRoute>
              <AppLayout title="End-of-Day Report">
                <EndOfDayReportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout title="Profile">
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
