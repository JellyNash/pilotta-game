import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PotpieAPIService } from '../services/potpieApi';
import { PotpieAgent } from '../types/potpie';

interface AnalysisResult {
  type: string;
  content: string;
  timestamp: Date;
}

const PotpieAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<PotpieAgent>(PotpieAgent.CodebaseQA);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  
  const potpieApi = new PotpieAPIService(import.meta.env.VITE_POTPIE_API_KEY);

  // Initialize or get existing project
  const initializeProject = async () => {
    try {
      // Check for existing project ID
      const storedProjectId = localStorage.getItem('potpie_project_id');
      
      if (storedProjectId) {
        setProjectId(storedProjectId);
        // Create new conversation
        const conv = await potpieApi.createConversation(
          storedProjectId,
          selectedAgent,
          'Interactive Analysis'
        );
        setConversationId(conv.conversation_id);
      } else {
        // Parse repository
        setIsLoading(true);
        const { project_id } = await potpieApi.parseRepository('JellyNash/pilotta-game', 'main');
        setProjectId(project_id);
        localStorage.setItem('potpie_project_id', project_id);
        
        // Create conversation
        const conv = await potpieApi.createConversation(
          project_id,
          selectedAgent,
          'Interactive Analysis'
        );
        setConversationId(conv.conversation_id);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to initialize Potpie:', error);
      setIsLoading(false);
    }
  };

  // Send query to Potpie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !projectId || !conversationId) return;

    setIsLoading(true);
    try {
      const response = await potpieApi.sendMessage(
        projectId,
        conversationId,
        selectedAgent,
        query
      );

      const newResult: AnalysisResult = {
        type: selectedAgent,
        content: response.response.answer,
        timestamp: new Date()
      };

      setResults([...results, newResult]);
      setQuery('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick analysis templates
  const quickAnalyses = [
    {
      agent: PotpieAgent.CodebaseQA,
      query: "What are the main components and their responsibilities in this card game?",
      label: "🏗️ Architecture Overview"
    },
    {
      agent: PotpieAgent.Debugging,
      query: "Find potential memory leaks or performance issues in the game components",
      label: "⚡ Performance Issues"
    },
    {
      agent: PotpieAgent.CodeReview,
      query: "Review the game state management and suggest improvements",
      label: "🎯 State Management Review"
    },
    {
      agent: PotpieAgent.Debugging,
      query: "Check for bugs in the card playing logic and game rules implementation",
      label: "🐛 Game Logic Bugs"
    },
    {
      agent: PotpieAgent.UnitTest,
      query: "Generate unit tests for the core game logic functions",
      label: "🧪 Generate Tests"
    }
  ];

  React.useEffect(() => {
    if (isOpen && !projectId) {
      initializeProject();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
        title="Potpie Code Analyzer"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </motion.button>

      {/* Analyzer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span>🍯</span> Potpie Code Analyzer
                    </h2>
                    <p className="text-purple-100 mt-1">AI-powered codebase analysis for Pilotta Game</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col p-6">
                {/* Quick Actions */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Quick Analyses</h3>
                  <div className="flex flex-wrap gap-2">
                    {quickAnalyses.map((qa, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedAgent(qa.agent);
                          setQuery(qa.query);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {results.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                      <p className="text-lg mb-2">No analysis results yet</p>
                      <p className="text-sm">Ask a question about your codebase or use a quick analysis</p>
                    </div>
                  ) : (
                    results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-purple-400">
                            {result.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {result.content}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value as PotpieAgent)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
                    >
                      <option value={PotpieAgent.CodebaseQA}>Codebase Q&A</option>
                      <option value={PotpieAgent.Debugging}>Debugging</option>
                      <option value={PotpieAgent.CodeReview}>Code Review</option>
                      <option value={PotpieAgent.UnitTest}>Unit Test</option>
                      <option value={PotpieAgent.IntegrationTest}>Integration Test</option>
                      <option value={PotpieAgent.CodeOptimization}>Optimization</option>
                      <option value={PotpieAgent.CodeDocumentation}>Documentation</option>
                    </select>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask about your codebase..."
                      className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Analyze'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PotpieAnalyzer;