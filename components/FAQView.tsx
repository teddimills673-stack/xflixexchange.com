'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, Wallet, ShieldCheck, 
  UserCheck, Coins, ExternalLink, Headphones, AlertTriangle, CheckCircle2 
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'earn' | 'wallet' | 'account' | 'security';
  question: string;
  answer: string;
  linkText?: string;
  linkTab?: string;
}

export const FAQView: React.FC = () => {
  const { language, setActiveTab, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'earn' | 'wallet' | 'account' | 'security'>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-earn-1': true,
    'faq-wallet-1': false,
    'faq-account-1': false,
  });

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqItems: FaqItem[] = useMemo(() => [
    {
      id: 'faq-earn-1',
      category: 'earn',
      question: getTranslation(language, 'faq.q1'),
      answer: getTranslation(language, 'faq.a1'),
    },
    {
      id: 'faq-earn-2',
      category: 'earn',
      question: getTranslation(language, 'faq.q2'),
      answer: getTranslation(language, 'faq.a2'),
    },
    {
      id: 'faq-earn-3',
      category: 'earn',
      question: getTranslation(language, 'faq.q3'),
      answer: getTranslation(language, 'faq.a3'),
    },
    {
      id: 'faq-wallet-1',
      category: 'wallet',
      question: getTranslation(language, 'faq.q4'),
      answer: getTranslation(language, 'faq.a4'),
      linkText: getTranslation(language, 'faq.linkDeposit'),
      linkTab: 'wallet',
    },
    {
      id: 'faq-wallet-2',
      category: 'wallet',
      question: getTranslation(language, 'faq.q5'),
      answer: getTranslation(language, 'faq.a5'),
      linkText: getTranslation(language, 'faq.linkWithdraw'),
      linkTab: 'wallet',
    },
    {
      id: 'faq-account-1',
      category: 'account',
      question: getTranslation(language, 'faq.q6'),
      answer: getTranslation(language, 'faq.a6'),
      linkText: getTranslation(language, 'faq.linkSettings'),
      linkTab: 'settings',
    },
    {
      id: 'faq-account-2',
      category: 'account',
      question: getTranslation(language, 'faq.q7'),
      answer: getTranslation(language, 'faq.a7'),
      linkText: getTranslation(language, 'faq.linkSecurity'),
      linkTab: 'security',
    },
    {
      id: 'faq-account-3',
      category: 'account',
      question: getTranslation(language, 'faq.q8'),
      answer: getTranslation(language, 'faq.a8'),
      linkText: getTranslation(language, 'faq.linkSettings'),
      linkTab: 'settings',
    },
    {
      id: 'faq-security-1',
      category: 'security',
      question: getTranslation(language, 'faq.q9'),
      answer: getTranslation(language, 'faq.a9'),
      linkText: getTranslation(language, 'faq.linkSecurity'),
      linkTab: 'security',
    },
    {
      id: 'faq-security-2',
      category: 'security',
      question: getTranslation(language, 'faq.q10'),
      answer: getTranslation(language, 'faq.a10'),
      linkText: getTranslation(language, 'faq.linkSupport'),
      linkTab: 'chat',
    },
  ], [language]);

  const filteredFaqs = useMemo(() => {
    return faqItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>{getTranslation(language, 'faq.title')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {getTranslation(language, 'faq.title')}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            {getTranslation(language, 'faq.subtitle')}
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation(language, 'faq.search')}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: getTranslation(language, 'faq.cat.all') },
          { id: 'earn', label: getTranslation(language, 'faq.cat.earn'), icon: Coins },
          { id: 'wallet', label: getTranslation(language, 'faq.cat.wallet'), icon: Wallet },
          { id: 'account', label: getTranslation(language, 'faq.cat.account'), icon: UserCheck },
          { id: 'security', label: getTranslation(language, 'faq.cat.security'), icon: ShieldCheck },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-500" />
            <p className="text-sm font-bold text-white">No FAQ questions found matching your search.</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with different keywords or browse all topics.</p>
          </div>
        ) : (
          filteredFaqs.map(item => {
            const isOpen = !!openIds[item.id];
            return (
              <div 
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-sm font-bold text-white">{item.question}</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 bg-slate-950/40 space-y-4 animate-fadeIn">
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {item.answer}
                    </div>

                    {item.linkText && item.linkTab && (
                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => setActiveTab(item.linkTab as any)}
                          className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <span>{item.linkText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help Support Card */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/50 border border-blue-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{getTranslation(language, 'faq.stillNeedHelp')}</h3>
            <p className="text-xs text-slate-300 mt-1">{getTranslation(language, 'faq.supportPrompt')}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('chat')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all shrink-0"
        >
          {getTranslation(language, 'faq.contactSupport')}
        </button>
      </div>
    </div>
  );
};
