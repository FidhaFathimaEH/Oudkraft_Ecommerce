import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import oudKraftLogo from '../../assets/logo/oud-kraft-logo.png';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, isAuthenticated, loading, error, clearError } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/admin/dashboard';

  // If already authenticated as an admin, redirect immediately
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Email address is required.');
      return;
    }
    if (!password) {
      setFormError('Password is required.');
      return;
    }

    setSubmitting(true);

    const result = await login(trimmedEmail, password);

    setSubmitting(false);

    if (result.success) {
      navigate(destination, { replace: true });
    } else {
      setFormError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const activeError = formError || error;

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8"
      style={{
        background: 'radial-gradient(circle at 10% 10%, #154539 0%, #082820 50%, #051a14 100%)',
      }}
    >
      {/* Background Decorative Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#C6A15B]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#C6A15B]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Back to store navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#efe4d0]/75 hover:text-[#C6A15B] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Storefront
          </Link>
          <span className="rounded-full border border-[#C6A15B]/30 bg-[#0D3B2E]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">
            Admin Portal
          </span>
        </div>

        {/* Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-[28px] border border-[#C6A15B]/30 bg-[#0D3B2E]/90 p-8 text-white shadow-2xl backdrop-blur-xl sm:p-10"
        >
          {/* Brand Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#C6A15B]/40 bg-[#082820] p-1.5 shadow-inner">
              <img
                src={oudKraftLogo}
                alt="Oud Kraft"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#C6A15B]">
              Management Suite
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-wide text-white">
              Administrator Login
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#efe4d0]/80">
              Sign in with your administrative account to access analytics, inventory, and order operations.
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {activeError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div className="flex-1 leading-relaxed">
                  {activeError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium uppercase tracking-[0.15em] text-[#efe4d0]"
              >
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6A15B]" />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (activeError) {
                      setFormError('');
                      clearError();
                    }
                  }}
                  placeholder="admin@oudkraft.com"
                  className="w-full rounded-full border border-[#C6A15B]/30 bg-[#082820]/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium uppercase tracking-[0.15em] text-[#efe4d0]"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6A15B]" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeError) {
                      setFormError('');
                      clearError();
                    }
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-full border border-[#C6A15B]/30 bg-[#082820]/80 py-3.5 pl-11 pr-11 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#efe4d0]/60 hover:text-[#C6A15B] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#C6A15B] bg-[#C6A15B] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0D3B2E] transition-all hover:bg-[#d4b06a] hover:shadow-lg hover:shadow-[#C6A15B]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0D3B2E]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Enter Admin Console</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 border-t border-[#C6A15B]/20 pt-4 text-center">
            <p className="text-[11px] text-[#efe4d0]/60">
              Restricted area. All administrative sessions and access requests are logged.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
