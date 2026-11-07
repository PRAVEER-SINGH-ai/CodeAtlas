import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, Target, Trophy, ShieldCheck, Activity } from "lucide-react";
import api from "../lib/api";

const demoHistory = {
  "demo-cf": [1250, 1320, 1290, 1410, 1480, 1450, 1570, 1660, 1701],
  "demo-lc": [1650, 1720, 1690, 1810, 1900, 1980, 2050, 2100, 2150],
  "demo-cc": [1200, 1280, 1350, 1310, 1440, 1530, 1610, 1750, 1840]
};

function makeDemoPoints(accountId) {
  const values = demoHistory[accountId] || [];
  return values.map((rating, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (values.length - 1 - index));

    return {
      date: date.toISOString(),
      rating
    };
  });
}

function MetricCard({ label, value, detail, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
        {Number(value || 0).toLocaleString("en-IN")}
      </p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

export default function AnalyticsSection({ accounts, demoMode }) {
  const [history, setHistory] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [range, setRange] = useState("6m");
  const [loading, setLoading] = useState(!demoMode);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoadError("");

      if (demoMode) {
        const demo = accounts.map(account => ({
          accountId: account._id,
          platform: account.platform,
          handle: account.handle,
          points: makeDemoPoints(account._id)
        }));

        if (active) {
          setHistory(demo);
          setOverview(null);
          setLoading(false);
        }
        return;
      }

      if (!accounts.length) {
        if (active) {
          setHistory([]);
          setOverview(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const overviewResponse = await api.get("/analytics/overview");

        const results = await Promise.allSettled(
          accounts.map(account =>
            api.get(`/analytics/history/${account._id}`)
          )
        );

        if (!active) return;

        setOverview(overviewResponse.data);

        const histories = results.map((result, index) => {
          const account = accounts[index];

          if (result.status !== "fulfilled") return null;

          const points = (result.value.data.history || [])
            .filter(item => item.rating !== null && item.rating !== undefined)
            .map(item => ({
              date: item.capturedAt,
              rating: item.rating
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          return {
            accountId: account._id,
            platform: account.platform,
            handle: account.handle,
            points
          };
        }).filter(Boolean);

        setHistory(histories);
      } catch (error) {
        if (active) {
          setLoadError(
            error.response?.data?.message ||
            "Analytics could not be loaded. Try refreshing."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [accounts, demoMode]);

  const selectedHistory = history.find(item => item.accountId === selectedId)
    || history.find(item => item.points.length > 0)
    || history[0];

  useEffect(() => {
    if (!history.length) {
      setSelectedId("");
      return;
    }

    if (!history.some(item => item.accountId === selectedId)) {
      setSelectedId(
        history.find(item => item.points.length > 0)?.accountId ||
        history[0].accountId
      );
    }
  }, [history, selectedId]);

  const chartData = useMemo(() => {
    if (!selectedHistory) return [];

    const now = Date.now();
    const ranges = {
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "6m": 183 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    return selectedHistory.points
      .filter(point => now - new Date(point.date).getTime() <= ranges[range])
      .map(point => ({
        ...point,
        dateLabel: new Date(point.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        })
      }));
  }, [selectedHistory, range]);

  const solvedData = useMemo(() => accounts.map(account => ({
    platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
    solved: account.currentStats?.problemsSolved || 0
  })), [accounts]);

  const selectedAccount = accounts.find(account => account._id === selectedId)
    || accounts[0];

  const currentRating = selectedAccount?.currentStats?.rating || 0;
  const bestRating = selectedAccount?.currentStats?.maxRating || currentRating;

  const totalSolved = accounts.reduce(
    (sum, account) => sum + (account.currentStats?.problemsSolved || 0),
    0
  );

  const totalContests = overview?.totals?.contestsParticipated ??
    accounts.reduce(
      (sum, account) => sum + (account.currentStats?.contestsParticipated || 0),
      0
    );

  const verifiedCount = accounts.filter(account => account.isVerified).length;

  return (
    <section className="mb-10">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#249dcc]">
          <Activity size={17} />
          PERFORMANCE ANALYTICS
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
          Your coding performance
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Track your progress across competitive programming platforms.
        </p>
      </div>

      {demoMode && (
        <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs text-sky-700">
          Illustrative analytics data. These figures are not live platform statistics.
        </div>
      )}

      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {loadError}
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Problems solved"
          value={totalSolved}
          detail="Combined reported platform totals"
          icon={Target}
          color="bg-sky-50 text-sky-600"
        />
        <MetricCard
          label="Contests participated"
          value={totalContests}
          detail="Across connected accounts"
          icon={Trophy}
          color="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Current rating"
          value={currentRating}
          detail={selectedAccount ? `${selectedAccount.handle} · selected profile` : "No profile selected"}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
        />
        <MetricCard
          label="Verified profiles"
          value={verifiedCount}
          detail={`Out of ${accounts.length} connected accounts`}
          icon={ShieldCheck}
          color="bg-pink-50 text-pink-600"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800">Rating history</h3>
              <p className="mt-1 text-xs text-slate-400">
                Follow rating changes for an individual profile.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedId}
                onChange={event => setSelectedId(event.target.value)}
                className="max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-sky-400"
              >
                {history.map(item => (
                  <option key={item.accountId} value={item.accountId}>
                    {item.platform} · {item.handle}
                  </option>
                ))}
              </select>

              <select
                value={range}
                onChange={event => setRange(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-sky-400"
              >
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="6m">6 months</option>
                <option value="1y">1 year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
              Loading rating history...
            </div>
          ) : chartData.length > 0 ? (
            <>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Current rating</p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {currentRating.toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Peak: <strong className="text-slate-700">{bestRating.toLocaleString("en-IN")}</strong>
                </p>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      formatter={value => [value, "Rating"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#45B6E8"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#45B6E8", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center text-center">
              <TrendingUp size={30} className="text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No rating history yet</p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Historical snapshots will appear here after your profile data has been synced.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-extrabold text-slate-800">Problems by platform</h3>
            <p className="mt-1 text-xs text-slate-400">
              Reported solved-problem totals for each account.
            </p>
          </div>

          {solvedData.some(item => item.solved > 0) ? (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solvedData} margin={{ top: 8, right: 8, left: -18, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                  <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="solved" name="Problems solved" fill="#83D447" radius={[7, 7, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[290px] items-center justify-center text-center text-xs text-slate-400">
              Problem statistics will appear after profile sync.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
