import React, { useEffect, useRef } from 'react';
import corazon1 from '../assets/corasones1.gif';
import corazon2 from '../assets/corasones2.gif';
import corazon3 from '../assets/corasones3.png';

const corazones = [corazon1, corazon2, corazon3];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function LluviaSanValentin() {
  const lluviaRef = useRef();

  useEffect(() => {
    const container = lluviaRef.current;
    let running = true;
    let timeoutId;

    function crearCorazon() {
      if (!running) return;
      const img = document.createElement('img');
      img.src = corazones[randomInt(0, corazones.length - 1)];
      img.style.position = 'absolute';
      img.style.left = `${randomInt(0, 98)}vw`;
      img.style.top = '-60px';
      img.style.width = `${randomInt(28, 48)}px`;
      img.style.opacity = Math.random() * 0.5 + 0.5;
      img.style.pointerEvents = 'none';
      img.style.zIndex = 1;
      img.style.transition = 'top 4.5s linear';
      container.appendChild(img);
      setTimeout(() => {
        img.style.top = '110vh';
      }, 10);
      setTimeout(() => {
        if (container.contains(img)) container.removeChild(img);
      }, 5000);
      timeoutId = setTimeout(crearCorazon, randomInt(300, 700));
    }
    crearCorazon();
    return () => {
      running = false;
      clearTimeout(timeoutId);
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={lluviaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
