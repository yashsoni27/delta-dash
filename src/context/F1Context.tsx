import { createContext, useContext, ReactNode, useState } from 'react';

interface F1ContextType {
  delay: number;
  isLive: boolean;
  setDelay: (delay: number) => void;
  setIsLive: (isLive: boolean) => void;
}

const F1Context = createContext<F1ContextType | undefined>(undefined);

export function F1Provider({ children }: { children: ReactNode }) {
  const [delay, setDelay] = useState(0);
  const [isLive, setIsLive] = useState(false);

  return (
    <F1Context.Provider value={{ delay, isLive, setDelay, setIsLive }}>
      {children}
    </F1Context.Provider>
  );
}

export function useF1Context() {
  const context = useContext(F1Context);
  if (context === undefined) {
    throw new Error('Error in using F1context');
  }
  return context;
}