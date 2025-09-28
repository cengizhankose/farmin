'use client';

import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 text-center ${className}`}
    >
      <div className="text-6xl mb-4">😞</div>
      <h3 className="text-xl font-bold text-red-400 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-300 mb-6">{message}</p>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          🔄 Try Again
        </motion.button>
      )}
    </motion.div>
  );
}