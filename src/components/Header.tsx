import React from 'react';
import {
  Camera,
  Radio,
  Search,
  Navigation,
  MapPin,
  Sparkles,
  RefreshCw,
  Eye,
  Compass,
  Users,
  Flame,
  GitMerge,
  ShieldAlert,
  Car,
  ExternalLink,
  Code2,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { MAJOR_CITIES, type MajorCity } from '../data/majorCities';
import { useAuth } from '../context/AuthContext';

export type NavTabType =
  | 'monitor'
  | 'traffic'
  | 'pursuit'
  | 'ptz'
  | 'radar'
  | 'community'
  | 'search'
  | 'tracker'
  | 'map';

interface HeaderProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  lastRefreshTime: Date;
  trackedCount: number;
  movingCount?: number;
  postsCount?: number;
  correlationCount?: number;
  onQuickScanCorridor: () => void;
  isScanningCorridor: boolean;
  selectedCityId?: string;
  onSelectCity?: (cityId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  refreshRate,
  setRefreshRate,
  isPaused,
  setIsPaused,
  lastRefreshTime,
  trackedCount,
  movingCount = 0,
  postsCount = 0,
  correlationCount = 4,
  onQuickScanCorridor,
  isScanningCorridor,
  selectedCityId = 'las_vegas',
  onSelectCity
}) => {
  const activeCity: MajorCity =
    MAJOR_CITIES.find((c) => c.id === selectedCityId) || MAJOR_CITIES[0];
  const primaryIntelUrl =
    activeCity.externalIntelLinks[0]?.url || 'https://bugatti.nvfast.org/';
  const intelHostname = (() => {
    try {
      return new URL(primaryIntelUrl).hostname;
    } catch {
      return 'nvfast.org';
    }
  })();

  const { currentUser, signInWithGoogle, signOut, loading: authLoading } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Node connection info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-900/30 flex-shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{activeCity.name} CCTV Network</span>
                  <a
                    href={primaryIntelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                    title={`External Traffic & CCTV Intelligence Source: ${activeCity.agencyName}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{intelHostname}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-300" />
                  </a>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center flex-wrap gap-2 mt-0.5">
                <span className="text-slate-300 font-medium">
                  {activeCity.agencyName} ({activeCity.agencyShort})
                </span>
                <span>•</span>
                <span>Incident Heatmap &amp; Target Trajectory</span>
                <span>•</span>
                <a
                  href="/src/App.tsx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 underline"
                  title="View client application source code"
                >
                  <Code2 className="w-3 h-3 text-cyan-400" />
                  <span>App Source</span>
                </a>
              </p>
            </div>
          </div>

          {/* Quick Stats, City Selector & Firebase Auth */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Major City Selector Dropdown */}
            <div className="flex items-center bg-slate-800/90 rounded-md border border-cyan-500/40 px-2.5 py-1 gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-400 font-medium">City:</span>
              <select
                value={selectedCityId}
                onChange={(e) => onSelectCity?.(e.target.value)}
                className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs"
                title="Select major metropolitan region for live CCTV & ALPR tracking"
              >
                {MAJOR_CITIES.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-slate-900 text-slate-100 font-normal"
                  >
                    {c.displayName} — {c.agencyShort}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto refresh dropdown */}
            <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 px-2 py-1 gap-1.5">
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-400 ${
                  !isPaused ? 'animate-spin-slow' : ''
                }`}
              />
              <span className="text-slate-400">Stream:</span>
              <select
                value={isPaused ? 'paused' : refreshRate}
                onChange={(e) => {
                  if (e.target.value === 'paused') {
                    setIsPaused(true);
                  } else {
                    setIsPaused(false);
                    setRefreshRate(Number(e.target.value));
                  }
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value={1000} className="bg-slate-800">1s High-rate</option>
                <option value={2000} className="bg-slate-800">2s Live</option>
                <option value={5000} className="bg-slate-800">5s Standard</option>
                <option value={10000} className="bg-slate-800">10s Low Bandwidth</option>
                <option value="paused" className="bg-slate-800">Paused</option>
              </select>
            </div>

            {/* AI Corridor Scan Trigger */}
            <button
              onClick={onQuickScanCorridor}
              disabled={isScanningCorridor}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-md shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isScanningCorridor ? 'Scanning CCTV...' : 'AI Corridor Scan'}</span>
            </button>

            {/* Firebase Auth Operator Status */}
            {currentUser ? (
              <div className="flex items-center bg-slate-800/90 border border-emerald-500/40 rounded-md px-2 py-1 gap-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Operator"
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] font-bold text-slate-200 truncate max-w-[110px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    Operator Clearance
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign out operator session"
                  className="text-slate-400 hover:text-rose-400 p-0.5 ml-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
                title="Sign in with Google using Firebase Authentication"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Operator Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-slate-800/80 mt-3 pt-2 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'monitor'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Live CCTV Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-md shadow-amber-950/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>CCTV &amp; Incident Heatmap</span>
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                CORRIDORS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'tracker'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>Target Tracker &amp; PDF</span>
              {trackedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {trackedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('traffic')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'traffic'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>0.5 Radius ALPR</span>
            </button>

            <button
              onClick={() => setActiveTab('pursuit')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'pursuit'
                  ? 'bg-red-950 text-red-300 border border-red-700 shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Pursuit &amp; Broadcast</span>
            </button>

            <button
              onClick={() => setActiveTab('ptz')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'ptz'
                  ? 'bg-slate-800 text-rose-300 border border-rose-800/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-400" />
              <span>PTZ Motion</span>
              {movingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold rounded-full text-[10px] animate-pulse">
                  {movingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Crime Radar</span>
              {correlationCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {correlationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Community Response</span>
              {postsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-700 text-amber-300 font-semibold rounded-full text-[10px]">
                  {postsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Attribute Scanner</span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-500" />
              Sync: {lastRefreshTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
