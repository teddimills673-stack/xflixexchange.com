'use content'; // Note: 'use client';
'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  Building2, ExternalLink, Copy, CheckCircle2, ChevronDown, ChevronUp, 
  ShieldAlert, FileText, Info, Lock, Mail, Phone, AlertCircle 
} from 'lucide-react';

export const LawEnforcementView: React.FC = () => {
  const { addAuditLog } = useApp();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    addAuditLog('LAW_ENFORCEMENT_EMAIL_COPIED', `Official contact email copied: ${email}`, 'SUCCESS');
    setTimeout(() => setCopiedEmail(null), 3000);
  };

  const toggleSection = (sectionNumber: number) => {
    setExpandedSection(prev => (prev === sectionNumber ? null : sectionNumber));
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase font-bold border border-blue-500/20">
                Official Compliance Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">Secure Gateway</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Law Enforcement & Regulatory Requests</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              For Government and Law Enforcement Agencies only. Secure guideline documentation and submission protocols for investigative requests.
            </p>
          </div>
        </div>
      </div>

      {/* Main Notice Box */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 text-amber-300 text-xs">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-400">Restricted Access Notice</p>
          <p className="text-slate-300 leading-relaxed">
            This portal is strictly for authorized government and law enforcement agencies. All requests are logged, verified, and processed in strict compliance with applicable statutory frameworks and institutional privacy standards.
          </p>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Section 1: How to Submit a Request */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection(1)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-base font-bold text-white">How to Submit a Request</h3>
            </div>
            {expandedSection === 1 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 1 && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 text-xs text-slate-300 space-y-4 leading-relaxed">
              <p>
                All law enforcement requests should be submitted through our official Kodex portal.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white text-sm">Kodex Global Portal</p>
                  <p className="text-slate-400 text-[11px]">Primary secure submission gateway for government and law enforcement agencies.</p>
                </div>
                <a
                  href="https://kodexglobal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 justify-center transition-all shrink-0"
                >
                  <span>Access Kodex Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p>
                If you do not already have an account, you will be prompted to create one before you can submit a request. Please contact <button onClick={() => handleCopyEmail('help@kodexglobal.com')} className="text-blue-400 font-mono hover:underline inline-flex items-center gap-1">help@kodexglobal.com {copiedEmail === 'help@kodexglobal.com' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}</button> for assistance.
              </p>

              <p className="text-slate-400 text-[11px]">
                By submitting your request through this platform, you agree to the OKXFLIX Privacy Notice, Kodex Privacy Policy, and Kodex Terms of Use.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="font-semibold text-white">Entity Addressing & Group Entities</p>
                <p className="text-slate-400 text-[11px]">
                  Please address requests to <strong>“OKXFLIX”</strong> rather than to a specific legal entity. As per OKX Terms of Service, the services of OKX.com are being provided by different operating entities.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2">
                <p className="font-semibold text-amber-300">Emergency & Extraordinary Circumstances</p>
                <p className="text-slate-300 text-[11px]">
                  In extraordinary circumstances, such as when you are unable to get onboarded with Kodex or there is an emergency, you may submit your request to:
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 min-w-0">
                  <span className="font-mono text-white text-xs break-all">enforcement@okxflix.com</span>
                  <button
                    onClick={() => handleCopyEmail('enforcement@okxflix.com')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedEmail === 'enforcement@okxflix.com' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Include an explanation of the exceptional circumstances preventing submission through the Kodex portal.
                </p>
              </div>

              <p className="text-slate-400 italic">
                A substantive response can only be provided once all required documentation and information has been supplied. Each request will be reviewed and handled on a case-by-case basis in accordance with the relevant Terms of Service, Privacy Notice, and applicable laws and regulations. We make every effort to respond promptly. If you do not receive a response, please check your email’s junk or spam folder.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Required Documentation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection(2)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-base font-bold text-white">Required Documentation</h3>
            </div>
            {expandedSection === 2 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 2 && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 text-xs text-slate-300 space-y-3 leading-relaxed">
              <p className="text-slate-400">
                For us to effectively consider your request, please provide the following documentation:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-200">
                <li>A signed court order and/or official request letter on your agency’s letterhead.</li>
                <li>Proof of authority, either included in the request or provided separately.</li>
                <li>A signed letter on your agency’s letterhead identifying you by your full name and authorizing you to submit the request to OKXFLIX. The authorization must be signed by someone other than yourself.</li>
                <li>Alternatively, other documentation evidencing your authority to make the request, such as confirmation from an authorized representative, supervisor, or team lead.</li>
              </ul>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-amber-300 font-mono text-[11px]">
                Note: All requests and attachments must be in English.
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Required Information */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection(3)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base font-bold text-white">Required Information</h3>
            </div>
            {expandedSection === 3 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 3 && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 text-xs text-slate-300 space-y-3 leading-relaxed">
              <p className="text-slate-400">
                Requests should include the following comprehensive details:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-blue-400 font-bold block">Agency Details</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>Full name of the agency</li>
                    <li>Official agency contact information</li>
                    <li>Official email address and/or telephone number</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-blue-400 font-bold block">Incident Overview</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>Overview of alleged incident under investigation</li>
                    <li>Investigation findings to date</li>
                    <li>Total investigation amount</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-blue-400 font-bold block">Identifiers & Accounts</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>All available identifiers & target user accounts</li>
                    <li>Relevant OKXFLIX username & account number</li>
                    <li>Registered phone number and email address</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-blue-400 font-bold block">Transactions & Tracing</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>Relevant wallet address(es) and transaction hash(es)</li>
                    <li>Transaction history beginning with first transaction reported by victim</li>
                    <li>Tracing flow showing how funds reached OKXFLIX</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-300 text-[11px]">
                <strong>Data Format Requirement:</strong> All relevant wallet addresses and withdrawal/deposit transaction hashes should also be supplied in a copiable format, such as CSV.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
