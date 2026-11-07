import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from "recharts";
import {
  Activity, Target, Trophy, Brain, Gauge, Flame, Plus,
  Trash2, ExternalLink, RefreshCw, CalendarDays, Zap,
  CheckCircle2, AlertCircle, Code2
} from "lucide-react";
import api from "../lib/api";

const COLORS = ["#38BDF8", "#F97316", "#A78BFA", "#34D399", "#F43F5E", "#FACC15"];
const METRICS = [
  ["problemsSolved", "Total problems solved"],
  ["easyProblemsSolved", "Easy problems solved"],
  ["mediumProblemsSolved", "Medium problems solved"],
  ["hardProblemsSolved", "Hard problems solved"],
  ["rating", "Contest rating"],
  ["contestsParticipated", "Contests attended"]
];

const panel = "rounded-2xl border border-slate-700/70 bg-[#101827]/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,.22)]";
const muted = "text-slate-400";
const heading = "text-slate-100 font-bold";
const number = "font-mono font-bold tracking-tight text-slate-50";

function Empty({ icon: Icon = Activity, title, detail }) {
  return <div className={`${panel} py-14 text-center`}>
    <Icon size={34} className="mx-auto text-slate-500" />
    <h3 className="mt-4 text-lg font-bold text-slate-100">{title}</h3>
    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">{detail}</p>
  </div>;
}

function Metric({ label, value, accent = "text-sky-300", hint }) {
  return <div className="rounded-xl border border-slate-700/70 bg-[#151F30] p-4">
    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{label}</p>
    <p className={`mt-2 font-mono text-2xl font-bold ${accent}`}>{Number(value || 0).toLocaleString("en-IN")}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>;
}

function Heatmap({ calendar }) {
  const days = calendar?.days || [];
  const map = new Map(days.map(d => [d.date, Number(d.count) || 0]));
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 363);
  start.setDate(start.getDate() - start.getDay());
  const cells = [];
  for (let i = 0; i < 371; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, count: map.get(key) || 0, date: d });
  }
  const shade = count => count === 0 ? "#1E293B" : count < 3 ? "#164E63" : count < 6 ? "#0E7490" : count < 10 ? "#2563EB" : "#F97316";

  return <div className={panel}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className={heading}>Submission activity</h3>
        <p className={`mt-1 text-xs ${muted}`}>Daily submissions reported by LeetCode · last 12 months</p>
      </div>
      <div className="flex gap-4 text-xs text-slate-400">
        <span>{calendar?.totalActiveDays || 0} active days</span>
        <span className="text-orange-300">{calendar?.streak || 0} day streak</span>
      </div>
    </div>
    {days.length ? <>
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[690px] grid-flow-col grid-rows-7 gap-[4px]">
          {cells.map(day => <div key={day.key}
            title={`${day.key}: ${day.count} submissions`}
            className="h-[13px] w-[13px] rounded-[3px] transition-transform hover:scale-125"
            style={{ backgroundColor: shade(day.count) }} />)}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Less</span><div className="flex gap-1">{[0, 1, 3, 6, 10].map(n =>
          <span key={n} className="h-3 w-3 rounded-sm" style={{ backgroundColor: shade(n) }} />)}</div><span>More</span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Counts represent submissions, not unique problems solved.</p>
    </> : <div className="py-10 text-center text-sm text-slate-400">No calendar data returned yet. Sync this account again; calendar access is optional and depends on LeetCode's public API.</div>}
  </div>;
}

function ContestInsights({ account }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    api.get(`/analytics/contest-history/${account._id}`)
      .then(({ data }) => { if (live) setHistory(data.history || []); })
      .catch(err => { if (live) setError(err.response?.data?.message || "Could not load contest history."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [account._id]);

  const rows = useMemo(() => history.map((h, i) => ({
    ...h,
    label: new Date(h.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    delta: Number(h.newRating) - Number(h.oldRating)
  })), [history]);

  const best = rows.length ? Math.max(...rows.map(x => Number(x.newRating) || 0)) : 0;
  const bestRank = rows.filter(x => Number(x.rank) > 0).reduce((v, x) => !v || x.rank < v ? x.rank : v, 0);
  const avgRankRows = rows.filter(x => Number(x.rank) > 0);
  const avgRank = avgRankRows.length ? Math.round(avgRankRows.reduce((s, x) => s + x.rank, 0) / avgRankRows.length) : null;
  const latest = rows[rows.length - 1];
  const first = rows[0];
  const net = latest && first ? Number(latest.newRating) - Number(first.newRating) : 0;

  if (loading) return <div className={`${panel} py-16 text-center text-slate-400`}><RefreshCw className="mx-auto animate-spin" />Loading contest intelligence...</div>;
  if (error) return <Empty icon={AlertCircle} title="Contest history unavailable" detail={error} />;
  if (!rows.length) return <Empty icon={Trophy} title="No contest records yet" detail="Participate in a LeetCode contest and sync your account to unlock detailed analytics." />;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Best rating" value={best} accent="text-orange-300" />
      <Metric label="Latest rating" value={latest?.newRating} accent="text-sky-300" />
      <Metric label="Best contest rank" value={bestRank || "—"} accent="text-emerald-300" />
      <Metric label="Average rank" value={avgRank || "—"} accent="text-violet-300" />
    </div>
    <div className={panel}>
      <div className="flex items-center justify-between gap-3">
        <div><h3 className={heading}>Rating trajectory</h3><p className={`mt-1 text-xs ${muted}`}>Historical contest ratings</p></div>
        <span className={`font-mono text-sm ${net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{net >= 0 ? "+" : ""}{Math.round(net)} net</span>
      </div>
      <div className="mt-5 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid stroke="#263449" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid #334155", borderRadius: 12, color: "#E2E8F0" }} />
            <Line type="monotone" dataKey="newRating" name="Rating" stroke="#38BDF8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-slate-500">{rows.length} recorded contests · latest: {latest?.contestName || "Contest"}</p>
    </div>
    <div className={panel}>
      <h3 className={heading}>Contest performance</h3>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows.slice(-12)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid stroke="#263449" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid #334155", borderRadius: 12, color: "#E2E8F0" }} />
            <Bar dataKey="rank" name="Contest rank" fill="#F97316" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500">Lower rank numbers indicate better placements. Only contests with reported ranks are shown.</p>
    </div>
  </div>;
}

function Difficulty({ stats }) {
  const items = [
    ["Easy", stats.easyProblemsSolved, "#34D399"],
    ["Medium", stats.mediumProblemsSolved, "#FBBF24"],
    ["Hard", stats.hardProblemsSolved, "#FB7185"]
  ];
  const total = items.reduce((s, x) => s + (Number(x[1]) || 0), 0);
  const accepted = Number(stats.acceptedSubmissions) || 0;
  const submissions = Number(stats.totalSubmissions) || 0;
  const rate = submissions ? Math.round(accepted / submissions * 100) : 0;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Unique problems" value={stats.problemsSolved} accent="text-sky-300" />
      <Metric label="Easy solved" value={stats.easyProblemsSolved} accent="text-emerald-300" />
      <Metric label="Medium solved" value={stats.mediumProblemsSolved} accent="text-amber-300" />
      <Metric label="Hard solved" value={stats.hardProblemsSolved} accent="text-rose-300" />
    </div>
    <div className={`${panel} grid gap-6 lg:grid-cols-[1fr_1fr]`}>
      <div>
        <h3 className={heading}>Difficulty distribution</h3>
        <p className={`mt-1 text-xs ${muted}`}>Solved problem counts by difficulty</p>
        <div className="mt-4 h-[270px]">
          {total ? <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={items.map(x => ({ name: x[0], value: Number(x[1]) || 0 }))} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={4}>
              {items.map(x => <Cell key={x[0]} fill={x[2]} />)}
            </Pie><Tooltip contentStyle={{ background: "#0B1220", border: "1px solid #334155", borderRadius: 10, color: "#E2E8F0" }} /></PieChart>
          </ResponsiveContainer> : <p className="pt-20 text-center text-sm text-slate-500">No difficulty data available.</p>}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-5">
        {items.map(([label, value, color]) => <div key={label}>
          <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><strong className="font-mono text-slate-100">{Number(value || 0).toLocaleString()}</strong></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${total ? Number(value || 0) / total * 100 : 0}%`, background: color }} /></div>
        </div>)}
        <div className="rounded-xl border border-slate-700 bg-[#0B1220] p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Submission acceptance ratio</p>
          <p className="mt-2 font-mono text-3xl font-bold text-sky-300">{submissions ? `${rate}%` : "—"}</p>
          <p className="mt-1 text-xs text-slate-500">{accepted.toLocaleString()} accepted / {submissions.toLocaleString()} total submissions</p>
        </div>
      </div>
    </div>
  </div>;
}

function TopicStrength({ topics }) {
  const sorted = [...topics].filter(t => t?.slug && t?.name).sort((a, b) => Number(b.solved || 0) - Number(a.solved || 0));
  const low = [...sorted].reverse().slice(0, 8);
  if (!sorted.length) return <Empty icon={Brain} title="Topic data not available" detail="Sync your LeetCode account to load topic-tag solve counts." />;

  return <div className="space-y-5">
    <div className={panel}>
      <h3 className={heading}>Topic coverage map</h3>
      <p className={`mt-1 text-xs ${muted}`}>Solved counts by LeetCode topic tag. Counts may overlap because a problem can have multiple tags.</p>
      <div className="mt-5 space-y-3">
        {sorted.slice(0, 18).map((t, i) => {
          const max = Math.max(1, Number(sorted[0]?.solved) || 1);
          return <div key={t.slug}>
            <div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-slate-300">{t.name}</span><span className="font-mono text-slate-400">{Number(t.solved || 0)}</span></div>
            <div className="h-2 rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${Number(t.solved || 0) / max * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
          </div>;
        })}
      </div>
    </div>
    <div className={panel}>
      <h3 className={heading}>Areas to explore</h3>
      <p className={`mt-1 text-xs ${muted}`}>Lowest solved-count topics in the available profile data—not a measure of ability.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {low.map(t => <a key={t.slug} href={`https://leetcode.com/tag/${encodeURIComponent(t.slug)}/`} target="_blank" rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#151F30] p-4 transition hover:border-sky-500/70 hover:bg-[#19283B]">
          <span><strong className="block text-sm text-slate-100">{t.name}</strong><span className="mt-1 block text-xs text-slate-500">{Number(t.solved || 0)} tagged solves</span></span>
          <ExternalLink size={15} className="text-sky-300" />
        </a>)}
      </div>
    </div>
  </div>;
}


function TopicDistribution({ topics, stats }) {
  const rows = [...topics]
    .filter(t => t?.name && Number(t.solved) > 0)
    .sort((a, b) => Number(b.solved || 0) - Number(a.solved || 0));

  const data = rows.slice(0, 10).map(t => ({
    name: t.name,
    value: Number(t.solved) || 0
  }));

  const colors = [
    "#39FF88", "#38BDF8", "#F97316", "#A78BFA",
    "#F43F5E", "#FACC15", "#2DD4BF", "#818CF8",
    "#FB923C", "#E879F9"
  ];

  if (!rows.length) {
    return <Empty icon={Brain} title="Topic data unavailable"
      detail="Sync your LeetCode profile to load topic statistics." />;
  }

  const total = rows.reduce((sum, t) => sum + Number(t.solved || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Topics tracked" value={rows.length} />
        <Metric label="Tagged solves" value={total} accent="text-sky-300" />
        <Metric label="Unique problems" value={stats.problemsSolved} accent="text-orange-300" />
      </div>

      <div className={`${panel} grid gap-5 lg:grid-cols-2`}>
        <div>
          <h3 className={heading}>Topic & problem distribution</h3>
          <p className={`mt-1 text-xs ${muted}`}>Top 10 topics by tagged solve count</p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name"
                  innerRadius="54%" outerRadius="82%" paddingAngle={3}>
                  {data.map((item, i) => (
                    <Cell key={item.name} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  background: "#080F19",
                  border: "1px solid #263449",
                  borderRadius: 10,
                  color: "#E2E8F0"
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center font-mono text-xs text-slate-400">
            {total.toLocaleString()} tagged solves
          </p>
        </div>

        <div>
          <h3 className={heading}>Topic breakdown</h3>
          <div className="mt-4 max-h-[340px] space-y-3 overflow-y-auto pr-2">
            {rows.slice(0, 18).map((topic, i) => (
              <div key={topic.slug || topic.name}>
                <div className="mb-1 flex justify-between gap-3 text-xs">
                  <span className="text-slate-300">{topic.name}</span>
                  <span className="font-mono text-sky-300">{topic.solved}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Number(topic.solved || 0) / Math.max(1, Number(rows[0].solved)) * 100}%`,
                      background: colors[i % colors.length]
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Topic counts can overlap because one problem may belong to multiple topics.
      </p>
    </div>
  );
}
function Goals({ account, stats, demoMode }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("problemsSolved");
  const [target, setTarget] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (demoMode) { setGoals([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/analytics/leetcode-goals/${account._id}`);
      setGoals(data.goals || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load goals.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [account._id, demoMode]);

  async function createGoal(e) {
    e.preventDefault();
    if (demoMode) { setError("Goals are saved to your account. Sign in to create persistent goals."); return; }
    try {
      const { data } = await api.post(`/analytics/leetcode-goals/${account._id}`, {
        title, metric, target: Number(target), dueDate: dueDate || null
      });
      setGoals(old => [data.goal, ...old]);
      setTitle(""); setTarget(""); setDueDate(""); setError("");
    } catch (err) { setError(err.response?.data?.message || "Could not create goal."); }
  }

  async function removeGoal(id) {
    try {
      await api.delete(`/analytics/leetcode-goals/${id}`);
      setGoals(old => old.filter(g => g._id !== id));
    } catch (err) { setError(err.response?.data?.message || "Could not delete goal."); }
  }

  return <div className="space-y-5">
    <div className={panel}>
      <div className="flex items-center gap-2"><Target className="text-orange-300" /><h3 className={heading}>Create a milestone</h3></div>
      <form onSubmit={createGoal} className="mt-5 grid gap-3 md:grid-cols-2">
        <input required maxLength={80} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Reach 500 solved problems"
          className="rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400" />
        <select value={metric} onChange={e => setMetric(e.target.value)} className="rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-sm text-slate-100">
          {METRICS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input required type="number" min="1" max="10000000" value={target} onChange={e => setTarget(e.target.value)} placeholder="Target value"
          className="rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400" />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          className="rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-sm text-slate-300" />
        <button className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 md:col-span-2"><Plus size={16} className="mr-2 inline" />Save goal</button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {demoMode && <p className="mt-3 text-xs text-amber-300">Demo mode: sign in to save goals permanently.</p>}
    </div>
    <div className={panel}>
      <div className="flex items-center justify-between"><h3 className={heading}>Your milestones</h3><button onClick={load} className="text-slate-400 hover:text-sky-300"><RefreshCw size={16} /></button></div>
      {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading goals...</p> : goals.length ? <div className="mt-4 space-y-3">
        {goals.map(g => <div key={g._id} className="rounded-xl border border-slate-700 bg-[#151F30] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-semibold text-slate-100">{g.title}</p><p className="mt-1 text-xs text-slate-500">{METRICS.find(x => x[0] === g.metric)?.[1]} · {g.dueDate ? `Due ${new Date(g.dueDate).toLocaleDateString("en-IN")}` : "No deadline"}</p></div>
            <div className="flex items-center gap-3"><strong className="font-mono text-sm text-sky-300">{g.current} / {g.target}</strong><button onClick={() => removeGoal(g._id)} title="Delete goal" className="text-slate-500 hover:text-rose-300"><Trash2 size={15} /></button></div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${g.completed ? "bg-emerald-400" : "bg-gradient-to-r from-sky-500 to-orange-400"}`} style={{ width: `${g.progress}%` }} /></div>
          <p className="mt-2 text-right text-xs text-slate-400">{g.completed ? "Milestone reached" : `${g.progress}% complete`}</p>
        </div>)}
      </div> : <p className="py-8 text-center text-sm text-slate-500">No goals yet. Set a target and let CodeAtlas track your progress after each sync.</p>}
    </div>
  </div>;
}

export default function LeetCodeWorkspace({ accounts = [], mode, demoMode = false }) {
  const list = accounts.filter(a => a.platform === "leetcode");
  const [selectedId, setSelectedId] = useState("");
  const account = list.find(a => a._id === selectedId) || list[0] || null;
  const stats = account?.currentStats || {};
  const topics = stats.topicStats || [];

  const sections = {
    activity: ["Submission activity", "Your daily LeetCode submission rhythm.", Activity],
    contests: ["Contest intelligence", "Rating trajectory, rank consistency and performance.", Trophy],
    topics: ["Topic intelligence", "Understand your topic coverage and areas to explore.", Brain],
    practice: ["Smart practice recommendations", "Find topics worth exploring next.", Zap],
    difficulty: ["Difficulty progress", "Track your Easy, Medium and Hard progression.", Gauge],
    goals: ["Goals & milestones", "Set measurable targets and track real progress.", Target],
    lists: ["Public Lists", "Your LeetCode list workspace.", Code2]
  };
  const [title, subtitle, Icon] = sections[mode] || sections.topics;

  if (!account) return <Empty icon={Code2} title="Connect a LeetCode account" detail="Add and sync a LeetCode profile to unlock this workspace." />;

  return <section className="relative space-y-5 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0B1220] p-4 sm:p-6">
    <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.22em] text-sky-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> CODEATLAS / LEETCODE INTELLIGENCE</p>
        <h2 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-white sm:text-3xl"><Icon className="text-orange-300" />{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      {list.length > 1 && <select value={account._id} onChange={e => setSelectedId(e.target.value)} className="rounded-xl border border-slate-700 bg-[#151F30] px-3 py-2.5 text-sm text-slate-200">
        {list.map(a => <option key={a._id} value={a._id}>@{a.handle}</option>)}
      </select>}
      {list.length === 1 && <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 font-mono text-xs text-sky-200">@{account.handle}</span>}
    </div>

    <div className="relative grid gap-3 sm:grid-cols-3">
      <Metric label="Problems solved" value={stats.problemsSolved} />
      <Metric label="Contest rating" value={stats.rating || "—"} accent="text-orange-300" />
      <Metric label="Contests attended" value={stats.contestsParticipated} accent="text-violet-300" />
    </div>

    <div className="relative">
      {mode === "activity" && <Heatmap calendar={stats.activityCalendar} />}
      {mode === "contests" && <ContestInsights account={account} />}
      {mode === "topics" && <TopicStrength topics={topics} />}
      {mode === "topicDistribution" && <TopicDistribution topics={topics} stats={stats} />}
      {mode === "practice" && <div className="grid gap-4 sm:grid-cols-2">{[...topics].filter(t => t?.slug && t?.name).sort((a,b) => Number(a.solved || 0) - Number(b.solved || 0)).slice(0,12).map((t,i) => (<a key={t.slug} href={`https://leetcode.com/tag/${encodeURIComponent(t.slug)}/`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 bg-[#111D2C] p-5 no-underline transition hover:border-orange-400"><p className="font-mono text-xs text-orange-300">TARGET 0{i+1}</p><h3 className="mt-2 font-bold text-slate-100">{t.name}</h3><p className="mt-1 text-xs text-slate-400">{Number(t.solved || 0)} tagged solves</p><p className="mt-3 text-xs text-sky-300">Explore problems →</p></a>))}</div>}
      {mode === "difficulty" && <Difficulty stats={stats} />}
      {mode === "goals" && <Goals account={account} stats={stats} demoMode={demoMode} />}
      {mode === "lists" && <div className={panel}>
        <h3 className={heading}>LeetCode public lists</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">LeetCode does not reliably expose a user's complete list collection through its public profile API. CodeAtlas will not invent lists, expose private lists or collect your session cookie.</p>
        <a href="https://leetcode.com/list/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-400">Open LeetCode My Lists <ExternalLink size={15} /></a>
      </div>}
    </div>
    {mode === "practice" && <p className="relative text-xs text-slate-500">Recommendations are topic-based using the lowest available solved counts. They are coverage signals, not a judgment of skill or a claim that these topics are objectively weak.</p>}
    <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">
      <span>DATA SOURCE: LEETCODE PROFILE API</span>
      <span>LAST SYNC: {account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString("en-IN") : "NOT SYNCED"}</span>
    </div>
  </section>;
}