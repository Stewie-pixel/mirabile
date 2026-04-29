import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from 'miaoda-auth-react';
import { RouteGuard } from '@/components/common/RouteGuard';
import { RoadmapProvider } from '@/contexts/RoadmapContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { AppLayout } from '@/components/layouts/AppLayout';
import { supabase } from '@/lib/supabase';

import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <RoadmapProvider>
          <ProgressProvider>
            <RouteGuard>
              <IntersectObserver />
              <AppLayout>
                <Routes>
                  {routes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
              <Toaster />
            </RouteGuard>
          </ProgressProvider>
        </RoadmapProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;