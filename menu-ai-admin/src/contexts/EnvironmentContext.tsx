'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Environment = 'DEV' | 'PROD';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<Environment>('DEV');

  // Charger environnement depuis localStorage au démarrage
  useEffect(() => {
    const savedEnvironment = localStorage.getItem('selectedEnvironment');
    if (savedEnvironment === 'DEV' || savedEnvironment === 'PROD') {
      setEnvironmentState(savedEnvironment);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const setEnvironment = (env: Environment) => {
    setEnvironmentState(env);
    localStorage.setItem('selectedEnvironment', env);
  };

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
