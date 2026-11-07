import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Clock3, ExternalLink, Search, Bookmark,
  Trophy, Radio, RefreshCw, ArrowLeft, CalendarCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const platforms = [
  { id: "all", label: "All platforms" },
  { id: "codeforces", label: "Codeforces" },
  { id: "leetcode", label: "LeetCode" },
  { id: "codechef", label: "CodeChef" },
  { id: "atcoder", label: "AtCoder" },
  { id: "geeksforgeeks", label: "GeeksforGeeks" },
];

function makeDemoContests() {
  const now = Date.now();

  return [
    {
      contestId: "demo-cf-1", platform: "codeforces",
      name: "Codeforces Round (Div. 2)",
      startTime: new Date(now + 2 * 60 * 60 * 1000),
      durationSeconds: 7200,
      status: "upcoming",
      url: "https://codeforces.com/contests"
    },
    {
      contestId: "demo-lc-1", platform: "leetcode",
      name: "Weekly Contest",
      startTime: new Date(now + 24 * 60 * 60 * 1000),
      durationSeconds: 5400,
      status: "upcoming",
      url: "https://leetcode.com/contest/"
    },
    {
      contestId: "demo-cc-1", platform: "codechef",
      name: "Starters",
      startTime: new Date(now - 30 * 60 * 1000),
      durationSeconds: 7200,
      status: "ongoing",
      url: "https://www.codechef.com/contests"
    },
    {
      contestId: "demo-at-1", platform: "atcoder",
      name: "AtCoder Beginner Contest",
      startTime: new Date(now + 3 * 24 * 60 * 60 * 1000),
      durationSeconds: 6000,
      status: "upcoming",
      url: "https://atcoder.jp/contests/"
    },
    {
      contestId: "demo-gfg-1", platform: "geeksforgeeks",
      name: "Weekly Coding Contest",
      startTime: new Date(now - 4 * 24 * 60 * 60 * 1000),
      durationSeconds: 7200,
      status: "finished",
      url: "https://practice.geeksforgeeks.org/contest/"
    }
  ];
}

function getStatus(contest) {
  const start = new Date(contest.startTime).getTime();
  const end = start + (Number(contest.durationSeconds) || 0) * 1000;
  const now = Date.now();

  if (now < start) return "upcoming";
  if (now < end) return "ongoing";
  return "finished";
}

function formatCountdown(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatDate(date) {
  return new Date(date).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const platformColors = {
  codeforces: "bg-blue-50 text-blue-700",
  leetcode: "bg-amber-50 text-amber-700",
  codechef: "bg-orange-50 text-orange-700",
  atcoder: "bg-slate-100 text-slate-700",
  geeksforgeeks: "bg-green-50 text-green-700"
};

function ContestCard({ contest, saved, onToggleSave, now }) {
  const status = getStatus(contest);
  const start = new Date(contest.startTime);
  const end = new Date(
    start.getTime() + (Number(contest.durationSeconds) || 0) * 1000
  );

  const countdownTarget = status === "ongoing" ? end : start;
  const countdownLabel = status === "ongoing" ? "Ends in" : "Starts in";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${platformColors[contest.platform] || "bg-slate-100 text-slate-700"}`}>
          {contest.platform}
        </span>

        <button
          type="button"
          onClick={() => onToggleSave(contest)}
          title={saved ? "Remove bookmark" : "Bookmark contest"}
          className={`rounded-xl p-2 transition ${saved ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600"}`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="mb-3 text-lg font-bold text-slate-800">
        {contest.name}
      </h3>

      <div className="mb-4 space-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          {formatDate(contest.startTime)}
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          {Math.round((contest.durationSeconds || 0) / 60)} minutes
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-slate-50 p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {status === "finished" ? "Contest ended" : countdownLabel}
        </p>
        <p className="font-mono text-lg font-bold text-slate-800">
          {status === "finished"
            ? "Completed"
            : formatCountdown(countdownTarget)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
          status === "ongoing"
            ? "bg-green-100 text-green-700"
            : status === "upcoming"
              ? "bg-sky-100 text-sky-700"
              : "bg-slate-100 text-slate-500"
        }`}>
          {status === "ongoing" ? "Live now" : status}
        </span>

        {contest.url && (
          <a
            href={contest.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 hover:text-sky-700"
          >
            Visit contest <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function ContestPage() {
  const { demoMode } = useAuth();

  const [contests, setContests] = useState([]);
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codeatlas_saved_contests") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedStatus, setFeedStatus] = useState({});
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadContests() {
    setLoading(true);
    setError("");

    const selectedPlatforms = platform === "all"
      ? ["codeforces", "leetcode", "codechef", "atcoder", "geeksforgeeks"]
      : [platform];

    const CACHE_KEY = "codeatlas_contest_cache_v1";
    let cache = {};

    try {
      cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch {
      cache = {};
    }

    if (demoMode) {
      setContests(makeDemoContests());
      setFeedStatus(
        Object.fromEntries(selectedPlatforms.map(p => [p, "demo"]))
      );
      setLoading(false);
      return;
    }

    const results = await Promise.allSettled(
      selectedPlatforms.map(async item => {
        const response = await api.get("/contests/live", {
          params: { platform: item, limit: 100 },
          timeout: 18000
        });

        return {
          platform: item,
          contests: response.data.contests || []
        };
      })
    );

    const combined = [];
    const nextStatus = {};

    results.forEach((result, index) => {
      const item = selectedPlatforms[index];

      if (result.status === "fulfilled") {
        const contests = result.value.contests;

        cache[item] = {
          contests,
          savedAt: new Date().toISOString()
        };

        combined.push(...contests);
        nextStatus[item] = "live";
      } else if (cache[item]?.contests) {
        combined.push(...cache[item].contests);
        nextStatus[item] = "cached";
      } else {
        nextStatus[item] = "unavailable";
      }
    });

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Contest cache could not be saved:", error);
    }

    setContests(combined);
    setFeedStatus(nextStatus);

    const failed = Object.values(nextStatus).filter(
      value => value === "unavailable"
    ).length;

    if (failed === selectedPlatforms.length) {
      setError("All contest feeds are currently unavailable. No cached data was found.");
    } else if (failed > 0) {
      setError(`${failed} platform feed(s) unavailable. Available cached or live data is still displayed.`);
    }

    setLoading(false);
  }
  useEffect(() => {
    loadContests();
  }, [platform, demoMode]);

  function toggleSave(contest) {
    const key = `${contest.platform}:${contest.contestId}`;
    const exists = saved.some(item => item.key === key);

    const next = exists
      ? saved.filter(item => item.key !== key)
      : [...saved, {
          key,
          platform: contest.platform,
          contestId: contest.contestId,
          name: contest.name,
          url: contest.url
        }];

    setSaved(next);
    localStorage.setItem("codeatlas_saved_contests", JSON.stringify(next));
  }

  const filtered = useMemo(() => {
    return contests.filter(contest => {
      const currentStatus = getStatus(contest);
      const matchesStatus = status === "all" ||
        (status === "live" ? currentStatus === "ongoing" : currentStatus === status);

      const matchesPlatform = platform === "all" ||
        String(contest.platform || "").toLowerCase() === platform.toLowerCase();

      const matchesSearch = contest.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const isSaved = saved.some(
        item => item.key === `${contest.platform}:${contest.contestId}`
      );

      return matchesPlatform &&
        matchesStatus &&
        matchesSearch &&
        (status !== "saved" || isSaved);
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [contests, platform, status, search, saved, clock]);

  const liveCount = contests.filter(c => getStatus(c) === "ongoing").length;
  const upcomingCount = contests.filter(c => getStatus(c) === "upcoming").length;

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-slate-800 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <Trophy size={20} />
            </span>
            CodeAtlas
          </Link>

          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-600">
              Compete. Improve. Repeat.
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Contest Center
            </h1>
            <p className="mt-2 text-slate-500">
              Discover contests, track countdowns and plan your next challenge.
            </p>
          </div>

          <button
            onClick={loadContests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh contests
          </button>
        </div>

        {demoMode && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo mode: these are sample contests, not live schedules.
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-700">
            Platform feed status
          </h2>

          <div className="flex flex-wrap gap-3">
            {platforms.filter(p => p.id !== "all").map(item => {
              const state = feedStatus[item.id] || "waiting";

              const styles = {
                live: "bg-green-100 text-green-700",
                cached: "bg-amber-100 text-amber-700",
                unavailable: "bg-red-100 text-red-700",
                demo: "bg-sky-100 text-sky-700",
                waiting: "bg-slate-100 text-slate-500"
              };

              return (
                <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="mb-1 text-xs font-semibold text-slate-600">
                    {item.label}
                  </p>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${styles[state]}`}>
                    {state}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Cached data comes from your last successful refresh and may be outdated.
          </p>
        </div>
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <CalendarCheck size={18} className="text-sky-500" /> Total contests
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{contests.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Radio size={18} className="text-green-500" /> Live now
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{liveCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Clock3 size={18} className="text-amber-500" /> Upcoming
            </div>
            <p className="text-3xl font-extrabold text-slate-800">{upcomingCount}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contests..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-400"
              />
            </div>

            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-sky-400"
            >
              {platforms.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["upcoming", "Upcoming"],
              ["live", "Live"],
              ["finished", "Finished"],
              ["saved", "Bookmarked"]
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  status === value
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white py-20 text-center text-slate-500">
            <RefreshCw className="mx-auto mb-3 animate-spin" />
            Loading contests...
          </div>
        ) : filtered.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(contest => (
              <ContestCard
                key={`${contest.platform}:${contest.contestId}`}
                contest={contest}
                saved={saved.some(item => item.key === `${contest.platform}:${contest.contestId}`)}
                onToggleSave={toggleSave}
                now={clock}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <Trophy size={36} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">No contests found</h3>
            <p className="mt-2 text-sm text-slate-400">
              Try another filter or refresh the contest list.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}



