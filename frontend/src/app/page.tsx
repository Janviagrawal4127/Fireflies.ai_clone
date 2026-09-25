'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mic2,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Zap,
  Globe,
  Users,
  MessageSquare,
  Search,
  BarChart2,
  Clock,
  ChevronRight,
  Cpu,
} from 'lucide-react';

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Fireflies</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {['Product', 'Solutions', 'Integrations', 'Resources', 'Enterprise', 'Pricing'].map((item) => (
              <button
                key={item}
                className="hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5">
              Request Demo
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              Open App
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d0d1a] border-t border-white/5 px-4 py-4 space-y-3">
          {['Product', 'Solutions', 'Integrations', 'Resources', 'Enterprise', 'Pricing'].map((item) => (
            <button
              key={item}
              className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white py-1.5 transition-colors"
            >
              {item}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button className="text-sm text-slate-300 text-left py-1.5">Request Demo</button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg"
            >
              Open App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 overflow-hidden bg-[#0d0d1a]">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[280px] rounded-full bg-indigo-800/20 blur-[100px]" />
        {/* Subtle star dots */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
        <Zap className="w-3.5 h-3.5" />
        AI-Powered Meeting Intelligence
      </div>

      {/* Headline */}
      <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black text-white max-w-5xl leading-[1.08] tracking-tight mb-6">
        The #1 AI Assistant For
        <br />
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          Your Meetings
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
        Transcribe, summarize, search, and analyze all your team conversations.
      </p>

      {/* CTA buttons */}
      <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 text-[15px]"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-[15px]">
          Request Demo
        </button>
      </div>

      {/* Product showcase */}
      <div className="relative w-full max-w-5xl mx-auto">
        {/* Outer glow frame */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-violet-600/10 blur-xl -m-4 pointer-events-none" />
        <div className="relative rounded-2xl border border-white/10 bg-[#131326] shadow-2xl shadow-black/60 overflow-hidden">
          {/* Mock app bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0e0e1e]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-4">
              <div className="w-full max-w-xs mx-auto bg-white/5 rounded-md h-5 flex items-center px-2">
                <span className="text-[10px] text-slate-500">app.fireflies.ai/dashboard</span>
              </div>
            </div>
          </div>
          {/* Mock UI content */}
          <div className="flex h-[340px] sm:h-[420px]">
            {/* Sidebar mock */}
            <div className="hidden sm:flex w-48 flex-shrink-0 bg-[#0d0d1a] border-r border-white/5 flex-col p-3 gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800">
                <div className="w-4 h-4 rounded bg-indigo-500/50" />
                <div className="h-2.5 w-16 bg-white/40 rounded" />
              </div>
              {['Notebook', 'Analytics', 'Settings'].map((item) => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                  <div className="w-4 h-4 rounded bg-slate-700" />
                  <div className="h-2 w-14 bg-white/15 rounded" />
                </div>
              ))}
              <div className="mt-auto border-t border-white/5 pt-2">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/60 flex-shrink-0" />
                  <div className="h-2 w-16 bg-white/20 rounded" />
                </div>
              </div>
            </div>
            {/* Main area mock */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-28 bg-white/50 rounded" />
                <div className="h-8 w-24 bg-indigo-600/70 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Q3 Product Review', time: '2 hours ago', lines: [75, 55, 45] },
                  { title: 'Sprint Planning', time: 'Yesterday', lines: [65, 80, 35] },
                  { title: 'Design Sync', time: '2 days ago', lines: [50, 70, 60] },
                  { title: 'Customer Interview', time: '3 days ago', lines: [85, 40, 55] },
                ].map((card, i) => (
                  <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-3.5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-3 rounded bg-white/60" style={{ width: `${card.title.length * 5.5}px`, maxWidth: '80%' }} />
                      <div className="h-2 w-16 bg-indigo-400/40 rounded-full" />
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {card.lines.map((w, j) => (
                        <div key={j} className="h-2 bg-white/15 rounded" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[0,1,2].map(a => <div key={a} className="w-5 h-5 rounded-full bg-indigo-500/40 ring-1 ring-[#131326]" />)}
                      </div>
                      <div className="h-2 w-10 bg-white/15 rounded" />
                      <div className="h-2 w-12 bg-white/10 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 1: Transcription ──────────────────────────────────────────────────

function TranscriptionSection() {
  const features = [
    { icon: CheckCircle, label: '95% Accurate', color: 'text-emerald-400' },
    { icon: Globe, label: '100+ Languages', color: 'text-blue-400' },
    { icon: Users, label: 'Speaker Recognition', color: 'text-violet-400' },
    { icon: Cpu, label: 'Auto Language Detection', color: 'text-indigo-400' },
  ];

  return (
    <section className="bg-[#0d0d1a] py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="inline-block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Transcription</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              High Quality Meeting
              <br />
              <span className="text-indigo-400">Transcription & Recording</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Automatically record and transcribe meetings with state-of-the-art accuracy. Every word, every speaker — captured and searchable.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/8">
                  <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Transcript preview card */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/10 rounded-2xl blur-2xl -m-4 pointer-events-none" />
            <div className="relative bg-[#131326] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">Live Transcript</span>
                <span className="ml-auto text-xs text-slate-500">23:14</span>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { speaker: 'Sarah M.', color: 'bg-indigo-500', time: '00:14', text: "Let's kick off with the Q3 review. Overall, revenue is up 18%." },
                  { speaker: 'James K.', color: 'bg-violet-500', time: '00:42', text: "Agreed. The product launch contributed significantly to growth in July." },
                  { speaker: 'Anita R.', color: 'bg-emerald-500', time: '01:05', text: "We also saw improved retention — churn dropped from 5.2% to 3.8%." },
                  { speaker: 'Sarah M.', color: 'bg-indigo-500', time: '01:30', text: "Great. Let's define our action items for next quarter." },
                ].map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full ${line.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                      {line.speaker.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200">{line.speaker}</span>
                        <span className="text-[10px] font-mono text-slate-500">{line.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: AI Summaries ───────────────────────────────────────────────────

function SummarySection() {
  const tabs = ['Overview', 'Bullet Points', 'Action Items', 'Custom Notes'];

  return (
    <section className="bg-[#0a0a17] py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Summary preview */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-2xl -m-4 pointer-events-none" />
            <div className="relative bg-[#131326] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex gap-0 border-b border-white/5">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-3 py-3 text-[11px] font-semibold transition-colors flex-1 ${i === 0 ? 'border-b-2 border-indigo-500 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overview</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    The team reviewed Q3 performance metrics showing 18% revenue growth. Discussed product launch impact and reduced churn rate. Agreed on Q4 strategic priorities and assigned key initiatives.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {['Q3 Review', 'Revenue Growth', 'Churn', 'Q4 Planning', 'Retention'].map((t) => (
                      <span key={t} className="text-xs bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Action Items</p>
                  <div className="space-y-2">
                    {[
                      { task: 'Prepare Q4 roadmap draft', assignee: 'Sarah' },
                      { task: 'Review pricing strategy proposal', assignee: 'James' },
                      { task: 'Schedule customer interviews', assignee: 'Anita' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2">
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400/50 flex-shrink-0" />
                        <span className="text-xs text-slate-300 flex-1">{item.task}</span>
                        <span className="text-[10px] text-slate-500">{item.assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="order-1 lg:order-2">
            <span className="inline-block text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">AI Summaries</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Comprehensive
              <br />
              <span className="text-violet-400">AI Summaries</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Never waste time writing meeting notes again. Fireflies generates structured summaries with overviews, bullet points, action items, and custom notes automatically.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Capture Anywhere ──────────────────────────────────────────────

function CaptureSection() {
  return (
    <section className="bg-[#0d0d1a] py-28 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Capture</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          Capture Meetings <span className="text-indigo-400">Anywhere</span> & Anytime
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-14">
          Works wherever your team meets — from video calls to in-person conversations.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Mic2,
              title: 'AI Note Taker Bot',
              description: 'Automatically joins your Zoom, Meet, and Teams calls. Records, transcribes, and summarizes while you stay focused on the conversation.',
              badge: 'Auto-Join',
              badgeColor: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30',
              gradient: 'from-indigo-600/20 to-indigo-900/10',
              borderColor: 'border-indigo-500/20',
            },
            {
              icon: Zap,
              title: 'Chrome Extension',
              description: 'Record any meeting directly in your browser. Capture Google Meet, Zoom web, and any other browser-based video conferencing tool.',
              badge: 'Browser',
              badgeColor: 'text-violet-300 bg-violet-950/60 border-violet-500/30',
              gradient: 'from-violet-600/20 to-violet-900/10',
              borderColor: 'border-violet-500/20',
            },
          ].map(({ icon: Icon, title, description, badge, badgeColor, gradient, borderColor }) => (
            <div
              key={title}
              className={`relative bg-gradient-to-br ${gradient} border ${borderColor} rounded-2xl p-8 text-left hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[11px] font-bold border px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-white hover:text-indigo-300 transition-colors"
              >
                Try it free <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: AI Search ──────────────────────────────────────────────────────

function SearchSection() {
  return (
    <section className="bg-[#0a0a17] py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Search</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Remember Every
              <br />
              <span className="text-emerald-400">Conversation</span>
              <br />
              With AI Powered Search
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Search across all your meetings instantly. Find any word, topic, or decision from any conversation — even from months ago.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Search UI mock */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-600/10 rounded-2xl blur-2xl -m-4 pointer-events-none" />
            <div className="relative bg-[#131326] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Search bar */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Search meetings and transcripts...</span>
                </div>
              </div>
              {/* Results */}
              <div className="p-4 space-y-3">
                {[
                  { meeting: 'Q3 Product Review', speaker: 'Sarah M.', time: '01:14', text: '"...let\'s review the revenue growth targets for Q4..."' },
                  { meeting: 'Sprint Planning', speaker: 'James K.', time: '05:32', text: '"...the revenue target is $2.4M by end of quarter..."' },
                  { meeting: 'Board Meeting', speaker: 'Anita R.', time: '22:08', text: '"...revenue projection looks aligned with our estimates..."' },
                ].map((result, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3.5 border border-white/5 hover:border-emerald-500/20 transition-colors cursor-pointer">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">{result.meeting}</p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-2 italic">{result.text}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{result.speaker}</span>
                      <span>·</span>
                      <span>{result.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Conversation Intelligence ─────────────────────────────────────

function IntelligenceSection() {
  const features = [
    { icon: Users, title: 'Speaker Talk-time', description: 'See who dominated the conversation and balance team participation.' },
    { icon: Zap, title: 'AI Filters', description: 'Filter transcripts by questions, metrics, tasks, and sentiment.' },
    { icon: MessageSquare, title: 'Sentiment Analysis', description: 'Understand the emotional tone of your meetings at a glance.' },
    { icon: BarChart2, title: 'Topic Trackers', description: 'Track recurring topics and keywords across all your meetings.' },
  ];

  return (
    <section className="bg-[#0d0d1a] py-28 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-block text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Intelligence</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          Conversation Intelligence
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
          Go beyond transcription. Understand the dynamics, sentiment, and patterns inside every meeting.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white/5 rounded-2xl border border-white/8 p-6 text-left hover:bg-white/8 hover:border-indigo-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Transcript visualization strip */}
        <div className="mt-12 bg-[#131326] rounded-2xl border border-white/10 p-5 max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-left">Speaker Talk-time</p>
          <div className="space-y-3">
            {[
              { name: 'Sarah M.', percent: 42, color: 'bg-indigo-500' },
              { name: 'James K.', percent: 28, color: 'bg-violet-500' },
              { name: 'Anita R.', percent: 22, color: 'bg-emerald-500' },
              { name: 'Others', percent: 8, color: 'bg-slate-500' },
            ].map(({ name, percent, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-20 text-right">{name}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${percent}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-300 w-8">{percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Final CTA ──────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-[#0a0a17] py-28 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative bg-gradient-to-br from-indigo-900/60 to-violet-900/40 border border-indigo-500/20 rounded-3xl px-8 sm:px-16 py-16">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mic2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
              Turn Every Meeting Into
              <br />
              <span className="text-indigo-400">Actionable Insights</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join teams who never miss a decision, follow-up, or insight from their meetings.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 text-[15px] hover:scale-105"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">No credit card required · Free to get started</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const cols = [
    {
      title: 'Product',
      links: ['Transcription', 'AI Summaries', 'Action Items', 'Search', 'Integrations'],
    },
    {
      title: 'Solutions',
      links: ['Sales Teams', 'Recruiting', 'Engineering', 'Product Teams', 'Education'],
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Blog', 'Help Center', 'Changelog', 'Status'],
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press', 'Partners', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'],
    },
  ];

  return (
    <footer className="bg-[#0d0d1a] border-t border-white/5 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Mic2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">Fireflies</span>
            </div>
            <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">
              AI meeting assistant for teams that move fast.
            </p>
          </div>

          {/* Links */}
          {cols.map(({ title, links }) => (
            <div key={title}>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} Fireflies.ai Clone. All rights reserved.</p>
          <p className="text-xs text-slate-700">Built as a learning project — not affiliated with Fireflies.ai</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main page export ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      <Hero />
      <TranscriptionSection />
      <SummarySection />
      <CaptureSection />
      <SearchSection />
      <IntelligenceSection />
      <CTASection />
      <Footer />
    </div>
  );
}
