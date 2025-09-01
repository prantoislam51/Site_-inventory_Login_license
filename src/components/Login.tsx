import React, { useState, useEffect } from 'react';
import { User as UserType } from '../types';
import { login, register } from '../utils/auth';
import { Eye, EyeOff, X, User, Lock, Mail, AlertCircle, Clock, Shield, Key } from 'lucide-react';

// EXPIRY DATE CONFIGURATION - Change this to extend or restrict access
// Ste Yeary - Month - Day Than Set Time 23:59:59
const EXPIRY_DATE = new Date('2026-09-01T23:59:59');
//  Access Model Modify time in day 12:00:00
interface LoginProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if current date is past expiry date
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      setIsExpired(now > EXPIRY_DATE);
    };

    checkExpiry();
    // Check every minute to handle cases where user keeps the page open
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if expired
    if (isExpired) {
      setError('Your Login API license is expires Update API');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let user: UserType | null = null;

      if (isRegister) {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        user = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'customer' // Default role for registration
        });
        if (!user) {
          setError('User already exists with this email');
          setLoading(false);
          return;
        }
      } else {
        user = await login(formData.email, formData.password);
        
        if (!user) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      }

      // Show success message for login
      if (!isRegister) {
        setShowSuccess(true);
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onLogin(user);
          onClose();
        }, 2000);
      } else {
        // For registration, proceed immediately
        onLogin(user);
        onClose();
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };



  return (
    <div className="fixed h-screen w-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Enhanced Background with subtle patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-ping opacity-20" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping opacity-25" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-cyan-500 rounded-full animate-ping opacity-20" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-500">
        {/* Glowing border effect - Made Smaller */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-3xl blur-lg opacity-15 animate-pulse"></div>
        
        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Enhanced Header Section - Beautiful Design */}
          <div className="relative p-8 text-center border-b border-cyan-500/20 bg-gradient-to-b from-slate-900/50 to-slate-800/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
            </div>
            
            {/* Close button with enhanced styling */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-all duration-300 hover:bg-slate-700/50 rounded-xl group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* Enhanced Logo/Icon - Beautiful Design */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 rounded-2xl mb-6 shadow-2xl shadow-cyan-500/30 animate-bounce" style={{animationDuration: '3s'}}>
              <Shield className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-30 blur-sm animate-ping"></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 opacity-20 blur-md animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Enhanced Title and Subtitle - Beautiful Design */}
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent mb-3">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-300 text-lg mb-2 font-medium">
              {isRegister ? 'Join our community today' : 'Sign in to your account'}
            </p>
            <p className="text-slate-400 text-sm">
              {isRegister ? 'Start your journey with us' : 'Access your personalized dashboard'}
            </p>
            
            {/* Decorative line - Beautiful Animated Design */}
            <div className="flex justify-center items-center mt-4">
              <div className="relative">
                <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 via-blue-400 via-cyan-500 to-transparent rounded-full shadow-2xl shadow-cyan-400/30 animate-pulse"></div>
                <div className="absolute inset-0 w-32 h-1.5 bg-gradient-to-r from-transparent via-cyan-300 via-blue-300 via-cyan-400 to-transparent rounded-full shadow-xl shadow-cyan-300/20 animate-ping opacity-70"></div>
                <div className="absolute inset-0 w-32 h-1.5 bg-gradient-to-r from-transparent via-cyan-200 via-blue-200 via-cyan-300 to-transparent rounded-full shadow-lg shadow-cyan-200/15 animate-bounce opacity-50" style={{animationDelay: '0.3s'}}></div>
              </div>
            </div>
          </div>

          


          {/* API Expired Alert */}


{/* API Expired Alert - Small Simple */}
{isExpired && (
            <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-lg animate-in slide-in-from-top-2 duration-500">
              {/* Simple animated line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent mb-3 animate-pulse"></div>
              {/* Title */}
              <h3 className="text-lg font-semibold text-red-300 mb-2 text-center animate-in fade-in duration-500">
                ⚠️ API Expired
              </h3>
                
              {/* Simple message */}
              <p className="text-red-200 text-sm mb-2 text-center animate-in fade-in duration-500 delay-200">
                🚫 Your login API License has expired. Please update it.
              </p>
              <p className="text-orange-200 text-xs mb-3 text-center animate-in fade-in duration-500 delay-300">
                📞 Contact administrator for renewal
              </p>
                
              {/* Simple buttons */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setError('')}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors duration-200 animate-in slide-in-from-bottom-2 duration-500 delay-400"
                >
                  🔒 Close
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded-md transition-colors duration-200 animate-in slide-in-from-bottom-2 duration-500 delay-500"
                >
                  📞 Contact
                </button>
              </div>
              
              {/* Bottom animated line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent mt-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          )}




          {/* Enhanced Form Section - Beautiful Design */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegister && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    required
                    disabled={isExpired}
                    onClick={() => {
                      if (isExpired) {
                        setError('Your Login API is expires Update API');
                      }
                    }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-focus-within:from-cyan-400/10 group-focus-within:via-cyan-400/5 group-focus-within:to-cyan-400/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  required
                  disabled={isExpired}
                  onClick={() => {
                    if (isExpired) {
                      setError('Your Login API is expires Update API');
                    }
                  }}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-focus-within:from-cyan-400/10 group-focus-within:via-cyan-400/5 group-focus-within:to-cyan-400/10 transition-all duration-300 pointer-events-none"></div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  required
                  disabled={isExpired}
                  onClick={() => {
                    if (isExpired) {
                      setError('Your Login API is expires Update API');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-all duration-300 hover:bg-slate-700/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isExpired}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-focus-within:from-cyan-400/10 group-focus-within:via-cyan-400/5 group-focus-within:to-cyan-400/10 transition-all duration-300 pointer-events-none"></div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Success Message Display */}
              {showSuccess && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-300 text-sm font-medium">Sign in successful! 🎉</span>
                </div>
              )}



              {/* Enhanced Submit Button - Beautiful Design */}
              <button
                type="submit"
                disabled={loading || isExpired}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 relative overflow-hidden group text-lg"
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : isExpired ? (
                    <>
                      <span className="text-xl">🔒</span>
                      <span>Login Disabled</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-6 h-6" />
                      <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>
            </form>

              {/* Enhanced Toggle Section - Beautiful Design */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-cyan-400 hover:text-cyan-300 text-base transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-medium hover:underline"
                  disabled={isExpired}
                >
                  {isRegister 
                    ? 'Already have an account? Sign in'
                    : 'Need an account? Create one'
                  }
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Beautiful Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-400/30 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative p-6 border-b border-cyan-400/20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mb-4 shadow-lg shadow-cyan-500/25 animate-bounce">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  Developer Contact
                </h3>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Developer Info */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm font-medium">Developer</p>
                      <p className="text-cyan-400 font-semibold text-lg">Md.Pranto Islam</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm font-medium">Contact</p>
                      <p className="text-blue-400 font-semibold text-lg">01979728818</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    window.open('tel:01979728818', '_self');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 border border-cyan-400/30 hover:border-cyan-300/50 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-600/25 border border-slate-500/30 hover:border-slate-400/50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;