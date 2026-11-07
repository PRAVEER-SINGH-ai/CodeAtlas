import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Code2, LogOut, UserRound, Plus, ExternalLink,
  Trash2, RefreshCw, Trophy, LayoutDashboard,
  Link2, AlertCircle, CheckCircle2, Clock, X
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../lib/api";
import AnalyticsSection from "../components/AnalyticsSection";


const demoAccounts = [
  {
    _id: "demo-cf",
    platform: "codeforces",
    handle: "tourist",
    profileUrl: "https://codeforces.com/profile/tourist",
    isVerified: true,
    verificationStatus: "verified",
    isPrimary: true,
    currentStats: { rating: 3822, problemsSolved: 3200 },
    lastSyncedAt: new Date().toISOString()
  },
  {
    _id: "demo-lc",
    platform: "leetcode",
    handle: "leetcode_demo",
    profileUrl: "https://leetcode.com/u/leetcode_demo/",
    isVerified: true,
    verificationStatus: "verified",
    isPrimary: false,
    currentStats: { rating: 2150, problemsSolved: 850 },
    lastSyncedAt: new Date().toISOString()
  },
  {
    _id: "demo-cc",
    platform: "codechef",
    handle: "demo_coder",
    profileUrl: "https://www.codechef.com/users/demo_coder",
    isVerified: false,
    verificationStatus: "pending",
    isPrimary: false,
    currentStats: { rating: 1840, problemsSolved: 420 },
    lastSyncedAt: null
  }
];
const platformColors = {
  codeforces: "bg-red-50 text-red-600",
  leetcode: "bg-orange-50 text-orange-600",
  codechef: "bg-amber-50 text-amber-700",
  atcoder: "bg-slate-100 text-slate-700",
  geeksforgeeks: "bg-green-50 text-green-700"
};

function Status({ account }) {
  if (account.verificationStatus === "verified") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
        <CheckCircle2 size={14} /> Verified
      </span>
    );
  }

  if (account.verificationStatus === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
        <AlertCircle size={14} /> Verification failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Clock size={14} /> Pending verification
    </span>
  );
}

function AccountCard({ account, onDelete, deleting, onStartVerification, onCheckVerification, verificationCode, verifying, demoMode, onSync, syncing }) {
  const platformName = account.platform
    ? account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
    : "Platform";

  const stats = account.currentStats || {};

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${platformColors[account.platform] || "bg-slate-100 text-slate-600"}`}>
            {platformName.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-800">{platformName}</h3>
            <p className="truncate text-sm text-slate-500">@{account.handle}</p>
          </div>
        </div>

        <button
          onClick={() => onDelete(account._id)}
          disabled={deleting}
          title="Remove account"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Status account={account} />
        {account.isPrimary && (
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600">
            PRIMARY
          </span>
        )}
      </div>

      {account.platform === "leetcode" && !account.isVerified && (
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3">
          {demoMode ? (
            <p className="text-xs leading-5 text-slate-600">
              Ownership verification requires a real connected account. Demo profiles cannot be verified.
            </p>
          ) : verificationCode ? (
            <>
              <p className="text-xs font-semibold text-slate-700">
                Add this code to your LeetCode About Me section:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-white p-2 text-xs font-bold text-sky-700">
                  {verificationCode}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(verificationCode)}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Save your public profile changes, then click Verify below. Code expires in 30 minutes.
              </p>
              <button
                type="button"
                disabled={verifying}
                onClick={() => onCheckVerification(account)}
                className="mt-3 w-full rounded-lg bg-[#45B6E8] px-3 py-2 text-xs font-bold text-white hover:bg-[#249dcc] disabled:opacity-50"
              >
                {verifying ? "Checking..." : "I've added the code â€” Verify"}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={verifying}
              onClick={() => onStartVerification(account)}
              className="w-full rounded-lg border border-[#45B6E8] bg-white px-3 py-2 text-xs font-bold text-[#249dcc] hover:bg-sky-100 disabled:opacity-50"
            >
              {verifying ? "Generating..." : "Verify LeetCode ownership"}
            </button>
          )}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-400">Rating</p>
          <p className="mt-1 font-bold text-slate-800">
            {stats.rating ?? "â€”"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Problems solved</p>
          <p className="mt-1 font-bold text-slate-800">
            {stats.problemsSolved ?? "â€”"}
          </p>
        </div>
      </div>

      {account.platform === "leetcode" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50 px-3 py-3">
            <p className="text-xs font-semibold text-emerald-700">Easy</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-800">
              {stats.easyProblemsSolved ?? "—"}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 px-3 py-3">
            <p className="text-xs font-semibold text-amber-700">Medium</p>
            <p className="mt-1 text-lg font-extrabold text-amber-800">
              {stats.mediumProblemsSolved ?? "—"}
            </p>
          </div>

          <div className="rounded-xl bg-rose-50 px-3 py-3">
            <p className="text-xs font-semibold text-rose-700">Hard</p>
            <p className="mt-1 text-lg font-extrabold text-rose-800">
              {stats.hardProblemsSolved ?? "—"}
            </p>
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {account.lastSyncedAt
            ? `Synced ${new Date(account.lastSyncedAt).toLocaleDateString()}`
            : "Not synced yet"}
        </span>

        <div className="flex items-center gap-3">
          {account.syncError && (
            <span title={account.syncError} className="max-w-[130px] truncate text-[10px] text-red-500">
              Sync failed
            </span>
          )}
          {account.isVerified && (
            <button
              type="button"
              onClick={() => onSync(account)}
              disabled={syncing || demoMode}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync now"}
            </button>
          )}
        </div>

        {account.profileUrl && (
          <a
            href={account.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#249dcc] no-underline hover:underline"
          >
            View profile <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const { user, logout, demoMode } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [platform, setPlatform] = useState("codeforces");
  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [verificationCodes, setVerificationCodes] = useState({});
  const [verifyingId, setVerifyingId] = useState(null);
  const [syncingIds, setSyncingIds] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    if (demoMode) {
      setAccounts(demoAccounts);
      setPlatforms([
        { id: "codeforces", name: "Codeforces" },
        { id: "leetcode", name: "LeetCode" },
        { id: "codechef", name: "CodeChef" },
        { id: "atcoder", name: "AtCoder" },
        { id: "geeksforgeeks", name: "GeeksforGeeks" }
      ]);
      setLoading(false);
      return;
    }

    try {
      const [platformResponse, accountResponse] = await Promise.all([
        api.get("/platforms"),
        api.get("/accounts")
      ]);

      setPlatforms(platformResponse.data.platforms || []);
      setAccounts(accountResponse.data.accounts || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function applySyncResult(accountId, profile) {
    setAccounts(previous => previous.map(item =>
      item._id === accountId
        ? {
            ...item,
            identity: profile.identity || item.identity,
            currentStats: profile.stats || item.currentStats,
            profileUrl: profile.profileUrl || item.profileUrl,
            lastSyncedAt: profile.fetchedAt || new Date().toISOString(),
            syncStatus: "success",
            syncError: null
          }
        : item
    ));
  }

  async function handleSyncAccount(account) {
    if (demoMode) return false;

    setError("");
    setSuccess("");
    setSyncingIds(previous => [...new Set([...previous, account._id])]);

    try {
      const response = await api.post(`/sync/${account._id}`);
      applySyncResult(account._id, response.data.profile);
      setSuccess(`${account.platform} profile synchronized successfully.`);
      return true;
    } catch (err) {
      const message = getApiError(err);
      setAccounts(previous => previous.map(item =>
        item._id === account._id
          ? { ...item, syncStatus: "failed", syncError: message }
          : item
      ));
      setError(`${account.platform} sync failed: ${message}`);
      return false;
    } finally {
      setSyncingIds(previous => previous.filter(id => id !== account._id));
    }
  }

  async function handleRefresh() {
    if (demoMode) {
      await loadData();
      return;
    }

    const eligible = accounts.filter(item => item.isVerified);

    if (!eligible.length) {
      await loadData();
      setSuccess("Account list refreshed. Verify an account before synchronizing it.");
      return;
    }

    setError("");
    setSuccess("");
    setSyncingIds(previous => [
      ...new Set([...previous, ...eligible.map(item => item._id)])
    ]);

    const results = await Promise.allSettled(
      eligible.map(async account => {
        const response = await api.post(`/sync/${account._id}`);
        applySyncResult(account._id, response.data.profile);
      })
    );

    setSyncingIds(previous =>
      previous.filter(id => !eligible.some(account => account._id === id))
    );

    await loadData();

    const failed = results
      .map((result, index) => ({ result, account: eligible[index] }))
      .filter(item => item.result.status === "rejected");

    if (failed.length) {
      setError(
        `${failed.length} of ${eligible.length} sync(s) failed: ` +
        failed.map(item =>
          `${item.account.platform}: ${item.result.reason?.response?.data?.message || item.result.reason?.message || "Unknown error"}`
        ).join("; ")
      );
    } else {
      setSuccess(`${eligible.length} verified account(s) synchronized successfully.`);
    }
  }
  async function handleAddAccount(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!handle.trim()) {
      setError("Please enter your platform username.");
      return;
    }

    setAdding(true);

    if (demoMode) {
      const prefixes = {
        codeforces: "https://codeforces.com/profile/",
        leetcode: "https://leetcode.com/u/",
        codechef: "https://www.codechef.com/users/",
        atcoder: "https://atcoder.jp/users/",
        geeksforgeeks: "https://www.geeksforgeeks.org/user/"
      };

      const selected = platforms.find(item => item.id === platform);

      setAccounts(previous => [{
        _id: `demo-${Date.now()}`,
        platform,
        handle: handle.trim(),
        profileUrl: prefixes[platform] + encodeURIComponent(handle.trim()),
        isVerified: false,
        verificationStatus: "pending",
        isPrimary: false,
        currentStats: {},
        lastSyncedAt: null
      }, ...previous]);

      setHandle("");
      setShowAddForm(false);
      setSuccess(`${selected?.name || platform} account added to demo.`);
      setAdding(false);
      return;
    }

    try {
      const response = await api.post("/accounts", {
        platform,
        handle: handle.trim()
      });

      setAccounts(previous => [response.data.account, ...previous]);
      setHandle("");
      setShowAddForm(false);
      setSuccess("Platform account added successfully.");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteAccount(id) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this platform account?"
    );

    if (!confirmed) return;

    if (demoMode) {
      setAccounts(previous => previous.filter(item => item._id !== id));
      setSuccess("Demo account removed.");
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/accounts/${id}`);
      setAccounts(previous => previous.filter(item => item._id !== id));
      setSuccess("Platform account removed.");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStartVerification(account) {
    if (demoMode) {
      setError("Real verification is available after connecting your account to a database-backed session.");
      return;
    }

    setError("");
    setSuccess("");
    setVerifyingId(account._id);

    try {
      const response = await api.post(
        `/accounts/${account._id}/verification/start`
      );

      setVerificationCodes(previous => ({
        ...previous,
        [account._id]: response.data.code
      }));

      setSuccess("Verification code generated. Add it to your LeetCode About Me section.");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleCheckVerification(account) {
    const code = verificationCodes[account._id];

    if (!code) {
      setError("Generate a verification code first.");
      return;
    }

    setError("");
    setSuccess("");
    setVerifyingId(account._id);

    try {
      const response = await api.post(
        `/accounts/${account._id}/verification/check`,
        { code }
      );

      setAccounts(previous => previous.map(item =>
        item._id === account._id ? response.data.account : item
      ));

      setVerificationCodes(previous => {
        const updated = { ...previous };
        delete updated[account._id];
        return updated;
      });

      try {
        const syncResponse = await api.post(`/sync/${account._id}`);
        applySyncResult(account._id, syncResponse.data.profile);
        setSuccess("LeetCode verified and profile synchronized successfully!");
      } catch (syncError) {
        setError(`Account verified, but initial sync failed: ${getApiError(syncError)}`);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setVerifyingId(null);
    }
  }
  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#45B6E8] text-white">
              <Code2 size={23} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Code<span className="text-[#45B6E8]">Atlas</span>
              <span className="text-[#83D447]">.</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-700">
                {user?.name || "Developer"}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <Link
              to="/contests"
              className="rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700 no-underline transition hover:bg-green-100"
            >
              Contest Center
            </Link>
            <Link to="/compare"

              className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-[#249dcc] no-underline transition hover:bg-sky-100"

            >

              Compare

            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        {demoMode && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle size={18} />
            <span><strong>DEMO MODE</strong> â€” Sample data only. Changes are not saved to a real account.</span>
          </div>
        )}
        <div className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#249dcc]">
            <LayoutDashboard size={16} />
            DEVELOPER DASHBOARD
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {user?.name?.split(" ")[0] || "Developer"}!
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Your coding journey, all in one place.
          </p>
        </div>

        {(error || success) && (
          <div className={`mb-6 flex items-start gap-2 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-green-100 bg-green-50 text-green-700"
          }`}>
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{error || success}</span>
          </div>
        )}

        <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Connected accounts</p>
              <Link2 className="text-[#45B6E8]" size={20} />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {accounts.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Across coding platforms</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Verified accounts</p>
              <CheckCircle2 className="text-[#83D447]" size={20} />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {accounts.filter(item => item.isVerified).length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Identity verification</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Platforms available</p>
              <Trophy className="text-[#F48FB1]" size={20} />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {platforms.length || 5}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ready to connect</p>
          </div>
        </div>

                <AnalyticsSection accounts={accounts} demoMode={demoMode} />

<section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Connected platforms
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your competitive programming identities.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading || syncingIds.length > 0}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowAddForm(value => !value);
                }}
                className="flex items-center gap-2 rounded-xl bg-[#45B6E8] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-[#249dcc]"
              >
                {showAddForm ? <X size={16} /> : <Plus size={17} />}
                {showAddForm ? "Close" : "Add account"}
              </button>
            </div>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddAccount}
              className="mb-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-4 font-bold text-slate-800">
                Connect a platform account
              </h3>

              <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={event => setPlatform(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#45B6E8]"
                  >
                    {platforms.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Username / Handle
                  </label>
                  <input
                    value={handle}
                    onChange={event => setHandle(event.target.value)}
                    placeholder="Enter your platform username"
                    minLength={2}
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#45B6E8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-xl bg-[#83D447] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#70bf36] disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Connect"}
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Your account will initially be marked as pending verification.
              </p>
            </form>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
              <RefreshCw className="mx-auto animate-spin text-[#45B6E8]" size={26} />
              <p className="mt-3 text-sm text-slate-500">Loading your accounts...</p>
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map(account => (
                <AccountCard
                  key={account._id}
                  account={account}
                  onDelete={handleDeleteAccount}
                  deleting={deletingId === account._id}
                  onStartVerification={handleStartVerification}
                  onCheckVerification={handleCheckVerification}
                  verificationCode={verificationCodes[account._id]}
                  verifying={verifyingId === account._id}
                  demoMode={demoMode}
                  onSync={handleSyncAccount}
                  syncing={syncingIds.includes(account._id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F6FC] text-[#249dcc]">
                <Link2 size={25} />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                No accounts connected yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Connect your Codeforces, LeetCode or other coding profiles to bring your statistics together.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#45B6E8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#249dcc]"
              >
                <Plus size={16} /> Connect your first account
              </button>
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          CodeAtlas Â· Your coding universe, unified.
        </footer>
      </div>
    </main>
  );
}









