import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { loginUser, registerUser, logoutUser, getStoredUser, getCurrentUser } from '../services/auth';

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync mode if route changes (/login vs /register)
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Check current session from backend on mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    setCurrentUser(null);
    setLoading(false);
    setSuccess('You have been logged out.');
    navigate('/login');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await loginUser({
          email: form.email,
          password: form.password,
        });

        if (!response.success) {
          setError(response.error || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        setCurrentUser(response.user);
        setSuccess('Logged in successfully.');
        setLoading(false);
        setTimeout(() => {
          navigate('/account');
        }, 800);
        return;
      }

      // Registration validation
      if (!form.fullName.trim()) {
        setError('Full name is required.');
        setLoading(false);
        return;
      }

      if (!form.phone.trim()) {
        setError('A valid contact phone number is required (e.g. +971501234567).');
        setLoading(false);
        return;
      }

      if (form.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const response = await registerUser({
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (!response.success) {
        setError(response.error || 'Unable to create account. Please check your details.');
        setLoading(false);
        return;
      }

      setCurrentUser(response.user);
      setSuccess('Account created successfully! Welcome to Oud Kraft.');
      setLoading(false);
      setTimeout(() => {
        navigate('/account');
      }, 1000);
    } catch (err) {
      console.error('Auth submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left Welcome Card */}
          <div className="flex flex-col justify-between rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-8 text-white shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#C6A15B]">Exclusive Clientele</p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
                {currentUser ? `Welcome back, ${currentUser.name?.split(' ')[0] || 'Client'}` : 'Welcome to Oud Kraft'}
              </h1>
              <p className="mt-4 text-xs sm:text-sm text-[#efe4d0] leading-relaxed">
                {currentUser
                  ? 'Access your personal fragrance library, track active orders across the UAE, and manage your delivery details.'
                  : 'Join our distinguished circle of perfume connoisseurs. Register an account to explore bespoke artisanal blends and seamless home delivery.'}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-[#C6A15B]/30 bg-[#0D3B2E]/60 p-4 text-xs text-[#efe4d0]">
              <p className="font-semibold text-[#C6A15B]">Handcrafted in the UAE</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#efe4d0]/80">
                Pure grade-A Dehn Al Oud, French florals, and rich amber essences delivered directly to your doorstep.
              </p>
            </div>
          </div>

          {/* Right Card: Account Profile or Login/Register Form */}
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 sm:p-8 shadow-sm">
            {currentUser ? (
              /* Logged In Profile View */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#e3d9c4] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                      Client Profile
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#171311]">
                      {currentUser.name}
                    </h2>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Active Client
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-[#171311]">
                    <Mail className="h-4 w-4 text-[#C6A15B]" />
                    <span className="font-medium">{currentUser.email}</span>
                  </div>
                  {currentUser.phone && (
                    <div className="flex items-center gap-2 text-[#171311]">
                      <Phone className="h-4 w-4 text-[#C6A15B]" />
                      <span className="font-medium">{currentUser.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#e3d9c4]">
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#123F34] transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-5 py-2.5 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
                  >
                    <span>Browse Catalog</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Auth Form (Login or Register) */
              <>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                      mode === 'login'
                        ? 'bg-[#0D3B2E] text-white shadow-sm'
                        : 'bg-[#F8F4EC] text-[#0D3B2E] hover:bg-[#efe4d0]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                      mode === 'register'
                        ? 'bg-[#0D3B2E] text-white shadow-sm'
                        : 'bg-[#F8F4EC] text-[#0D3B2E] hover:bg-[#efe4d0]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Banner */}
                {success && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-4">
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5b5b5b] mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b5b5b]" />
                          <input
                            type="text"
                            required
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder="e.g. Fatima Al Mansoori"
                            className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] py-3 pl-10 pr-4 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 outline-none focus:border-[#0D3B2E] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5b5b5b] mb-1">
                          Phone Number (With Country Code)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b5b5b]" />
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="e.g. +971501234567"
                            className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] py-3 pl-10 pr-4 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 outline-none focus:border-[#0D3B2E] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5b5b5b] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b5b5b]" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="client@example.ae"
                        className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] py-3 pl-10 pr-4 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 outline-none focus:border-[#0D3B2E] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5b5b5b] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b5b5b]" />
                      <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min 8 characters (1 uppercase, 1 lowercase, 1 number)"
                        className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] py-3 pl-10 pr-4 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 outline-none focus:border-[#0D3B2E] focus:bg-white transition-colors"
                      />
                    </div>
                    {mode === 'register' && (
                      <p className="mt-1 text-[10px] text-[#5b5b5b]">
                        Must contain at least 8 characters, an uppercase letter, a lowercase letter, and a number.
                      </p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5b5b5b] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b5b5b]" />
                        <input
                          type="password"
                          required
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="Re-enter your password"
                          className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] py-3 pl-10 pr-4 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 outline-none focus:border-[#0D3B2E] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#0D3B2E] py-3 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-[#123F34] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-[#C6A15B]" />}
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </button>
                </form>

                {mode === 'login' && (
                  <div className="mt-4 text-center text-xs text-[#5b5b5b]">
                    Don&apos;t have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('register')}
                      className="font-semibold text-[#0D3B2E] hover:underline"
                    >
                      Register here
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};
