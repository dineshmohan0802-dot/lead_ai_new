import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Zap, ArrowRight, Target, Brain, LineChart, Globe,
  CheckCircle2, ChevronDown, Star, Radio, Users,
  TrendingUp, MessageSquare, Shield,
} from 'lucide-react';

// ─── Animation variants ────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: EASE },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sample data for the animated hero feed ────────────────────────
const FEED_CARDS = [
  {
    source: 'reddit', intent: 'hot', score: 94,
    title: 'Looking for Apollo.io alternative',
    snippet: 'We pay $800/mo and barely use 10% of features. Anyone using something lighter?',
    time: '2m ago',
  },
  {
    source: 'twitter', intent: 'high', score: 82,
    title: 'Frustrated with ZoomInfo pricing',
    snippet: 'Just got renewal quote. 40% increase with no new features. Time to switch.',
    time: '5m ago',
  },
  {
    source: 'linkedin', intent: 'medium', score: 67,
    title: 'Building our outbound stack from scratch',
    snippet: 'VP of Sales at Series B startup. Need lead gen tools that actually scale.',
    time: '11m ago',
  },
  {
    source: 'reddit', intent: 'hot', score: 91,
    title: 'Leaving Outreach — what\'s next?',
    snippet: 'Our entire team hates the UX. Actively evaluating. Budget approved.',
    time: '18m ago',
  },
  {
    source: 'twitter', intent: 'high', score: 78,
    title: 'Anyone use intent data for cold outreach?',
    snippet: 'Looking for tools that surface buying signals before competitors do.',
    time: '24m ago',
  },
  {
    source: 'linkedin', intent: 'medium', score: 61,
    title: 'Scaling SDR team — need better tooling',
    snippet: 'Currently using spreadsheets. Need something real. Open to demos.',
    time: '31m ago',
  },
];

// ─── Features ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: Globe, title: 'Multi-Source Ingestion', description: 'Pull high-intent signals from Reddit, Twitter, and LinkedIn into one unified feed automatically.' },
  { icon: Brain, title: 'AI Enrichment', description: 'AI agents analyze sentiment, extract context, and summarize intent — saving hours of reading.' },
  { icon: Target, title: 'Smart Intent Scoring', description: 'Deterministic rules + AI-driven adjustments instantly surface your hottest prospects.' },
  { icon: LineChart, title: 'Automated Outreach', description: 'Generate personalized, context-aware outreach drafts with a single click.' },
  { icon: Radio, title: 'Real-Time Monitoring', description: 'Continuous signal ingestion so you never miss a buying moment across social channels.' },
  { icon: Shield, title: 'ICP Filtering', description: 'Define your ideal customer profile and auto-filter signals that don\'t match your targets.' },
];

// ─── How it works steps ────────────────────────────────────────────
const STEPS = [
  { number: '01', title: 'Configure Keywords', description: 'Tell LeadPulse what to listen for — competitor names, pain points, and buying signals relevant to your product.' },
  { number: '02', title: 'AI Enriches Signals', description: 'Our pipeline ingests posts and comments, scores intent, analyzes sentiment, and extracts decision-maker context.' },
  { number: '03', title: 'Close More Deals', description: 'Review scored leads, generate personalized outreach in one click, and reach prospects before your competitors do.' },
];

// ─── Pricing tiers ─────────────────────────────────────────────────
const PRICING = [
  {
    name: 'Starter', price: '$0', period: '/mo', popular: false,
    description: 'For indie founders and solo sales reps.',
    features: ['50 signals / month', '10 leads tracked', 'Reddit monitoring', 'Basic intent scoring', 'Community support'],
    cta: 'Get started free',
  },
  {
    name: 'Pro', price: '$49', period: '/mo', popular: true,
    description: 'For growing sales teams who move fast.',
    features: ['2,000 signals / month', 'Unlimited leads', 'Reddit + Twitter + LinkedIn', 'AI enrichment + outreach drafts', 'Priority support', 'Custom ICP filters'],
    cta: 'Start free trial',
  },
  {
    name: 'Team', price: '$149', period: '/mo', popular: false,
    description: 'For established GTM teams at scale.',
    features: ['10,000 signals / month', 'Team seats (up to 10)', 'All Pro features', 'API access', 'Dedicated onboarding', 'SLA guarantee'],
    cta: 'Contact sales',
  },
];

// ─── Testimonials ──────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: 'LeadPulse surfaced three enterprise leads in the first 48 hours. The AI-generated outreach converted two of them within a week.', name: 'Sarah K.', role: 'Head of Growth, Series A SaaS' },
  { quote: 'We replaced a $1,200/mo tool with LeadPulse at $49/mo and got better intent signals. It\'s a no-brainer.', name: 'Marcus T.', role: 'Founder, B2B consulting firm' },
  { quote: 'The signal feed is like having a researcher monitoring Reddit and LinkedIn 24/7. Our SDRs love it.', name: 'Priya M.', role: 'VP of Sales, 50-person startup' },
];

// ─── FAQ ───────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How does LeadPulse find leads?', a: 'We continuously monitor Reddit, Twitter, and LinkedIn for posts matching your keywords — competitor mentions, pain-point expressions, tool-switching signals, and buying intent phrases.' },
  { q: 'What makes the intent scoring accurate?', a: 'Scoring combines deterministic keyword matching (competitors, industry terms) with an AI layer that evaluates sentiment, urgency, and decision-maker context to assign a 0–100 intent score.' },
  { q: 'How does the outreach generation work?', a: 'Each signal is summarized by AI, which then generates a context-aware opener and full message tailored to the prospect\'s specific pain point — not a generic template.' },
  { q: 'Can I try it before paying?', a: 'Yes — the Starter plan is permanently free with 50 signals/month. No credit card required to sign up.' },
  { q: 'Which social platforms are supported?', a: 'Reddit and Twitter/X are live now. LinkedIn is in beta (currently scraping public posts). More platforms are on the roadmap.' },
];

// ─── Badge colors ──────────────────────────────────────────────────
const intentColor: Record<string, string> = {
  hot: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  high: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  medium: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
};
const sourceColor: Record<string, string> = {
  reddit: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  twitter: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200',
  linkedin: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
};

// ─── Small components ──────────────────────────────────────────────
function FeedCard({ card }: { card: typeof FEED_CARDS[0] }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${sourceColor[card.source]}`}>
            {card.source}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${intentColor[card.intent]}`}>
            {card.intent === 'hot' ? '🔥 ' : ''}{card.intent}
          </span>
        </div>
        <span className="text-xs text-gray-400">{card.time}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{card.title}</p>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{card.snippet}</p>
      <div className="mt-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-brand-500" />
        <span className="text-xs font-bold text-brand-600">{card.score} pts</span>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  // Duplicate feed for seamless infinite scroll
  const feedItems = [...FEED_CARDS, ...FEED_CARDS];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">LeadPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white">
          {/* Subtle mesh gradient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-brand-50 via-violet-50 to-transparent rounded-full blur-3xl opacity-70" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-50 to-transparent rounded-full blur-3xl opacity-50" />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left: copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold ring-1 ring-brand-200 mb-6">
                  <Zap className="w-3.5 h-3.5" /> AI-powered B2B lead intelligence
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-6"
              >
                Turn social noise into{' '}
                <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                  high-intent leads
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg"
              >
                LeadPulse listens to Reddit, Twitter, and LinkedIn to find people
                actively searching for your product — then drafts your outreach instantly.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-lg group"
                >
                  Start capturing leads
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-all"
                >
                  See how it works
                </a>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-5 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free plan, no card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live in minutes</span>
              </motion.div>
            </motion.div>

            {/* Right: animated signal feed */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Fade masks */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

              <div className="h-[520px] overflow-hidden rounded-2xl">
                <div className="animate-scroll-up flex flex-col gap-4 px-2">
                  {feedItems.map((card, i) => (
                    <FeedCard key={`${card.title}-${i}`} card={card} />
                  ))}
                </div>
              </div>

              {/* Floating "live" pill */}
              <div className="absolute -top-3 -right-3 z-20 flex items-center gap-1.5 bg-white border border-gray-100 shadow-md rounded-full px-3 py-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">Live signals</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Problem statement ─────────────────────────────────── */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                The Problem
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Buyers are already talking. <br className="hidden md:block" />You're just not listening.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
                Every day, thousands of potential customers post about their pain points on social media. Most sales teams never see it.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { icon: Users, title: 'Manual prospecting is slow', body: 'SDRs spend 4+ hours/day on research that AI can do in seconds.' },
                { icon: MessageSquare, title: 'Generic outreach fails', body: 'Cold emails with no context get <1% reply rates. Personalization at scale is impossible.' },
                { icon: TrendingUp, title: 'Intent signals go unnoticed', body: 'Competitors switch, budgets open, and pain points surface publicly — while your pipeline stalls.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 text-left hover:shadow-md transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                How it works
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900">
                From signal to signed deal in 3 steps
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-gray-100 via-brand-200 to-gray-100 z-0" />

              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="relative z-10 text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-black mb-5 shadow-lg shadow-brand-600/20">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────── */}
        <section id="features" className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-14"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                Features
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Everything you need to close more deals
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 text-lg max-w-xl">
                Stop endlessly scrolling social media. Let AI find and qualify prospects automatically.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                Pricing
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Simple, transparent pricing
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 text-lg">
                Start free. Upgrade when you're ready to scale.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
              {PRICING.map((tier, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className={`relative rounded-2xl p-8 transition-all duration-200 ${
                    tier.popular
                      ? 'bg-brand-600 text-white shadow-2xl shadow-brand-600/25 scale-105 ring-4 ring-brand-300'
                      : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full shadow-md">
                        <Star className="w-3 h-3 fill-current" /> Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className={`text-lg font-bold mb-1 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                  <p className={`text-sm mb-5 ${tier.popular ? 'text-brand-200' : 'text-gray-500'}`}>{tier.description}</p>

                  <div className="flex items-end gap-1 mb-6">
                    <span className={`text-4xl font-black ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                    <span className={`text-sm font-medium mb-1 ${tier.popular ? 'text-brand-200' : 'text-gray-400'}`}>{tier.period}</span>
                  </div>

                  <Link
                    to="/register"
                    className={`block w-full text-center font-semibold text-sm py-3 rounded-xl transition-all mb-6 ${
                      tier.popular
                        ? 'bg-white text-brand-700 hover:bg-brand-50'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  <ul className="space-y-2.5">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${tier.popular ? 'text-brand-200' : 'text-emerald-500'}`} />
                        <span className={tier.popular ? 'text-brand-100' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────── */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                Testimonials
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Trusted by B2B sales teams
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.quote}"</p>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-6 bg-white">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
                FAQ
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Common questions
              </motion.h2>
            </motion.div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-brand-600 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500 rounded-full blur-3xl opacity-40" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600 rounded-full blur-3xl opacity-40" />
          </div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Ready to supercharge your pipeline?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
              Join forward-thinking sales teams closing deals from social intent signals.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-brand-700 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl text-base group"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-brand-300 text-sm mt-4">
              No credit card required · Free plan available · Setup in 5 minutes
            </motion.p>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">LeadPulse</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} LeadPulse Inc.</p>
        </div>
      </footer>
    </div>
  );
}
