'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Success3DAnimationProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export const Success3DAnimation: React.FC<Success3DAnimationProps> = ({ title, subtitle, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border border-blue-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center overflow-hidden"
      >
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-blue-600/20 to-transparent pointer-events-none"></div>

        {/* 3D Flying Financial Bird with Money Wings */}
        <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              rotate: [-2, 2, -2]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5, 
              ease: "easeInOut" 
            }}
            className="relative flex items-center justify-center"
          >
            {/* Bird Body / Gem */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-emerald-500/40 flex items-center justify-center text-white relative z-20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>

            {/* Left Money Wing */}
            <motion.div
              animate={{ rotateZ: [-25, 15, -25], scaleX: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute -left-12 -top-2 w-14 h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 border border-emerald-300 shadow-xl flex items-center justify-center text-white font-bold font-mono text-xs z-30 origin-right"
            >
              💵 $
            </motion.div>

            {/* Right Money Wing */}
            <motion.div
              animate={{ rotateZ: [25, -15, 25], scaleX: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute -right-12 -top-2 w-14 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 border border-emerald-300 shadow-xl flex items-center justify-center text-white font-bold font-mono text-xs z-30 origin-left"
            >
              🪽 $
            </motion.div>
          </motion.div>

          {/* Sparkles & Money Particles */}
          <motion.div
            animate={{ y: [-20, 20], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-0 left-6 text-emerald-400 text-xs font-mono font-bold"
          >
            +$$$
          </motion.div>
          <motion.div
            animate={{ y: [15, -25], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
            className="absolute bottom-0 right-6 text-emerald-400 text-xs font-mono font-bold"
          >
            🪙
          </motion.div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized by Payment Gateway</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-2xl font-mono font-black text-emerald-400">{subtitle}</p>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/30"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};
