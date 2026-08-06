import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { loginUser, registerUser } from '../services/auth';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      const response = loginUser({ email: form.email, password: form.password });
      setMessage(response.success ? 'Logged in with the mock frontend account.' : response.error);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const response = registerUser({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
    setMessage(response.success ? 'Account created for the demo presentation.' : 'Unable to create account.');
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-8 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Account</p>
            <h1 className="mt-3 font-serif text-3xl">Welcome to Oud Kraft</h1>
            <p className="mt-4 text-[#efe4d0]">This account flow is frontend-only and ready to connect to a real authentication service later.</p>
          </div>
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
            <div className="flex gap-3">
              <button onClick={() => setMode('login')} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-[#0D3B2E] text-white' : 'bg-[#F8F4EC] text-[#0D3B2E]'}`}>Login</button>
              <button onClick={() => setMode('register')} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-[#0D3B2E] text-white' : 'bg-[#F8F4EC] text-[#0D3B2E]'}`}>Register</button>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'register' ? (
                <>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
                </>
              ) : null}
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
              {mode === 'register' ? <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" /> : null}
              <button type="submit" className="w-full rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white">{mode === 'login' ? 'Login' : 'Register'}</button>
              {message ? <p className="text-sm text-[#0D3B2E]">{message}</p> : null}
            </form>
            <div className="mt-4 text-sm text-[#5b5b5b]">
              <Link to="/forgot-password" className="text-[#0D3B2E]">Forgot password</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
