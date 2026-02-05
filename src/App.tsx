import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import VideoPage from './pages/VideoPage';
import HistoryPage from './pages/HistoryPage';
import ImagePage from './pages/ImagePage';
import AdminLogsPage from './pages/AdminLogsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 登录页面 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 首页 - Dashboard（公开访问，展示功能卡片） */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 受保护的功能路由 - 需要登录才能访问 */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <MainLayout>
                <ChatPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/image" element={
            <ProtectedRoute>
              <MainLayout>
                <ImagePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/video" element={
            <ProtectedRoute>
              <MainLayout>
                <VideoPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <MainLayout>
                <HistoryPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* 管理员专用路由 */}
          <Route path="/admin/logs" element={<AdminLogsPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
