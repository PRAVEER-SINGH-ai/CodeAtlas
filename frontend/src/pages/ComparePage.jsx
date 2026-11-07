import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowLeftRight, Search, Trophy, Code2,
  CheckCircle2, AlertCircle, UserRound, Crown, Minus
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const platformNames = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  atcoder: "AtCoder",
  geeksforgeeks: "GeeksforGeeks"
};

const demoComparison = {
  users: {
    user1: {
      name: "Demo Developer",
      username: "demo_developer",
      accounts: [
        {
          platform: "codeforces",
          handle: "tourist",
          profileUrl: "https://codeforces.com/profile/tourist",
          currentStats: { rating: 1701, maxRating: 1842, problemsSolved: 420, contestsParticipated: 86 }
        },
        {
          platform: "leetcode",
          handle: "leetcode_demo",
          profileUrl: "https://leetcode.com/u/leetcode_demo/",
          currentStats: { rating: 1701, maxRating: 1800, problemsSolved: 550, contestsParticipated: 40 }
        }
      ]
    },
    user2: {
      name: "Sample Coder",
      username: "sample_coder",
      accounts: [
        {
          platform: "codeforces",
          handle: "sample_cf",
          profileUrl: "https://codeforces.com/profile/sample_cf",
          currentStats: { rating: 1850, maxRating: 1920, problemsSolved: 380, contestsParticipated: 72 }
        },
        {
          platform: "codechef",
          handle: "sample_cc",
          profileUrl: "https://www.codechef.com/users/sample_cc",
          currentStats: { rating: 1750, maxRating: 1810, problemsSolved: 260, contestsParticipated: 30 }
        }
      ]
    }
  },
  comparisons: ["codeforces", "leetcode", "codechef", "atcoder", "geeksforgeeks"].map(platform => {
    const a = {
      codeforces: { rating: 1701, maxRating: 1842, problemsSolved: 420, contestsParticipated: 86 },
      leetcode: { rating: 1701, maxRating: 1800, problemsSolved: 550, contestsParticipated: 40 }
    }[platform] || null;

    const b = {
      codeforces: { rating: 1850, maxRating: 1920, problemsSolved: 380, contestsParticipated: 72 },
      codechef: { rating: 1750, maxRating: 1810, problemsSolved: 260, contestsParticipated: 30 }
    }[platform] || null;

    return {
      platform,
      account1: a ? { platform, handle: "sample", currentStats: a } : null,
      account2: b ? { platform, handle: "sample", currentStats: b } : null,
      connectedByBoth: Boolean(a && b),
      metrics: ["rating", "maxRating", "problemsSolved", "contestsParticipated"].map(key => {
        const v1 = a?.[key] ?? null;
        const v2 = b?.[key] ?? null;
        const comparable = typeof v1 === "number" && typeof v2 === "number";
        return {
          key,
          label: {
            rating: "Current rating",
            maxRating: "Maximum rating",
            problemsSolved: "Problems solved",
            contestsParticipated: "Contests participated"
          }[key],
          value1: v1,
          value2: v2,
          comparable,
          leader: !comparable ? null : v1 === v2 ? "tie" : v1 > v2 ? "user1" : "user2",
          difference: comparable ? Math.abs(v1 - v2) : null
        };
      })
    };
  })
};

function MetricRow({ metric, user1, user2 }) {
  const winner = metric.leader;

  return (
    <div className="grid grid-cols-[1fr_1.2fr_1fr] items-center gap-2 border-t border-slate-100 py-3">
      <div className={`text-right text-sm font-extrabold ${
        winner === "user1" ? "text-green-600" : "text-slate-700"
      }`}>
        {metric.value1 == null ? "—" : Number(metric.value1).toLocaleString("en-IN")}
        {winner === "user1" && <Crown size={13} className="ml-1 inline" />}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-600">{metric.label}</p>
        {metric.comparable && (
          <p className="mt-1 text-[10px] text-slate-400">
            {metric.difference === 0 ? "Equal" : `Difference: ${metric.difference.toLocaleString("en-IN")}`}
          </p>
        )}
      </div>

      <div className={`text-sm font-extrabold ${
        winner === "user2" ? "text-green-600" : "text-slate-700"
      }`}>
        {metric.value2 == null ? "—" : Number(metric.value2).toLocaleString("en-IN")}
        {winner === "user2" && <Crown size={13} className="ml-1 inline" />}
      </div>
    </div>
  );
}

function UserCard({ user, side }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#249dcc]">
          <UserRound size={23} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold text-slate-800">{user.name}</p>
          <p className="text-sm text-[#249dcc]">@{user.username}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">Verified profiles</span>
        <span className="font-extrabold text-slate-800">{user.accounts.length}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {user.accounts.map(account => (
          <span key={account.platform} className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {platformNames[account.platform] || account.platform}
          </span>
        ))}
      </div>
      <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {side}
      </span>
    </div>
  );
}

export default function ComparePage() {
  const { demoMode } = useAuth();

  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompare(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const first = username1.trim().replace(/^@/, "");
    const second = username2.trim().replace(/^@/, "");

    if (!first || !second) {
      setError("Enter both CodeAtlas usernames.");
      return;
    }

    if (first.toLowerCase() === second.toLowerCase()) {
      setError("Please enter two different CodeAtlas usernames.");
      return;
    }

    if (demoMode) {
      setResult(demoComparison);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/compare/users", {
        username1: first,
        username2: second
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Comparison failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#45B6E8] text-white">
              <Code2 size={23} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Code<span className="text-[#45B6E8]">Atlas</span>.
            </span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-[#249dcc]">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-bold text-[#249dcc]">
            <ArrowLeftRight size={17} /> DEVELOPER BATTLE
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Compare developers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Compare two CodeAtlas users using the verified coding profiles they've connected.
          </p>
        </div>

        {demoMode && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo mode — sample comparison data is shown. Real user search requires a database connection.
          </div>
        )}

        <form onSubmit={handleCompare} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-600">First CodeAtlas username</label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-[#45B6E8]">
                <span className="text-slate-400">@</span>
                <input
                  value={username1}
                  onChange={event => setUsername1(event.target.value)}
                  placeholder="e.g. praveer"
                  minLength={3}
                  maxLength={25}
                  className="w-full border-0 bg-transparent px-2 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-[#249dcc] md:flex">
              <ArrowLeftRight size={20} />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-600">Second CodeAtlas username</label>
              <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-[#45B6E8]">
                <span className="text-slate-400">@</span>
                <input
                  value={username2}
                  onChange={event => setUsername2(event.target.value)}
                  placeholder="e.g. coder123"
                  minLength={3}
                  maxLength={25}
                  className="w-full border-0 bg-transparent px-2 py-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={17} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#45B6E8] px-5 py-3.5 text-sm font-extrabold text-white shadow-md shadow-sky-100 transition hover:bg-[#249dcc] disabled:opacity-50 sm:w-auto"
          >
            <Search size={17} />
            {loading ? "Comparing..." : "Compare developers"}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <UserCard user={result.users.user1} side="Developer 1" />
              <UserCard user={result.users.user2} side="Developer 2" />
            </div>

            {result.comparisons.map(item => (
              <section key={item.platform} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 p-5">
                  <div>
                    <h2 className="font-extrabold text-slate-800">
                      {platformNames[item.platform] || item.platform}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.connectedByBoth
                        ? "Both users have a verified account"
                        : item.account1 || item.account2
                          ? "Only one user has a verified account"
                          : "Neither user has a verified account"}
                    </p>
                  </div>
                  <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    item.connectedByBoth ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.connectedByBoth ? "Comparable" : "Partial data"}
                  </span>
                </div>

                {(item.account1 || item.account2) && (
                  <div className="grid grid-cols-2 gap-3 px-5 pb-4">
                    {[item.account1, item.account2].map((account, index) => (
                      <div key={index} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {index === 0 ? `@${result.users.user1.username}` : `@${result.users.user2.username}`}
                        </p>
                        {account ? (
                          <a href={account.profileUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm font-bold text-[#249dcc]">
                            @{account.handle}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-slate-400">Not connected</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 pb-4">
                  {item.metrics.map(metric => (
                    <MetricRow
                      key={metric.key}
                      metric={metric}
                      user1={result.users.user1}
                      user2={result.users.user2}
                    />
                  ))}
                </div>
              </section>
            ))}

            <p className="text-center text-xs text-slate-400">
              {result.note || "Sample data for demonstration only."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
