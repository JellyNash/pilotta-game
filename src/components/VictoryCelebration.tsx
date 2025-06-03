import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

interface VictoryCelebrationProps {
  show: boolean;
  type: 'victory' | 'defeat' | 'contract-made' | 'trick-won';
}

const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({ show, type }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const colors = {
      victory: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
      defeat: ['#708090', '#778899', '#696969', '#A9A9A9', '#C0C0C0'],
      'contract-made': ['#32CD32', '#00FF00', '#7FFF00', '#ADFF2F', '#90EE90'],
      'trick-won': ['#1E90FF', '#00BFFF', '#87CEEB', '#4682B4', '#5F9EA0']
    };

    const particleCount = type === 'victory' ? 100 : type === 'defeat' ? 30 : 50;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = 2 + Math.random() * 4;
      const colorArray = colors[type];
      
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 2,
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        size: 4 + Math.random() * 8,
        shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star'
      });
    }

    setParticles(newParticles);

    // Clear particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, type]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y,
            opacity: 1,
            scale: 1
          }}
          animate={{ 
            x: particle.x + particle.vx * 100,
            y: particle.y + particle.vy * 100 + 200, // gravity effect
            opacity: 0,
            scale: 0,
            rotate: 360
          }}
          transition={{ 
            duration: 2.5,
            ease: "easeOut"
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
            borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'square' ? '0%' : '0%',
          }}
        >
          {particle.shape === 'star' && (
            <svg
              width={particle.size}
              height={particle.size}
              viewBox="0 0 24 24"
              fill={particle.color}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </motion.div>
      ))}

      {/* Central message */}
      {type === 'victory' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <h1 className="text-6xl font-bold text-yellow-400 drop-shadow-lg animate-pulse">
            VICTORY!
          </h1>
        </motion.div>
      )}

      {type === 'contract-made' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <h2 className="text-4xl font-bold text-green-400 drop-shadow-lg">
            Contract Made!
          </h2>
        </motion.div>
      )}
    </div>
  );
};

export default VictoryCelebration;
