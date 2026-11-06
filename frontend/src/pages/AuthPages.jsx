
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import InteractiveSurface from "../components/InteractiveSurface";

// SHARED AUTH LAYOUT
function AuthLayout({
  children,
  heading,
  description,
  mode = "login",
}) {
  return (
    <main className="auth-page min-h-screen bg-white">
      <div className="auth-background" />

      <header className="relative z-10 mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#45B6E8] text-white shadow-md shadow-sky-100">
            <Code2 size={23} strokeWidth={2.5} />
          </div>

          <span className="text-[21px] font-extrabold tracking-tight text-slate-800">
            Code<span className="text-[#45B6E8]">Atlas</span>
            <span className="text-[#83D447]">.</span>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 no-underline transition hover:text-[#249dcc]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div className="hidden lg:block">
          <div className="auth-kicker">
            <Sparkles size={14} />
            Your coding journey starts here
          </div>

          <h1 className="mt-7 max-w-xl text-[53px] font-extrabold leading-[1.15] tracking-[-2.8px] text-slate-900">
            One home for your
            <br />
            <span className="auth-gradient">coding universe.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-8 text-slate-500">
            Connect your competitive programming profiles, understand your
            progress and grow with a community of developers.
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                icon: <BarChart3 size={19} />,
                title: "Understand your progress",
                desc: "Your coding journey, organized in one place.",
                color: "blue",
              },
              {
                icon: <Trophy size={19} />,
                title: "Compete and improve",
                desc: "Track achievements across platforms.",
                color: "green",
              },
              {
                icon: <ShieldCheck size={19} />,
                title: "Your accounts, your control",
                desc: "Manage connected profiles securely.",
                color: "pink",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    item.color === "blue"
                      ? "bg-[#E5F6FC] text-[#249dcc]"
                      : item.color === "green"
                        ? "bg-[#EFF9E7] text-[#6BAF3C]"
                        : "bg-[#FCEAF1] text-[#D76D94]"
                  }`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-[#83D447]" />
            Built for developers who never stop growing.
          </div>
        </div>

        <div className="mx-auto w-full max-w-[460px]">
          <div className="mb-7 flex items-center justify-center gap-2 lg:hidden">
            <Code2 className="text-[#45B6E8]" size={22} />
            <span className="text-sm font-bold text-slate-600">
              Your coding universe awaits
            </span>
          </div>

          <div className="auth-form-card">
            <div className="mb-7">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F6FC] text-[#249dcc]">
                {mode === "register" ? (
                  <UserRound size={23} />
                ) : mode === "forgot" ? (
                  <Mail size={23} />
                ) : mode === "reset" ? (
                  <LockKeyhole size={23} />
                ) : (
                  <Code2 size={23} />
                )}
              </div>

              <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                {heading}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            {children}
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            By continuing, you agree to use CodeAtlas responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}

// PASSWORD INPUT
function PasswordField({
  label,
  value,
  onChange,
  placeholder = "Enter your password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="auth-label">{label}</label>

      <div className="auth-input-wrap">
        <LockKeyhole size={17} className="auth-input-icon" />

        <input
          className="auth-input auth-password-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="auth-eye"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

// SUBMIT BUTTON
function AuthButton({ children }) {
  return (
    <InteractiveSurface
      as="button"
      intensity="small"
      type="submit"
      className="auth-submit"
    >
      {children}
    </InteractiveSurface>
  );
}

// FEEDBACK MESSAGE
function Message({ children, success = false }) {
  if (!children) return null;

  return (
    <div className={`auth-message ${success ? "auth-success" : "auth-error"}`}>
      {success && <CheckCircle2 size={17} />}
      <span>{children}</span>
    </div>
  );
}

// LOGIN PAGE
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError(
      "Authentication isn't connected yet. We'll enable login after backend integration."
    );
  }

  return (
    <AuthLayout
      heading="Welcome back!"
      description="Log in to continue your coding journey."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="auth-label">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={17} className="auth-input-icon" />

            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[#45B6E8]"
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-bold text-[#249dcc] no-underline hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Message>{error}</Message>

        <AuthButton>
          Log in <ArrowRight size={17} />
        </AuthButton>
      </form>

      <div className="auth-divider">
        <span>NEW TO CODEATLAS?</span>
      </div>

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-extrabold text-[#249dcc] no-underline hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

// REGISTER PAGE
export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!terms) {
      setError("Please accept the terms to continue.");
      return;
    }

    setError(
      "Registration isn't connected yet. We'll enable account creation after backend integration."
    );
  }

  return (
    <AuthLayout
      mode="register"
      heading="Create your account"
      description="One account. All your coding identities."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="auth-label">Full name</label>

          <div className="auth-input-wrap">
            <UserRound size={17} className="auth-input-icon" />

            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
              maxLength={80}
            />
          </div>
        </div>

        <div>
          <label className="auth-label">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={17} className="auth-input-icon" />

            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />

        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Enter your password again"
        />

        <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-500">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#45B6E8]"
          />
          I agree to the CodeAtlas terms and privacy policy.
        </label>

        <Message>{error}</Message>

        <AuthButton>
          Create account <ArrowRight size={17} />
        </AuthButton>
      </form>

      <div className="auth-divider">
        <span>ALREADY A MEMBER?</span>
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-extrabold text-[#249dcc] no-underline hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

// FORGOT PASSWORD PAGE
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      "Password recovery will be available once email services are connected."
    );
  }

  return (
    <AuthLayout
      mode="forgot"
      heading="Forgot password?"
      description="Enter the email address associated with your account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="auth-label">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={17} className="auth-input-icon" />

            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <Message success>{message}</Message>

        <AuthButton>
          Send recovery link <ArrowRight size={17} />
        </AuthButton>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-[#249dcc]"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}

// RESET PASSWORD PAGE
export function ResetPasswordPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setMessage(
      token
        ? "Password reset will be enabled after backend integration."
        : "This reset link is incomplete."
    );
  }

  return (
    <AuthLayout
      mode="reset"
      heading="Set a new password"
      description="Choose a strong password for your CodeAtlas account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Message>{message}</Message>

        <AuthButton>
          Reset password <ArrowRight size={17} />
        </AuthButton>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-[#249dcc]"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
