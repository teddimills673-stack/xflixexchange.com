'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

interface VisualCaptchaModalProps {
  onVerify: (token: string) => void;
  onClose: () => void;
}

interface ChallengeItem {
  id: number;
  label: string;
  imageUrl: string;
  isTarget: boolean;
}

const CATEGORIES = [
  { name: 'sedan', title: 'Sedan on Highway', symbol: '🚗' },
  { name: 'fire hydrants', title: 'Fire Hydrant', symbol: '🧯' },
  { name: 'zebra crossings', title: 'Zebra Crossing / Crosswalk', symbol: '🚶' },
  { name: 'traffic lights', title: 'Traffic Light', symbol: '🚦' },
];

const ALL_PHOTO_ITEMS = [
  // Sedan on Highway
  { label: 'Sedan Highway View 1', imageUrl: 'https://images.unsplash.com/photo-1550355191-aa806b1b43d3?auto=format&fit=crop&w=600&q=80', categories: ['sedan'] },
  { label: 'Sedan Highway View 2', imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80', categories: ['sedan'] },
  { label: 'Sedan Highway View 3', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', categories: ['sedan'] },
  { label: 'Sedan Highway View 4', imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', categories: ['sedan'] },

  // Fire Hydrants
  { label: 'Fire Hydrant Street 1', imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', categories: ['fire hydrants'] },
  { label: 'Fire Hydrant Street 2', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', categories: ['fire hydrants'] },
  { label: 'Fire Hydrant Street 3', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', categories: ['fire hydrants'] },
  { label: 'Fire Hydrant Street 4', imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80', categories: ['fire hydrants'] },

  // Zebra Crossings
  { label: 'Zebra Crossing 1', imageUrl: 'https://images.unsplash.com/photo-1572947549638-d54b83185344?auto=format&fit=crop&w=600&q=80', categories: ['zebra crossings'] },
  { label: 'Zebra Crossing 2', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', categories: ['zebra crossings'] },
  { label: 'Zebra Crossing 3', imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80', categories: ['zebra crossings'] },
  { label: 'Zebra Crossing 4', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', categories: ['zebra crossings'] },

  // Traffic Lights
  { label: 'Traffic Light 1', imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80', categories: ['traffic lights'] },
  { label: 'Traffic Light 2', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', categories: ['traffic lights'] },
  { label: 'Traffic Light 3', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80', categories: ['traffic lights'] },
  { label: 'Traffic Light 4', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80', categories: ['traffic lights'] },

  // Distractors
  { label: 'Urban Skyline', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80', categories: ['distractor'] },
  { label: 'Building Facade', imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80', categories: ['distractor'] },
  { label: 'Mountain Ridge', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', categories: ['distractor'] },
  { label: 'Urban Park', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80', categories: ['distractor'] },
];

const generateChallengeData = () => {
  const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const matching = ALL_PHOTO_ITEMS.filter(item => item.categories.includes(randomCat.name));
  const nonMatching = ALL_PHOTO_ITEMS.filter(item => !item.categories.includes(randomCat.name));

  const shuffledMatching = [...matching].sort(() => 0.5 - Math.random());
  const shuffledNonMatching = [...nonMatching].sort(() => 0.5 - Math.random());

  const targetCount = 3 + Math.floor(Math.random() * 2); // 3 or 4 targets
  const chosenTargets = shuffledMatching.slice(0, targetCount);
  const chosenDistractors = shuffledNonMatching.slice(0, 9 - targetCount);

  const combined: ChallengeItem[] = [...chosenTargets.map(t => ({ ...t, isTarget: true })), ...chosenDistractors.map(d => ({ ...d, isTarget: false }))]
    .map((item, index) => ({
      id: index,
      label: item.label,
      imageUrl: item.imageUrl,
      isTarget: item.isTarget
    }))
    .sort(() => 0.5 - Math.random());

  return { category: randomCat, items: combined };
};

export const VisualCaptchaModal: React.FC<VisualCaptchaModalProps> = ({ onVerify, onClose }) => {
  const initialData = generateChallengeData();
  const [currentCategory, setCurrentCategory] = useState(initialData.category);
  const [gridItems, setGridItems] = useState<ChallengeItem[]>(initialData.items);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingNew, setIsLoadingNew] = useState(false);

  const handleRefresh = () => {
    setIsLoadingNew(true);
    setTimeout(() => {
      const newData = generateChallengeData();
      setCurrentCategory(newData.category);
      setGridItems(newData.items);
      setSelectedIds([]);
      setErrorMessage('');
      setIsLoadingNew(false);
    }, 300);
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
    setErrorMessage('');
  };

  const handleVerifySubmission = () => {
    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifying(false);
      
      const targetIds = gridItems.filter(item => item.isTarget).map(item => item.id);
      
      const allTargetsSelected = targetIds.every(id => selectedIds.includes(id));
      const noDistractorsSelected = selectedIds.every(id => targetIds.includes(id));

      if (allTargetsSelected && noDistractorsSelected && selectedIds.length > 0) {
        const token = `cf_turnstile_photoview_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`;
        onVerify(token);
        onClose();
      } else {
        setErrorMessage('Please try again. Some selected photographs were incorrect or missing.');
        handleRefresh();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[92dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Photographic Verification</h2>
              <p className="text-[10px] text-slate-400 font-mono">Cloudflare Turnstile Photographic SEC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Prompt Box */}
        <div className="my-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-300 font-medium mb-1">Select all images with</p>
          <p className="text-base sm:text-lg font-bold text-white tracking-wide uppercase flex items-center justify-center gap-2">
            <span>{currentCategory.symbol}</span>
            <span className="text-blue-400">{currentCategory.title}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3x3 Photographic Grid */}
        <div className={`grid grid-cols-3 gap-2 sm:gap-3 mb-5 transition-opacity duration-300 ${isLoadingNew ? 'opacity-30' : 'opacity-100'}`}>
          {gridItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`relative aspect-square rounded-2xl border-2 cursor-pointer overflow-hidden transition-all select-none group bg-slate-950 ${
                  isSelected 
                    ? 'border-blue-500 shadow-xl shadow-blue-600/30 scale-[0.98]' 
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/captcha/sedan/sedan-1.svg';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <span className="absolute bottom-1.5 left-2 right-2 text-[9px] text-white/90 font-medium truncate drop-shadow">
                  {item.label}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border border-white/20 animate-scaleUp">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoadingNew || isVerifying}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            title="Get a new challenge"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingNew ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleVerifySubmission}
            disabled={isVerifying || selectedIds.length === 0 || isLoadingNew}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Challenge</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

