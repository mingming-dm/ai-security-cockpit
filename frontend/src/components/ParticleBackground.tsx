'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        fpsLimit: 60,
        particles: {
          number: { value: 60, density: { enable: true } },
          color: { value: ['#00d4ff', '#8b5cf6', '#10b981'] },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.1, max: 0.4 },
            animation: { enable: true, speed: 0.5, sync: false },
          },
          size: {
            value: { min: 1, max: 3 },
            animation: { enable: true, speed: 1, sync: false },
          },
          links: {
            enable: true,
            color: '#1e293b',
            opacity: 0.3,
            distance: 150,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: 'none' as const,
            random: true,
            straight: false,
            outModes: { default: 'bounce' as const },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
          },
          modes: {
            grab: {
              distance: 200,
              links: { opacity: 0.5, color: '#00d4ff' },
            },
          },
        },
      }}
    />
  );
}
