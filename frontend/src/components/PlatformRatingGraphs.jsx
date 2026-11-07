import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import api from "../lib/api";

const COLORS = {
  codeforces: "#2563EB",
  leetcode: "#F97316",
  codechef: "#A16207",
  atcoder: "#64748B",
  geeksforgeeks: "#16A34A"
};

const LABELS = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  atcoder: "AtCoder",
  geeksforgeeks: "GeeksforGeeks"
};

function RatingCard({ account, demoMode, data }) {
  const points = data?.points || [];
  const color = COLORS[account.platform] || "#64748B";
  const current = account.currentStats?.rating;

  const chartData = points.map(point => ({
    ...point,
    dateLabel: new Date(point.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "2-digit"
    })
  }));

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider"
            style={{ color }}>
            {LABELS[account.platform] || account.platform}
          </span>
          <h3 className="mt-1 text-lg font-extrabold text-slate-900">
            @{account.handle}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Contest rating progression
          </p>
        </div>
        <div className="rounded-xl px-4 py-2 text-right"
          style={{ backgroundColor: `${color}12` }}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Current rating
          </p>
          <p className="text-2xl font-extrabold" style={{ color }}>
            {current != null ? Number(current).toFixed(0) : "—"}
          </p>
        </div>
      </div>

      {data?.loading ? (
        <div className="flex h-[300px] items-center justify-center gap-2 text-sm text-slate-400">
          <RefreshCw size={17} className="animate-spin" />
          Loading {LABELS[account.platform]} history...
        </div>
      ) : chartData.length > 0 ? (
        <>
          <div className="mt-5 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={25}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={label => `Contest date: ${label}`}
                  formatter={value => [Number(value).toFixed(0), "Rating"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: color, stroke: "#fff", strokeWidth: 2 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>{chartData.length} contest rating records</span>
            <span>
              Latest recorded: {new Date(chartData[chartData.length - 1].date).toLocaleDateString("en-IN")}
            </span>
          </div>
        </>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
          <TrendingUp size={34} className="text-slate-300" />
          <h4 className="mt-3 font-bold text-slate-700">No contest history available</h4>
          <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
            {data?.error
              ? data.error
              : account.platform === "leetcode"
                ? "The contest-history query is now enabled. Restart the backend and sync this LeetCode account again to save its contest ratings."
                : "Sync this account after its platform adapter supports contest rating history. Historical records will appear here when available."}
          </p>
        </div>
      )}
    </article>
  );
}

export default function PlatformRatingGraphs({ accounts, demoMode }) {
  const [histories, setHistories] = useState({});

  useEffect(() => {
    let active = true;

    async function load() {
      if (!accounts.length) {
        setHistories({});
        return;
      }

      if (demoMode) {
        const result = {};
        accounts.forEach(account => {
          result[account._id] = { points: [] };
        });
        if (active) setHistories(result);
        return;
      }

      const initial = {};
      accounts.forEach(account => {
        initial[account._id] = { points: [], loading: true };
      });
      if (active) setHistories(initial);

      const results = await Promise.allSettled(
        accounts.map(account =>
          api.get(`/analytics/contest-history/${account._id}`)
        )
      );

      if (!active) return;

      const next = {};
      results.forEach((result, index) => {
        const account = accounts[index];

        if (result.status !== "fulfilled") {
          next[account._id] = {
            points: [],
            loading: false,
            error: result.reason?.response?.data?.message || "Could not load rating history."
          };
          return;
        }

        const points = (result.value.data.history || [])
          .filter(item => item.newRating != null)
          .map(item => ({
            date: item.date,
            rating: Number(item.newRating)
          }))
          .filter(item => item.date && Number.isFinite(item.rating))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        next[account._id] = { points, loading: false };
      });

      setHistories(next);
    }

    load();
    return () => { active = false; };
  }, [accounts, demoMode]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-extrabold tracking-widest text-sky-600">
          CONTEST PERFORMANCE
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Rating graphs
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Separate contest-rating progression for every connected platform account.
        </p>
      </div>

      {demoMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          Demo mode does not contain real contest history.
        </div>
      )}

      {accounts.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {accounts.map(account => (
            <RatingCard
              key={account._id}
              account={account}
              demoMode={demoMode}
              data={histories[account._id] || { points: [], loading: true }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
          <AlertCircle className="mx-auto text-slate-300" size={32} />
          <p className="mt-3 font-bold text-slate-700">No accounts connected</p>
          <p className="mt-1 text-sm text-slate-400">Connect a platform account to see its contest rating graph.</p>
        </div>
      )}
    </section>
  );
}