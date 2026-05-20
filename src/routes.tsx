import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoadmapGeneratorPage from './pages/RoadmapGeneratorPage';
import RoadmapViewerPage from './pages/RoadmapViewerPage';
import ProgressTrackingPage from './pages/ProgressTrackingPage';
import ProfilePage from './pages/ProfilePage';
import InstructionsPage from './pages/InstructionsPage';
import ChatPage from './pages/ChatPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    public: true,
  },
  {
    name: 'Auth Callback',
    path: '/auth/callback',
    element: <AuthCallbackPage />,
    public: true,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Roadmap Generator',
    path: '/generator',
    element: <RoadmapGeneratorPage />,
  },
  {
    name: 'Roadmap Viewer',
    path: '/roadmap/:roadmapId',
    element: <RoadmapViewerPage />,
  },
  {
    name: 'Progress Tracking',
    path: '/progress',
    element: <ProgressTrackingPage />,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    name: 'Instructions',
    path: '/instructions',
    element: <InstructionsPage />,
  },
  {
    name: 'Chat',
    path: '/chat',
    element: <ChatPage />,
  },
  {
    name: 'Chat Session',
    path: '/chat/:sessionId',
    element: <ChatPage />,
  }
];