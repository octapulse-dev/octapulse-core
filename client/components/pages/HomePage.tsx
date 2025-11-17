'use client';

import React from 'react';
import { Fish, BarChart3, Target, Zap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigateToPhenotyping: () => void;
}

export default function HomePage({ onNavigateToPhenotyping }: HomePageProps) {
  const features = [
    {
      icon: Fish,
      title: 'AI-Powered Analysis',
      description: 'Advanced computer vision for precise fish measurement and phenotyping',
      color: 'from-sky-500/20 to-emerald-500/20'
    },
    {
      icon: BarChart3,
      title: 'Detailed Metrics',
      description: 'Comprehensive measurement data with statistical analysis',
      color: 'from-sky-500/20 to-cyan-500/20'
    },
    {
      icon: Target,
      title: 'High Accuracy',
      description: 'High-accuracy detection with sub-millimeter precision',
      color: 'from-emerald-500/20 to-cyan-500/20'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Real-time analysis with optimized algorithms',
      color: 'from-cyan-500/20 to-sky-500/20'
    }
  ];

  const benefits = [
    'Automated fish measurement and analysis',
    'Scientific-grade precision and accuracy',
    'Export data in multiple formats',
    'Batch processing capabilities',
    'Professional visualization tools'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden hero-gradient grid-pattern">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center shadow-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-emerald-500/10 animate-pulse"></div>
                <img src="/octapulse_logo.png" alt="OctaPulse" className="w-20 h-20 object-contain relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-7xl font-bold text-white mono-bold tracking-tight">
                OctaPulse
              </h1>
              <p className="text-2xl text-gray-400 max-w-3xl mx-auto sans-clean leading-relaxed">
                Professional aquaculture analysis platform for imaging-driven insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={onNavigateToPhenotyping}
                className="px-10 py-5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white mono-bold rounded-xl hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-sky-500/50 flex items-center justify-center space-x-3 group"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-white/5 text-white sans-clean font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-5xl font-bold text-white mono-bold">
            Advanced Fish Analysis Technology
          </h2>
          <p className="text-xl text-gray-400 sans-clean max-w-2xl mx-auto">
            Cutting-edge tools for professional aquaculture research and analysis
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <a href="/analytics" className="px-5 py-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-lg text-sm hover:bg-sky-500/25 hover:border-sky-500/50 transition-all tech-mono">Analytics</a>
            <a href="/hardware" className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/10 hover:border-white/20 transition-all tech-mono">Hardware</a>
            <a href="/system-config" className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/10 hover:border-white/20 transition-all tech-mono">System Config</a>
            <a href="/settings" className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/10 hover:border-white/20 transition-all tech-mono">Settings</a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="dark-card p-8 group cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 mono-bold">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed sans-clean">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-black/30 backdrop-blur-sm py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white mono-bold">
                  Why Choose OctaPulse?
                </h2>
                <p className="text-lg text-gray-400 sans-clean leading-relaxed">
                  Our platform combines state-of-the-art AI technology with practical 
                  aquaculture needs to deliver unmatched analysis capabilities.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-all">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-lg sans-clean">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={onNavigateToPhenotyping}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-sky-500/30 group"
              >
                <span className="mono-bold">Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="relative">
              <div className="dark-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10">
                      <Fish className="w-7 h-7 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mono-bold text-lg">Analysis Ready</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-gray-400 text-sm tech-mono">System Online</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="metric-display">
                      <div className="metric-value">99.2%</div>
                      <div className="metric-label">Accuracy</div>
                    </div>
                    <div className="metric-display">
                      <div className="metric-value">&lt; 30s</div>
                      <div className="metric-label">Processing</div>
                    </div>
                    <div className="metric-display">
                      <div className="metric-value">YOLOv8</div>
                      <div className="metric-label text-xs">AI Model</div>
                    </div>
                    <div className="metric-display">
                      <div className="metric-value">24/7</div>
                      <div className="metric-label">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="dark-card p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-12 h-12 text-sky-400 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold text-white mono-bold">
              Ready to Analyze Your Fish?
            </h2>
            <p className="text-xl text-gray-400 sans-clean max-w-2xl mx-auto">
              Upload your first image and experience the power of AI-driven phenotyping
            </p>
            <button
              onClick={onNavigateToPhenotyping}
              className="px-10 py-5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 inline-flex items-center space-x-3 shadow-lg hover:shadow-sky-500/50 group-hover:scale-105"
            >
              <Fish className="w-6 h-6" />
              <span className="mono-bold">Start Phenotyping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
