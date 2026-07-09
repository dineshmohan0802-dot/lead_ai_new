import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Target, Brain, LineChart, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const features = [
  {
    icon: Globe,
    title: "Multi-Source Ingestion",
    description: "Automatically pull high-intent signals from Reddit, Twitter, and LinkedIn into one unified feed.",
  },
  {
    icon: Brain,
    title: "AI Enrichment",
    description: "Our AI agents analyze sentiment, extract context, and summarize intent to save you hours of reading.",
  },
  {
    icon: Target,
    title: "Smart Intent Scoring",
    description: "Deterministic rules combined with AI-driven adjustments instantly identify your hottest prospects.",
  },
  {
    icon: LineChart,
    title: "Automated Outreach",
    description: "Generate highly personalized, context-aware outreach drafts with a single click.",
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 selection:bg-brand-500/30 font-sans overflow-x-hidden">
      
      {/* Navigation - Minimalist Shadcn Style */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-surface-100">
              LeadPulse
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-surface-400 hover:text-surface-100 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 bg-surface-100 text-surface-950 hover:bg-surface-200 h-9 px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-16">
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-surface-800">
          {/* Stunning Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-surface-950/70 z-10 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/80 to-transparent z-10" />
            <motion.img 
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={heroBg} 
              alt="Futuristic Data Network" 
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-20 text-center flex flex-col items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/50 border border-surface-700 text-surface-300 text-xs font-medium mb-8 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>The intelligent way to source B2B leads</span>
              </div>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-surface-100"
            >
              Turn social noise into <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-500">
                high-intent leads
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-lg md:text-xl text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              LeadPulse listens to Reddit, Twitter, and LinkedIn to find people actively looking for your product. AI enriches the signals and drafts your outreach instantly.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Link to="/register" className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 bg-brand-600 text-white hover:bg-brand-600/90 h-12 px-8 py-2 group">
                Start capturing leads
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-700 disabled:pointer-events-none disabled:opacity-50 border border-surface-700 bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100 h-12 px-8 py-2">
                See how it works
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex items-center justify-center gap-6 text-sm text-surface-500"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Cancel anytime</span>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-surface-950">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-surface-100 mb-4">Everything you need to close more deals</h2>
              <p className="text-surface-400 text-lg max-w-2xl">Stop endlessly scrolling social media. Let AI find and qualify your prospects automatically using our unified intelligence engine.</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  className="p-6 rounded-xl border border-surface-800 bg-surface-900/30 hover:bg-surface-900/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md mb-5 flex items-center justify-center bg-surface-800 border border-surface-700 text-brand-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-surface-100 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative overflow-hidden border-t border-surface-800">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-surface-100 mb-6">Ready to supercharge your pipeline?</h2>
            <p className="text-lg text-surface-400 mb-10 max-w-2xl mx-auto">Join forward-thinking sales teams who are closing deals from social intent signals.</p>
            <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 bg-surface-100 text-surface-950 hover:bg-surface-200 h-11 px-8 py-2">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800 bg-surface-950 py-10 px-6 text-sm text-surface-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-300">
            <Zap className="w-4 h-4 text-brand-500" />
            <span className="font-semibold tracking-tight">LeadPulse</span>
          </div>
          <p>© {new Date().getFullYear()} LeadPulse Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
