import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Skull, Heart, Sparkles } from 'lucide-react';

const MONSTER_IMAGES = [
  'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop'
];

export default function MonsterBattle({ 
  monsterName = "Monster", 
  monsterImage,
  totalHP, 
  currentHP, 
  themeColor = "#6B21A8",
  isAttacking,
  lastDamage
}) {
  const [showDamage, setShowDamage] = useState(false);
  const [damageValue, setDamageValue] = useState(0);
  const [particles, setParticles] = useState([]);
  
  const hpPercentage = totalHP > 0 ? Math.max(0, (currentHP / totalHP) * 100) : 100;
  const isDead = currentHP <= 0 && totalHP > 0;

  const fallbackImage = MONSTER_IMAGES[Math.floor(Math.random() * MONSTER_IMAGES.length)];

  useEffect(() => {
    if (isAttacking && lastDamage > 0) {
      setDamageValue(lastDamage);
      setShowDamage(true);
      
      // Create particles
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -80 - 20,
        rotation: Math.random() * 360
      }));
      setParticles(newParticles);
      
      setTimeout(() => {
        setShowDamage(false);
        setParticles([]);
      }, 1000);
    }
  }, [isAttacking, lastDamage]);

  return (
    <div className="relative flex flex-col items-center py-8 px-4">
      {/* Monster Name */}
      <motion.h2 
        className="text-2xl font-bold mb-4 tracking-wide"
        style={{ color: themeColor }}
      >
        {monsterName}
      </motion.h2>
      
      {/* HP Bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            <span className="text-sm font-semibold text-slate-600">HP</span>
          </div>
          <span className="text-sm font-mono text-slate-700">
            {Math.max(0, currentHP)} / {totalHP}
          </span>
        </div>
        <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${themeColor}, ${hpPercentage > 30 ? '#22C55E' : hpPercentage > 15 ? '#EAB308' : '#EF4444'})` 
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercentage}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
        </div>
      </div>
      
      {/* Monster Container */}
      <div className="relative">
        {/* Attack Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                opacity: 0, 
                scale: 0,
                rotate: particle.rotation
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Damage Number */}
        <AnimatePresence>
          {showDamage && (
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -60, opacity: 1, scale: 1.2 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full shadow-lg">
                <Swords className="w-4 h-4" />
                <span className="font-bold text-lg">-{damageValue}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Monster Image */}
        <motion.div
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-[5px] overflow-hidden shadow-2xl bg-slate-100"
          animate={
            isDead 
              ? { rotate: 0, scale: 0.9, filter: 'grayscale(100%)' }
              : isAttacking 
                ? { 
                    x: [0, -10, 10, -10, 10, 0],
                    rotate: [0, -5, 5, -5, 5, 0]
                  }
                : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.4 }}
          style={{ 
            boxShadow: `0 20px 60px -15px ${themeColor}40`
          }}
        >
          {monsterImage ? (
            <img
              src={monsterImage}
              alt={monsterName}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={fallbackImage}
              alt={monsterName}
              className="w-full h-full object-contain"
            />
          )}
          
          {/* Overlay effects */}
          <AnimatePresence>
            {isAttacking && (
              <motion.div
                className="absolute inset-0 bg-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
          
          {/* Dead overlay */}
          {isDead && (
            <motion.div
              className="absolute inset-0 bg-slate-900/70 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <Skull className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white font-bold">DEFEATED!</p>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Ground shadow */}
        <motion.div
          className="w-40 h-4 mx-auto mt-4 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${themeColor}30, transparent)` }}
          animate={isAttacking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        />
      </div>
    </div>
  );
}