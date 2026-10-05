import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get } from '../api';
import { CheckIcon } from '../components/Icons';
import { Button, Field, LogoMark, TextArea } from '../components/ui';
import { errMsg } from '../lib';
import { useApp, useMe } from '../state';

export function Splash() {
  return (
    <div className="splash">
      <div className="splash-tile">
        <LogoMark size={64} />
      </div>
      <div className="splash-name">Bondi</div>
      <div className="splash-tag">study · connect · grow</div>
    </div>
  );
}

function SocialButtons() {
  const { toast } = useApp();
  const soon = (p: string) => toast(`${p} orqali kirish hali sozlanmagan — email bilan kiring`, 'info');
  return (
    <>
      <div className="divider-text">
        <span>yoki</span>
      </div>
      <div className="social-row">
        <button type="button" className="social-btn" onClick={() => soon('Google')}>
          Google
        </button>
        <button type="button" className="social-btn" onClick={() => soon('Apple')}>
          Apple
        </button>
      </div>
    </>
  );
}

export function Login() {
  const { login, toast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(email, password);
      navigate(u.onboarded ? '/home' : '/onboarding', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-hero">
        <div className="auth-hero-tile">
          <LogoMark size={40} />
        </div>
        <h1>Xush kelibsiz</h1>
        <p className="muted">Hisobingizga kiring</p>
      </div>
      <Field label="Email" type="text" autoComplete="username" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Parol" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button
        type="button"
        className="link-btn forgot"
        onClick={() => toast("Parolni tiklash tez orada qo'shiladi. Hozircha demo hisobdan foydalaning.", 'info')}
      >
        Parolni unutdingizmi?
      </button>
      {error && <div className="form-error">{error}</div>}
      <Button type="submit" block size="lg" loading={busy}>
        Kirish
      </Button>
      <SocialButtons />
      <p className="auth-switch">
        Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
      </p>
      <button
        type="button"
        className="demo-hint"
        onClick={() => {
          setEmail('aziz@bondi.uz');
          setPassword('bondi1234');
        }}
      >
        Demo hisob: aziz@bondi.uz / bondi1234
      </button>
    </form>
  );
}

export function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', username: '' });
  const [avail, setAvail] = useState<{ available: boolean; reason: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const u = form.username.replace(/^@/, '').trim();
    if (!u) return setAvail(null);
    const t = setTimeout(() => {
      get<{ available: boolean; reason: string | null }>(`/auth/username-available?u=${encodeURIComponent(u)}`)
        .then(setAvail)
        .catch(() => setAvail(null));
    }, 300);
    return () => clearTimeout(t);
  }, [form.username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) return setError("Parol kamida 8 belgidan iborat bo'lsin");
    setBusy(true);
    setError(null);
    try {
      await register(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-hero">
        <h1>Yangi hisob yarating</h1>
        <p className="muted">O'rganish sherigingizni toping</p>
      </div>
      <Field label="To'liq ism" placeholder="Ismingiz" autoComplete="name" value={form.name} onChange={set('name')} required />
      <Field label="Email" type="email" placeholder="email@example.com" autoComplete="email" value={form.email} onChange={set('email')} required />
      <Field label="Parol" type="password" placeholder="Kamida 8 belgi" autoComplete="new-password" value={form.password} onChange={set('password')} required minLength={8} />
      <Field
        label="Foydalanuvchi nomi"
        placeholder="@username"
        value={form.username}
        onChange={set('username')}
        required
        error={avail && !avail.available ? avail.reason : null}
        right={avail?.available ? <CheckIcon size={18} /> : null}
      />
      {error && <div className="form-error">{error}</div>}
      <Button type="submit" block size="lg" loading={busy} disabled={avail?.available === false}>
        Ro'yxatdan o'tish
      </Button>
      <p className="auth-switch">
        Hisobingiz bormi? <Link to="/login">Kirish</Link>
      </p>
    </form>
  );
}

export function Onboarding() {
  const me = useMe();
  const { updateMe, toast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [bio, setBio] = useState(me.bio);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>(me.interests);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    get<{ options: string[] }>('/users/interests')
      .then((r) => setOptions(r.options))
      .catch(() => setOptions(['IELTS', 'English', 'SAT', 'Programming', 'Speaking', 'Writing']));
  }, []);

  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  async function finish() {
    setBusy(true);
    try {
      await updateMe({ bio, interests: picked, onboarded: true });
      toast('Profilingiz tayyor!');
      navigate('/home', { replace: true });
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card onboarding">
      <div className="steps">
        <span className={step >= 0 ? 'on' : ''} />
        <span className={step >= 1 ? 'on' : ''} />
      </div>
      {step === 0 ? (
        <>
          <div className="auth-hero left">
            <h1>O'zingiz haqida yozing</h1>
            <p className="muted">Boshqa studentlar siz haqingizni bilib olishlari uchun</p>
          </div>
          <TextArea
            label="Bio"
            rows={5}
            maxLength={600}
            placeholder="IELTS 7.0 ga tayyorlanayapman. Asosan speaking va writing bo'yicha sherik izlayapman..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Button block size="lg" onClick={() => setStep(1)}>
            Keyingisi
          </Button>
        </>
      ) : (
        <>
          <div className="auth-hero left">
            <h1>Qiziqishlaringiz</h1>
            <p className="muted">Sizga mos sheriklarni topish uchun 3 tasini tanlang</p>
          </div>
          <div className="interest-grid">
            {options.map((t) => (
              <button key={t} type="button" className={`interest ${picked.includes(t) ? 'active' : ''}`} onClick={() => toggle(t)} aria-pressed={picked.includes(t)}>
                {t}
              </button>
            ))}
          </div>
          <Button block size="lg" loading={busy} disabled={picked.length < 3} onClick={finish}>
            {picked.length < 3 ? `Yana ${3 - picked.length} ta tanlang` : 'Tayyor'}
          </Button>
          <button type="button" className="link-btn" onClick={() => setStep(0)}>
            Orqaga
          </button>
        </>
      )}
    </div>
  );
}

