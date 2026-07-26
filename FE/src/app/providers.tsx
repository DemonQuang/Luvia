import React from 'react';
import { AuthProvider } from '../store/auth.store';
import { ThemeProvider } from '../store/theme.store';
import { AppProvider } from '../store/app.store';
import { MusicProvider } from '../store/music.store';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MusicProvider>
            {children}
          </MusicProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default Providers;
