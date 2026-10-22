import React, { useState, useEffect } from 'react';
import {
  Compass,
  Radio,
  Sliders,
  AlertTriangle,
  RotateCw,
  Eye,
  ShieldAlert,
  Zap,
  Clock,
  Video,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Activity,
  MessageSquarePlus
} from 'lucide-react';
import { getCityById } from '../data/majorCities';
import type { Camera, PTZMovementState, PTZAlert } from '../types';

interface PTZMovementScannerProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onOpenCommunityPostModal?: (camera?: Camera) => void;
  liveTimestamp: number;
  selectedCityId?: string;
}

export const PTZMovementScanner: React.FC<PTZMovementScannerProps> = ({
  cameras,
  onSelectCamera,
  onOpenCommunityPostModal,
  liveTimestamp,
  selectedCityId = 'las_vegas'
}) => {
  const activeCity = getCityById(selectedCityId);
  const [filterType, setFilterType] = useState<'all' | 'operator' | 'tour'>('all');
  const [alerts, setAlerts] = useState<PTZAlert[]>([]);
  const [activeMovingList, setActiveMovingList] = useState<Array<{ camera: Camera; ptzState: PTZMovementState }>>([]);
  const [operatorCount, setOperatorCount] = useState<number>(0);
  const [tourCount, setTourCount] = useState<number>(0);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [selectedScanCam, setSelectedScanCam] = useState<Camera | null>(null);
  const [isScanningCam, setIsScanningCam] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Fetch live PTZ status from backend for active city CCTV network
  const fetchPTZStatus = () => {
    fetch(`/api/ptz/status?city=${selectedCityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setActiveMovingList(data.activeMoving || []);
          setAlerts(data.recentAlerts || []);
          setOperatorCount(data.operatorManualCount || 0);
          setTourCount(data.programmedTourCount || 0);
        }
      })
      .catch((err) => console.error('Failed to load PTZ status:', err));
  };

  useEffect(() => {
    fetchPTZStatus();
    const interval = setInterval(fetchPTZStatus, 4000);
    return () => clearInterval(interval);
  }, [selectedCityId]);

  // Filtered cameras in motion
  const displayedItems = activeMovingList.filter((item) => {
    if (filterType === 'operator') return item.ptzState.status === 'operator_manual';
    if (filterType === 'tour') return item.ptzState.status === 'programmed_tour';
    return true;
  });

  // Trigger optical PTZ scan on a camera
  const handleAnalyzeCamera = async (cam: Camera) => {
    setSelectedScanCam(cam);
    setIsScanningCam(true);
    setActionFeedback(`Scanning optical flow vectors across successive frames for ${cam.name}...`);
    try {
      const res = await fetch(`/api/ptz/scan-camera/${cam.id}`, { method: 'POST' });
      const data = await res.json();
      if (data && data.ptzState) {
        setActionFeedback(
          `Analysis complete: Camera is ${data.ptzState.status.replace('_', ' ').toUpperCase()} (${data.ptzState.classificationReason.slice(0, 75)}...)`
        );
        fetchPTZStatus();
      }
    } catch {
      setActionFeedback('Failed to query camera telemetry.');
    } finally {
      setIsScanningCam(false);
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Toggle or simulate operator override
  const handleToggleOperatorOverride = async (camId: number) => {
    try {
      const res = await fetch('/api/ptz/toggle-operator-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraId: camId, action: 'toggle' })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(
          data.ptzState.status === 'operator_manual'
            ? `Simulated manual operator joystick override on CCTV #${camId}!`
            : `CCTV #${camId} reset to stationary position.`
        );
        fetchPTZStatus();
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch {
      setActionFeedback('Action failed.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Alert System */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Compass className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide">
                CCTV PTZ Motion Scanner &amp; Movement Classifier
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Detects robotic Pan-Tilt-Zoom adjustments across the <strong>{activeCity.agencyName} ({activeCity.agencyShort})</strong> network in real-time.
              Distinguishes between <strong>Live Human Operator Manual Overrides</strong> (erratic
              joystick slewing, sudden optical zooms on incident lanes) and <strong>Programmed Guard
              Tours</strong> (deterministic constant-velocity preset cycles).
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Operator Active Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>
                <strong className="text-white font-bold">{operatorCount}</strong> Operator Overrides Active
              </span>
            </div>

            {/* Programmed Tours Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
              <span>
                <strong className="text-white font-bold">{tourCount}</strong> Programmed Patrol Tours
              </span>
            </div>

            {/* Sound Alerts Toggle */}
            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              title={soundAlertsEnabled ? 'Operator alert chimes active' : 'Alert chimes muted'}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                soundAlertsEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundAlertsEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>Muted</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action feedback toast inside panel */}
        {actionFeedback && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-950/70 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Real-time Operator Alerts Marquee / Feed */}
      {alerts.length > 0 && (
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Live Movement Alert Feed
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Showing {alerts.slice(0, 4).length} latest camera slews
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {alerts.slice(0, 4).map((alt) => (
              <div
                key={alt.id}
                onClick={() => {
                  const cam = cameras.find((c) => c.id === alt.cameraId);
                  if (cam) onSelectCamera(cam);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                  alt.type === 'operator_manual'
                    ? 'bg-rose-950/30 border-rose-800/60 hover:border-rose-600'
                    : 'bg-cyan-950/20 border-cyan-800/50 hover:border-cyan-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono text-slate-300">CCTV #{alt.cameraId}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate">{alt.cameraName}</div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-tight">
                  {alt.details}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded ${
                      alt.type === 'operator_manual'
                        ? 'bg-rose-900/60 text-rose-300'
                        : 'bg-cyan-900/60 text-cyan-300'
                    }`}
                  >
                    {alt.type === 'operator_manual' ? '🕹️ OPERATOR OVERRIDE' : '🔄 AUTO-TOUR'}
                  </span>
                  <span className="text-amber-400 flex items-center gap-0.5">
                    View Live <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement Filter Tabs & Quick Simulation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Moving ({activeMovingList.length})
          </button>
          <button
            onClick={() => setFilterType('operator')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              filterType === 'operator'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Operator Manual Only ({operatorCount})
          </button>
          <button
            onClick={() => setFilterType('tour')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              filterType === 'tour'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            Programmed Tours Only ({tourCount})
          </button>
        </div>

        {/* Quick actions info */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Comparing frame vectors against standard FAST 45s/60s tour timetables</span>
        </div>
      </div>

      {/* Main Grid of Moving CCTV Cameras */}
      {displayedItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-spin-slow" />
          <p className="text-sm font-semibold text-slate-200">No cameras match current movement filter</p>
          <p className="text-xs text-slate-500 mt-1">
            Try switching filter to &quot;All Moving&quot; or select a camera to simulate manual operator PTZ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map(({ camera, ptzState }) => {
            const isOperator = ptzState.status === 'operator_manual';
            return (
              <div
                key={camera.id}
                className={`bg-slate-900 border rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-slate-600 ${
                  isOperator ? 'border-rose-800/80 ring-1 ring-rose-500/20' : 'border-cyan-800/80'
                }`}
              >
                {/* Card Header */}
                <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      CCTV #{camera.id}
                    </span>
                    <span className="text-xs font-bold text-white truncate" title={camera.name}>
                      {camera.name}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      isOperator
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {isOperator ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        Operator Active
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
                        Programmed Tour
                      </>
                    )}
                  </span>
                </div>

                {/* Camera Snapshot with Live Movement HUD Overlay */}
                <div
                  onClick={() => onSelectCamera(camera)}
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={`/api/camera-snapshot/${camera.id}?t=${liveTimestamp}`}
                    alt={camera.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* PTZ Telemetry HUD Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

                  {/* Top corner live radar telemetry */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-mono text-slate-200 flex items-center gap-2">
                    <Compass className="w-3 h-3 text-amber-400" />
                    <span>Azimuth: {ptzState.headingDeg}°</span>
                    <span>|</span>
                    <span className="text-amber-300">{ptzState.zoomLevel}x Zoom</span>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
                    Δ {ptzState.movementDurationSec}s elapsed
                  </div>

                  {/* Bottom HUD overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700">
                        Pan: {ptzState.panSpeedDegPerSec}°/s
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700">
                        Tilt: {ptzState.tiltSpeedDegPerSec}°/s
                      </span>
                    </div>

                    <span className="text-[10px] text-amber-400 group-hover:underline flex items-center gap-1 font-semibold">
                      Enlarge <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Telemetry Breakdown & Classification Details */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Probability Comparison Bars */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-rose-400" />
                        Human Operator Score
                      </span>
                      <strong className="text-rose-400 font-mono">
                        {Math.round(ptzState.operatorConfidence * 100)}%
                      </strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(ptzState.operatorConfidence * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <RotateCw className="w-3 h-3 text-cyan-400" />
                        Programmed Tour Match
                      </span>
                      <strong className="text-cyan-400 font-mono">
                        {Math.round(ptzState.tourMatchScore * 100)}%
                      </strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(ptzState.tourMatchScore * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Forensic Reason Box */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 leading-relaxed">
                    <p className="line-clamp-3">{ptzState.classificationReason}</p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAnalyzeCamera(camera)}
                        disabled={isScanningCam && selectedScanCam?.id === camera.id}
                        className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                        title="Re-scan optical flow vectors"
                      >
                        <Compass className="w-3 h-3 text-amber-400" />
                        <span>Vectors</span>
                      </button>

                      <button
                        onClick={() => handleToggleOperatorOverride(camera.id)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          isOperator
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-800'
                        }`}
                        title="Simulate or reset manual operator joystick slewing"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{isOperator ? 'Reset' : 'Override'}</span>
                      </button>
                    </div>

                    {onOpenCommunityPostModal && (
                      <button
                        onClick={() => onOpenCommunityPostModal(camera)}
                        className="px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Post incident note or report for this camera"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Post Note</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
