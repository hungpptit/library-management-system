import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LibraryProvider } from './contexts/LibraryContext';
// Component chính chứa logic giao diện
import { AppContent } from './AppContent';

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AppContent />
      </LibraryProvider>
    </AuthProvider>
  );
}

