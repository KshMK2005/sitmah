import React from 'react';
import { useTransition } from './TransitionContext';
import './PageTransitionBar.css';

const PageTransitionBar = () => {
  const { isAnimating, animationKey } = useTransition();

  return null;
};

export default PageTransitionBar; 