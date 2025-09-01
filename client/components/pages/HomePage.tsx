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
      color: 'from-sky-400 to-sky-600'
    },
    {
      icon: BarChart3,
      title: 'Detailed Metrics',
      description: 'Comprehensive measurement data with statistical analysis',
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      icon: Target,
      title: 'High Accuracy',
      description: 'YOLOv8-based detection with sub-millimeter precision',
      color: 'from-teal-400 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Real-time analysis with optimized algorithms',
      color: 'from-cyan-400 to-cyan-600'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Fish className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-gray-900 mono-bold tracking-tight">
                OctaPulse
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto sans-clean leading-relaxed">
                Professional aquaculture analysis platform powered by advanced computer vision and AI
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToPhenotyping}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 text-white mono-bold rounded-xl hover:from-sky-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-800 sans-clean font-semibold rounded-xl border-2 border-gray-200 hover:border-sky-300 hover:text-sky-700 transition-all duration-300 shadow-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mono-bold">
            Advanced Fish Analysis Technology
          </h2>
          <p className="text-lg text-gray-700 sans-clean">
            Cutting-edge tools for professional aquaculture research and analysis
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-sky-200 transition-all duration-300 hover:shadow-xl group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mono-bold">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed sans-clean">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={onNavigateToPhenotyping}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Fish className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Analysis Ready</h3>
                      <p className="text-gray-600 text-sm">System status: Online</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">99.2%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">&lt; 30s</div>
                      <div className="text-sm text-gray-600">Processing</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-900">YOLOv8</div>
                      <div className="text-sm text-gray-600">AI Model</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
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
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Analyze Your Fish?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Upload your first image and experience the power of AI-driven phenotyping
          </p>
          <button
            onClick={onNavigateToPhenotyping}
            className="px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors duration-300 inline-flex items-center space-x-2"
          >
            <Fish className="w-5 h-5" />
            <span>Start Phenotyping</span>
          </button>
        </div>
      </div>
    </div>
  );
}