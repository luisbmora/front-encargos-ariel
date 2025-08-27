// src/app/NavigationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'dashboard' | 'deliveries' | 'orders' | 'routes';

interface NavigationContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </NavigationContext.Provider>
  );
};