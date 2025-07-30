import React, { useEffect, useRef } from 'react';
import navidad1 from '../assets/navidad1.png';
import navidad2 from '../assets/navidad2.png';
import navidad3 from '../assets/navidad3.png';
import navidad4 from '../assets/navidad4.png';
import navidad5 from '../assets/navidad5.png';

const imagenes = [navidad1, navidad2, navidad3, navidad4, navidad5];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function LluviaNavidad() {
  const lluviaRef = useRef();

  useEffect(() => {
    const container = lluviaRef.current;
    let running = true;
    let timeoutId;

    function crearImagen() {
      if (!running) return;
      const img = document.createElement('img');
      img.src = imagenes[randomInt(0, imagenes.length - 1)];
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
      timeoutId = setTimeout(crearImagen, randomInt(300, 700));
    }
    crearImagen();
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
    />
  );
}
