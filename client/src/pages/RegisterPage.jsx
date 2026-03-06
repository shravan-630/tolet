import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', userType: 'Tenant' });

  async function handleSubmit(event) {
    event.preventDefault();
    await register(form);
    navigate('/login');
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 md:grid-cols-2">
        <h1 className="col-span-full text-2xl font-bold">Create account</h1>
        <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input md:col-span-2" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input md:col-span-2" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input md:col-span-2" value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value })}>
          <option>Tenant</option>
          <option>Owner</option>
        </select>
        <button type="submit" className="btn-primary md:col-span-2">Register</button>
      </form>
    </main>
  );
}
