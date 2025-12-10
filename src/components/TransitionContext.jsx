import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to, options = {}) => {
    setIsAnimating(true);
    setAnimationKey(prev => prev + 1);
    navigate(to, options);
    setIsAnimating(false);
  }, [navigate]);

  return (
    <TransitionContext.Provider value={{ isAnimating, animationKey, navigateWithTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  return useContext(TransitionContext);
} 