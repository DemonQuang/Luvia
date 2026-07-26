import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
export default AppContext;
