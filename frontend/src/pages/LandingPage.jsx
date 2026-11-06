
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Code2,
  GitCompareArrows,
  Menu,
  ShieldCheck,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

import InteractiveSurface from "../components/InteractiveSurface";

const features = [
  {
    icon: <Activity />,
    title: "Unified Developer Profile",
    description:
      "Bring all your competitive programming identities together into one clean, powerful developer profile.",
    color: "blue",
    tag: "One identity",
  },
  {
    icon: <BarChart3 />,
    title: "Deep Performance Analytics",
    description:
      "Understand your growth through rating history, problem-solving trends, accuracy and activity insights.",
    color: "green",
    tag: "Track progress",
  },
  {
    icon: <GitCompareArrows />,
    title: "Compare With Friends",
    description:
      "Compare coding journeys, platform ratings and problem-solving statistics with other developers.",
    color: "pink",
    tag: "Friendly competition",
  },
  {
    icon: <Trophy />,
    title: "Contest Intelligence",
    description:
      "Discover upcoming contests and keep track of your competitive programming journey.",
    color: "peach",
    tag: "Never miss a contest",
  },
  {
    icon: <Bell />,
    title: "Smart Notifications",
    description:
      "Stay informed about important account updates, contests and changes in your coding progress.",
    color: "blue",
    tag: "Stay updated",
  },
  {
    icon: <Users />,
    title: "Developer Community",
    description:
      "Explore developer profiles, share experiences and discover people with similar coding interests.",
    color: "green",
    tag: "Grow together",
  },
];

const platforms = [
  { name: "Codeforces", short: "CF", color: "#E6F2FF", text: "#2878C8" },
  { name: "LeetCode", short: "LC", color: "#FFF2DC", text: "#C47A17" },
  { name: "CodeChef", short: "CC", color: "#FCEAF1", text: "#C75A83" },
  { name: "AtCoder", short: "AC", color: "#EAF0FF", text: "#5269B8" },
  { name: "GeeksforGeeks", short: "GFG", color: "#EFF9E7", text: "#579C36" },
];

const stats = [
  { value: "04", label: "Platforms", icon: <Code2 />, color: "blue" },
  { value: "01", label: "Unified profile", icon: <Users />, color: "green" },
  { value: "360°", label: "Progress view", icon: <Activity />, color: "pink" },
];

function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMenu = () => setMobileMenu(false);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .codeatlas-page {
          font-family: 'DM Sans', sans-serif;
        }

        .codeatlas-page h1,
        .codeatlas-page h2,
        .codeatlas-page h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .gradient-text {
          background: linear-gradient(100deg, #45B6E8 10%, #83D447 95%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(1px);
          pointer-events: none;
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(69,182,232,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,182,232,.045) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .soft-card {
          border: 1px solid #edf0f3;
          border-radius: 22px;
          background: white;
        }

        .feature-card {
          min-height: 255px;
          padding: 25px;
          border: 1px solid #edf0f3;
          border-radius: 22px;
          background: white;
          cursor: default;
        }

        .platform-card {
          min-height: 125px;
          padding: 20px;
          border: 1px solid #edf0f3;
          border-radius: 18px;
          background: white;
          cursor: default;
        }

        .stat-card {
          padding: 17px;
          border: 1px solid #edf0f3;
          border-radius: 17px;
          background: white;
          cursor: default;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          padding: 8px 11px;
          border-radius: 10px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .nav-link:hover {
          color: #249dcc;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 12px;
          padding: 13px 20px;
          background: #45B6E8;
          color: white;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 7px 18px rgba(69,182,232,.2);
          cursor: pointer;
        }

        .primary-button:hover {
          background: #2da6dc;
        }

        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 13px 20px;
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }

        .secondary-button:hover {
          border-color: #45B6E8;
          color: #249dcc;
        }

        .dashboard-window {
          border: 1px solid #e9eef2;
          border-radius: 20px;
          background: white;
          box-shadow: 0 28px 80px rgba(35, 73, 94, .12);
        }

        .dashboard-bar {
          height: 7px;
          border-radius: 99px;
          background: #edf2f5;
          overflow: hidden;
        }

        .dashboard-bar > span {
          display: block;
          height: 100%;
          border-radius: inherit;
        }

        .feature-arrow {
          transition: transform 250ms ease;
        }

        .feature-card.fire .feature-arrow {
          transform: translateX(7px);
        }

        .section-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e5f3f9;
          border-radius: 999px;
          padding: 7px 12px;
          background: #f5fbfe;
          color: #249dcc;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 43px !important;
            letter-spacing: -2.2px !important;
          }
        }
      `}</style>

      <div className="codeatlas-page">
        {/* NAVBAR */}
        <header className="relative z-30 border-b border-slate-100 bg-white">
          <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <a href="#" className="flex items-center gap-2.5 no-underline">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#45B6E8] text-white shadow-md shadow-sky-100">
                <Code2 size={23} strokeWidth={2.5} />
              </div>
              <span className="text-[21px] font-extrabold tracking-tight text-slate-800">
                Code<span className="text-[#45B6E8]">Atlas</span>
                <span className="ml-1 text-[#83D447]">.</span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 md:flex">
              <InteractiveSurface as="a" intensity="small" href="#features" className="nav-link">
                Features
              </InteractiveSurface>
              <InteractiveSurface as="a" intensity="small" href="#platforms" className="nav-link">
                Platforms
              </InteractiveSurface>
              <InteractiveSurface as="a" intensity="small" href="#how-it-works" className="nav-link">
                How it works
              </InteractiveSurface>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <a href="/login" className="text-sm font-bold text-slate-600 no-underline hover:text-[#45B6E8]">
                Log in
              </a>
              <InteractiveSurface as="a" intensity="small" href="/register" className="primary-button">
                Get started <ArrowRight size={16} />
              </InteractiveSurface>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
            >
              {mobileMenu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {mobileMenu && (
            <div className="absolute left-0 right-0 top-full border-b border-slate-100 bg-white px-5 py-5 shadow-lg md:hidden">
              <div className="flex flex-col gap-3">
                <a onClick={closeMenu} href="#features" className="py-2 text-sm font-semibold text-slate-600">Features</a>
                <a onClick={closeMenu} href="#platforms" className="py-2 text-sm font-semibold text-slate-600">Platforms</a>
                <a onClick={closeMenu} href="#how-it-works" className="py-2 text-sm font-semibold text-slate-600">How it works</a>
                <a onClick={closeMenu} href="/login" className="py-2 text-sm font-semibold text-slate-600">Log in</a>
                <a onClick={closeMenu} href="/register" className="primary-button mt-1">Get started <ArrowRight size={16} /></a>
              </div>
            </div>
          )}
        </header>

        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-white">
          <div className="hero-grid absolute inset-0 -z-10" />
          <div className="hero-orb -right-32 top-12 -z-10 h-96 w-96 bg-[#E5F6FC] opacity-80" />
          <div className="hero-orb -left-32 bottom-0 -z-10 h-72 w-72 bg-[#EFF9E7] opacity-70" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-12 lg:pb-28 lg:pt-28">
            <div className="relative z-10">
              <div className="section-kicker mb-7">
                <Zap size={14} fill="currentColor" />
                Your coding journey, connected
              </div>

              <h1 className="hero-title max-w-[650px] text-[58px] font-extrabold leading-[1.12] tracking-[-3.4px] text-slate-900">
                One identity.
                <br />
                Every platform.
                <br />
                <span className="gradient-text">Infinite growth.</span>
              </h1>

              <p className="mt-7 max-w-[520px] text-[16px] leading-8 text-slate-500">
                Your competitive programming journey deserves one home.
                Connect your coding profiles, understand your progress and
                grow alongside the developer community.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <InteractiveSurface as="a" intensity="small" href="/register" className="primary-button">
                  Create your profile <ArrowRight size={17} />
                </InteractiveSurface>
                <InteractiveSurface as="a" intensity="small" href="#features" className="secondary-button">
                  Explore features <ChevronRight size={17} />
                </InteractiveSurface>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#83D447]" />
                  Multiple coding profiles
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#83D447]" />
                  One unified dashboard
                </span>
              </div>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="relative mx-auto w-full max-w-[570px]">
              <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full bg-[#FCEAF1] blur-2xl" />
              <div className="absolute -bottom-7 -left-8 h-32 w-32 rounded-full bg-[#E5F6FC] blur-2xl" />

              <div className="dashboard-window relative z-10 overflow-hidden p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F6FC] text-[#249dcc]">
                      <Code2 size={21} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Your coding overview</p>
                      <p className="text-[11px] text-slate-400">A unified view of your journey</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#EFF9E7] px-3 py-1 text-[10px] font-bold text-[#579C36]">
                    Preview
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {stats.map((stat) => (
                    <InteractiveSurface key={stat.label} intensity="medium" className="stat-card">
                      <div className={`mb-3 inline-flex rounded-lg p-2 ${
                        stat.color === "blue" ? "bg-[#E5F6FC] text-[#249dcc]" :
                        stat.color === "green" ? "bg-[#EFF9E7] text-[#6BAF3C]" :
                        "bg-[#FCEAF1] text-[#D76D94]"
                      }`}>
                        {stat.icon}
                      </div>
                      <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{stat.label}</p>
                    </InteractiveSurface>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Platform activity</p>
                      <p className="mt-1 text-[10px] text-slate-400">Illustrative data</p>
                    </div>
                    <BarChart3 size={18} className="text-[#45B6E8]" />
                  </div>

                  {[
                    { name: "Codeforces", value: "78%", width: "78%", color: "#45B6E8" },
                    { name: "LeetCode", value: "65%", width: "65%", color: "#83D447" },
                    { name: "CodeChef", value: "52%", width: "52%", color: "#F48FB1" },
                  ].map((item) => (
                    <div key={item.name} className="mb-4 last:mb-0">
                      <div className="mb-2 flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="text-slate-400">{item.value}</span>
                      </div>
                      <div className="dashboard-bar">
                        <span style={{ width: item.width, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5FBFE] p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-white p-2 text-[#45B6E8]">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Your journey, in one place</p>
                      <p className="text-[10px] text-slate-400">Connect. Track. Improve.</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#45B6E8]" />
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 z-20 hidden items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex">
                <div className="rounded-lg bg-[#EFF9E7] p-2 text-[#6BAF3C]">
                  <CheckCircle2 size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-700">All in one place</p>
                  <p className="text-[10px] text-slate-400">Your coding identity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORMS STRIP */}
        <section id="platforms" className="border-y border-slate-100 bg-[#FCFDFE] py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-slate-400">
                Your favourite coding platforms
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800">
                All your platforms. <span className="text-[#45B6E8]">One destination.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {platforms.map((platform) => (
                <InteractiveSurface key={platform.name} intensity="medium" className="platform-card flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                    style={{ background: platform.color, color: platform.text }}
                  >
                    {platform.short}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{platform.name}</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">Platform integration</p>
                  </div>
                </InteractiveSurface>
              ))}
            </div>
            <p className="mt-5 text-center text-[11px] text-slate-400">
              Platform availability will depend on supported integrations and their access policies.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="section-kicker">Everything connected</span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-1.8px] text-slate-900">
                More than just <span className="gradient-text">statistics.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-slate-500">
                The tools you need to understand your progress, compete smarter
                and become a better developer.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <InteractiveSurface key={feature.title} intensity="large" className="feature-card group">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      feature.color === "blue" ? "bg-[#E5F6FC] text-[#249dcc]" :
                      feature.color === "green" ? "bg-[#EFF9E7] text-[#6BAF3C]" :
                      feature.color === "pink" ? "bg-[#FCEAF1] text-[#D76D94]" :
                      "bg-[#FFF2DC] text-[#D99A3B]"
                    }`}>
                      {feature.icon}
                    </div>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-400">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="mt-7 text-[18px] font-extrabold tracking-tight text-slate-800">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#45B6E8]">
                    <span>Explore possibility</span>
                    <ArrowRight className="feature-arrow" size={17} />
                  </div>
                </InteractiveSurface>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="bg-[#F8FCFE] py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto mb-14 max-w-xl text-center">
              <span className="section-kicker">Simple by design</span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-1.8px] text-slate-900">
                Your journey starts <span className="gradient-text">here.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                No complicated setup. Just connect your accounts and start exploring your progress.
              </p>
            </div>

            <div className="grid gap-7 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Create your identity",
                  description: "Set up your CodeAtlas profile and choose how you want to represent your coding journey.",
                  icon: <Users />,
                  color: "blue",
                },
                {
                  number: "02",
                  title: "Connect your platforms",
                  description: "Add your public competitive programming usernames and verify your accounts.",
                  icon: <Code2 />,
                  color: "green",
                },
                {
                  number: "03",
                  title: "Explore your progress",
                  description: "View your unified statistics, compare performance and discover new goals.",
                  icon: <BarChart3 />,
                  color: "pink",
                },
              ].map((step) => (
                <InteractiveSurface key={step.number} intensity="medium" className="soft-card p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-200">{step.number}</span>
                    <div className={`rounded-xl p-3 ${
                      step.color === "blue" ? "bg-[#E5F6FC] text-[#249dcc]" :
                      step.color === "green" ? "bg-[#EFF9E7] text-[#6BAF3C]" :
                      "bg-[#FCEAF1] text-[#D76D94]"
                    }`}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="mt-7 text-lg font-extrabold text-slate-800">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{step.description}</p>
                </InteractiveSurface>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white px-5 py-24 sm:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[30px] bg-[#EAF7FC] px-6 py-16 text-center sm:px-12">
            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#D5F1FC] blur-2xl" />
            <div className="absolute -bottom-24 -right-12 h-64 w-64 rounded-full bg-[#E4F4D7] blur-2xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#45B6E8] shadow-sm">
                <Zap size={25} />
              </div>
              <h2 className="mt-7 text-3xl font-extrabold tracking-[-1.5px] text-slate-900 sm:text-4xl">
                Ready to map your <span className="gradient-text">coding journey?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
                Bring your coding profiles together and make every practice session count.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <InteractiveSurface as="a" intensity="small" href="/register" className="primary-button">
                  Get started for free <ArrowRight size={17} />
                </InteractiveSurface>
                <InteractiveSurface as="a" intensity="small" href="#platforms" className="secondary-button">
                  Explore platforms
                </InteractiveSurface>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
            <a href="#" className="flex items-center gap-2 no-underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#45B6E8] text-white">
                <Code2 size={18} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-800">
                Code<span className="text-[#45B6E8]">Atlas</span>
              </span>
            </a>

            <p className="text-xs text-slate-400">
              Built for developers who never stop growing.
            </p>

            <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
              <a href="#features" className="no-underline hover:text-[#45B6E8]">Features</a>
              <a href="#platforms" className="no-underline hover:text-[#45B6E8]">Platforms</a>
              <a href="/login" className="no-underline hover:text-[#45B6E8]">Login</a>
            </div>
          </div>
          <div className="border-t border-slate-100 py-4 text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} CodeAtlas. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}

export default LandingPage;
