import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
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
            <AppLayout title="Dashboard">
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <AppLayout title="Tasks">
              <TasksPage />
            </AppLayout>
          }
        />
        <Route
          path="/leave"
          element={
            <AppLayout title="Leave">
              <LeavePage />
            </AppLayout>
          }
        />
        <Route
          path="/attendance"
          element={
            <AppLayout title="Attendance">
              <AttendancePage />
            </AppLayout>
          }
        />
        <Route
          path="/users"
          element={
            <AppLayout title="Users">
              <UsersPage />
            </AppLayout>
          }
        />
        <Route
          path="/meetings"
          element={
            <AppLayout title="Meetings">
              <MeetingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <AppLayout title="Team Chat">
              <ChatPage />
            </AppLayout>
          }
        />
        <Route
          path="/briefing"
          element={
            <AppLayout title="AI Briefing">
              <BriefingPage />
            </AppLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppLayout title="Notifications">
              <NotificationsPage />
            </AppLayout>
          }
        />
        <Route
          path="/community"
          element={
            <AppLayout title="Community">
              <CommunityPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout title="Performance Insights">
              <AnalyticsPage />
            </AppLayout>
          }
        />
        <Route
          path="/announcements"
          element={
            <AppLayout title="Announcements">
              <AnnouncementsPage />
            </AppLayout>
          }
        />
        <Route
          path="/mood"
          element={
            <AppLayout title="Mood Check-in">
              <MoodCheckInPage />
            </AppLayout>
          }
        />
        <Route
          path="/end-of-day"
          element={
            <AppLayout title="End-of-Day Report">
              <EndOfDayReportPage />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout title="Profile">
              <ProfilePage />
            </AppLayout>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
