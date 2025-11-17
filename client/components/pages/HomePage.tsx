'use client';

import React from 'react';
import { Fish, BarChart3, Target, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface HomePageProps {
  onNavigateToPhenotyping: () => void;
}

export default function HomePage({ onNavigateToPhenotyping }: HomePageProps) {
  const features = [
    {
      icon: Fish,
      title: 'AI-Powered Analysis',
      description: 'Advanced computer vision for precise fish measurement and phenotyping',
      color: 'from-neutral-900 to-neutral-700'
    },
    {
      icon: BarChart3,
      title: 'Detailed Metrics',
      description: 'Comprehensive measurement data with statistical analysis',
      color: 'from-neutral-900 to-neutral-700'
    },
    {
      icon: Target,
      title: 'High Accuracy',
      description: 'High-accuracy detection with sub-millimeter precision',
      color: 'from-neutral-900 to-neutral-700'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Real-time analysis with optimized algorithms',
      color: 'from-neutral-900 to-neutral-700'
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black flex items-center justify-center shadow-2xl overflow-hidden">
                <img src="/octapulse_logo.png" alt="OctaPulse" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mono-bold tracking-tight px-4">
                OctaPulse
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto sans-clean leading-relaxed px-4">
                Professional aquaculture analysis platform for imaging-driven insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToPhenotyping}
                className="px-8 py-4 bg-black text-white mono-bold rounded-md hover:bg-neutral-800 transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-neutral-900 sans-clean font-semibold rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors duration-200 shadow-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mono-bold px-4">
            Advanced Fish Analysis Technology
          </h2>
          <p className="text-base sm:text-lg text-gray-700 sans-clean px-4">
            Cutting-edge tools for professional aquaculture research and analysis
          </p>
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center px-4">
            <a href="/analytics" className="px-3 sm:px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-neutral-800 whitespace-nowrap">Analytics</a>
            <a href="/hardware" className="px-3 sm:px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50 whitespace-nowrap">Hardware</a>
            <a href="/system-config" className="px-3 sm:px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50 whitespace-nowrap">System Config</a>
            <a href="/settings" className="px-3 sm:px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50 whitespace-nowrap">Settings</a>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 hover:border-neutral-300 transition-colors duration-200 hover:shadow-md group"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 mono-bold">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed sans-clean">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-neutral-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  Why Choose OctaPulse?
                </h2>
                <p className="text-lg text-gray-600">
                  Our platform combines state-of-the-art AI technology with practical 
                  aquaculture needs to deliver unmatched analysis capabilities.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={onNavigateToPhenotyping}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-md transition-colors duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Fish className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Analysis Ready</h3>
                      <p className="text-gray-600 text-sm">System status: Online</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">99.2%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">&lt; 30s</div>
                      <div className="text-sm text-gray-600">Processing</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">YOLOv8</div>
                      <div className="text-sm text-gray-600">AI Model</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">24/7</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Analyze Your Fish?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Upload your first image and experience the power of AI-driven phenotyping
          </p>
          <button
            onClick={onNavigateToPhenotyping}
            className="px-8 py-4 bg-white text-black font-semibold rounded-md hover:bg-neutral-50 transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Fish className="w-5 h-5" />
            <span>Start Phenotyping</span>
          </button>
        </div>
      </div>
    </div>
  );
}