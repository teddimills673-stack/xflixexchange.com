'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { CreditCardMethod } from '@/types';

interface Interactive3DCardProps {
  card: CreditCardMethod;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const brandLower = card.cardBrand.toLowerCase();
  let brandBadge = 'VISA';
  if (brandLower.includes('master')) brandBadge = 'MASTERCARD';
  else if (brandLower.includes('amex')) brandBadge = 'AMEX';
  else if (brandLower.includes('discover')) brandBadge = 'DISCOVER';

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto my-2 cursor-pointer select-none">
      <motion.div
        className="relative w-full h-56 rounded-2xl shadow-2xl transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
        }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/30 p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Ambient Glow */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-8 rounded bg-gradient-to-r from-amber-300 to-amber-500 opacity-90 shadow-sm flex items-center justify-center">
                <div className="w-7 h-5 border border-amber-700/60 rounded-sm grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 opacity-70">
                  <div className="border border-amber-700/60 rounded-[1px]"></div>
                  <div className="border border-amber-700/60 rounded-[1px]"></div>
                  <div className="border border-amber-700/60 rounded-[1px]"></div>
                  <div className="border border-amber-700/60 rounded-[1px]"></div>
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-blue-300 uppercase">Tokenized SECURE</span>
            </div>
            <div className="text-right font-black tracking-wider text-sm font-mono text-blue-200">
              {brandBadge}
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Card Number (Masked)</p>
            <p className="text-xl font-mono font-bold tracking-widest text-slate-100">
              •••• •••• •••• {card.last4}
            </p>
          </div>

          <div className="flex items-end justify-between relative z-10 pt-2">
            <div>
              <p className="text-[9px] uppercase font-mono text-slate-400">Cardholder</p>
              <p className="text-xs font-bold tracking-wide uppercase text-slate-200 truncate max-w-[180px]">{card.cardHolder}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase font-mono text-slate-400">Expires</p>
              <p className="text-xs font-mono font-bold text-slate-200">{card.expiryMonth}/{card.expiryYear}</p>
            </div>
          </div>

          <div className="absolute bottom-2 right-4 text-[9px] text-slate-500 font-mono pointer-events-none flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" /> Tap/Click to Flip 3D
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-700 p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-10 bg-slate-950 -mx-6 mt-2"></div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-mono">Authorized Institutional Gateway</p>
            <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 tracking-wider">SECURE CVV TOKEN</span>
              <span className="text-xs font-mono font-bold text-emerald-400">•••</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PCI-DSS Level 1</span>
            <span>ID: {card.id}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
