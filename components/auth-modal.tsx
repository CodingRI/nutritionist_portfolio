'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ModalOverlay } from '@/components/ui/modal-overlay';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Auth submission:', { email, password, name, type });
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {type === 'login' ? 'Welcome Back' : 'Join Us'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-6"
          >
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-4">
          {type === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            className="text-primary font-medium hover:underline"
          >
            {type === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </ModalOverlay>
  );
};

export default AuthModal;
