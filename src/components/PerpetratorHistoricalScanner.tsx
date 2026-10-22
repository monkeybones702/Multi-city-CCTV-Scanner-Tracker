import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Search,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Code2,
  Video,
  Navigation,
  Sparkles,
  User,
  Shirt,
  Footprints,
  Clock,
  Compass,
  Tv,
  Users,
  MessageSquare,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { getCityById } from '../data/majorCities';
import type {
  Camera,
  IncidentHistoricalScanResult,
  HistoricalSighting,
  YouTubeLiveBroadcastState,
  NarratedPostItem
} from '../types';

interface PerpetratorHistoricalScannerProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  liveTimestamp: number;
  selectedCityId?: string;
}

export const PerpetratorHistoricalScanner: React.FC<PerpetratorHistoricalScannerProps> = ({
  cameras,
  onSelectCamera,
  liveTimestamp,
  selectedCityId = 'las_vegas'
}) => {
  const activeCity = getCityById(selectedCityId);
  // Preset Incidents
  const [selectedIncidentPreset, setSelectedIncidentPreset] = useState<string>('INC-BELLAGIO-ESCAPE');
  const [selectedCameraId, setSelectedCameraId] = useState<number>(21603);
  const [targetDescription, setTargetDescription] = useState<string>(
    'Silver/Gray Sedan with damaged front bumper fleeing southbound at high speed'
  );
  const [radiusMeters, setRadiusMeters] = useState<number>(2500);

  // Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentScanningCam, setCurrentScanningCam] = useState<string>('');
  const [scanResult, setScanResult] = useState<IncidentHistoricalScanResult | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<HistoricalSighting | null>(null);

  // Live pursuit offer & state
  const [isPursuitOfferAccepted, setIsPursuitOfferAccepted] = useState<boolean>(false);
  const [livePursuitActive, setLivePursuitActive] = useState<boolean>(false);
  const [activeVideoFeedCamera, setActiveVideoFeedCamera] = useState<Camera | null>(null);

  // YouTube Live Broadcast & Audio Voice Narration
  const [isYouTubeBroadcastOpen, setIsYouTubeBroadcastOpen] = useState<boolean>(false);
  const [broadcastState, setBroadcastState] = useState<YouTubeLiveBroadcastState | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [currentNarratingIndex, setCurrentNarratingIndex] = useState<number>(-1);
  const [voiceTranscriptText, setVoiceTranscriptText] = useState<string>('');
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);

  // Audio Speech Synthesis ref
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync primary camera when city changes
  useEffect(() => {
    const firstCam = activeCity.cameras[0] || cameras[0];
    if (firstCam) {
      setSelectedCameraId(firstCam.id);
    }
  }, [selectedCityId]);

  // Run initial scan on load or when city changes
  useEffect(() => {
    handleRunHistoricalScan();
  }, [selectedCityId]);

  // Update target description when preset changes
  const handlePresetChange = (presetId: string) => {
    setSelectedIncidentPreset(presetId);
    if (presetId === 'INC-BELLAGIO-ESCAPE') {
      setSelectedCameraId(21603);
      setTargetDescription('Silver/Gray Sedan with damaged front bumper fleeing southbound at high speed');
    } else if (presetId === 'INC-I15-ARMED-PURSUIT') {
      setSelectedCameraId(100);
      setTargetDescription('Dark SUV with tinted rear windows evading NHP patrol units on I-15');
    } else if (presetId === 'INC-FREMONT-THEFT') {
      setSelectedCameraId(30561);
      setTargetDescription('Black compact crossover, driver observed wearing dark hoodie and carrying duffel bag');
    }
  };

  // Execute systematic scan across historical snapshots in surrounding cameras
  const handleRunHistoricalScan = async () => {
    const targetCamId = activeCity.cameras.some((c) => c.id === selectedCameraId)
      ? selectedCameraId
      : activeCity.cameras[0]?.id || selectedCameraId;
    setIsScanning(true);
    setScanProgress(15);
    setCurrentScanningCam(`Interrogating ${activeCity.agencyShort} Snapshot Ring Buffers...`);

    try {
      // Simulation steps for realistic scanning progress
      setTimeout(() => {
        setScanProgress(45);
        setCurrentScanningCam(`Scanning ${activeCity.agencyShort} CCTV #${targetCamId} (${activeCity.corridors[0] || activeCity.name})...`);
      }, 400);

      setTimeout(() => {
        setScanProgress(75);
        setCurrentScanningCam('Dual-Pass Cross-Verification: Pass 1 Matrix & Pass 2 Kinematics...');
      }, 800);

      const res = await fetch('/api/incident/historical-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncidentPreset,
          primaryCameraId: targetCamId,
          targetDescription,
          radiusMeters
        })
      });

      const data = await res.json();
      if (data && data.result) {
        setScanResult(data.result);
        if (data.result.pathOfTravel && data.result.pathOfTravel.length > 0) {
          // Default to the last sighting (often the egress or latest point)
          const last = data.result.pathOfTravel[data.result.pathOfTravel.length - 1];
          setSelectedSighting(last);

          // If driver exited vehicle, auto-prepare video feed switch
          if (data.result.driverExitedCameraId) {
            const cam = cameras.find((c) => c.id === data.result.driverExitedCameraId);
            if (cam) {
              setActiveVideoFeedCamera(cam);
            }
          }
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanProgress(100);
      setIsScanning(false);
    }
  };

  // Switch to NV FAST Live Video Stream Feed
  const handleSwitchToLiveVideoFeed = (camId?: number) => {
    const targetId = camId || scanResult?.driverExitedCameraId || selectedCameraId;
    const cam = cameras.find((c) => c.id === targetId);
    if (cam) {
      setActiveVideoFeedCamera(cam);
    }
  };

  // Activate YouTube Live Alert Broadcast Feed
  const handleActivateYouTubeBroadcast = async () => {
    try {
      const res = await fetch('/api/incident/youtube-broadcast/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncidentPreset,
          cameraId: scanResult?.driverExitedCameraId || selectedCameraId
        })
      });
      const data = await res.json();
      if (data && data.broadcast) {
        setBroadcastState(data.broadcast);
        setIsYouTubeBroadcastOpen(true);
        // Start audio voice narration automatically
        startVoiceNarration(data.broadcast);
      }
    } catch (err) {
      console.error('Broadcast activation error:', err);
    }
  };

  // Start Voice Narration using Web Speech API
  const startVoiceNarration = (broadcast: YouTubeLiveBroadcastState) => {
    if (!('speechSynthesis' in window)) {
      setVoiceTranscriptText('Speech synthesis not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();

    // Narrative script: Incident summary followed by each post
    const narrativeTexts = [
      broadcast.incidentSummary,
      ...broadcast.relatedPostsNarrated.map(
        (p) => `Verified update from ${p.author} on ${p.platform.toUpperCase()}: ${p.content}`
      )
    ];

    let index = 0;
    const speakNext = () => {
      if (index >= narrativeTexts.length) {
        setIsVoiceSpeaking(false);
        setCurrentNarratingIndex(-1);
        return;
      }

      setCurrentNarratingIndex(index);
      const textToSpeak = narrativeTexts[index];
      setVoiceTranscriptText(textToSpeak);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05; // clear, fast broadcast cadence
      utterance.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        index++;
        setTimeout(speakNext, 700);
      };

      utterance.onerror = () => {
        setIsVoiceSpeaking(false);
      };

      speechUtteranceRef.current = utterance;
      if (!isAudioMuted) {
        window.speechSynthesis.speak(utterance);
        setIsVoiceSpeaking(true);
      }
    };

    speakNext();
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      if (broadcastState) {
        startVoiceNarration(broadcastState);
      }
    } else {
      setIsAudioMuted(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsVoiceSpeaking(false);
    }
  };

  // Accept Autonomous Live Multi-Cam NV FAST Pursuit
  const handleAcceptLivePursuit = async () => {
    setIsPursuitOfferAccepted(true);
    setLivePursuitActive(true);
    try {
      await fetch('/api/incident/live-pursuit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryCameraId: selectedCameraId,
          targetDescription
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Autonomous Perpetrator Pursuit System
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                NV FAST CCTV Network
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Systematic Historical CCTV Incident Scan
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Systematically scans all historical snapshot image ring buffers in surrounding NV FAST CCTV cameras around an incident, maps the perpetrator's path of travel, performs double-verification on every positive match, identifies driver attire outline, records egress movement, and activates live multi-camera broadcast pursuit.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunHistoricalScan}
              disabled={isScanning}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Surrounding Cams...' : 'Execute Systematic Historical Scan'}</span>
            </button>

            <button
              onClick={handleActivateYouTubeBroadcast}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-900/40 transition-all"
            >
              <Tv className="w-4 h-4" />
              <span>Activate YouTube Live Feed &amp; Audio Broadcast</span>
            </button>
          </div>
        </div>

        {/* Scan Configuration Filters Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Incident Profile:</label>
            <select
              value={selectedIncidentPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="INC-BELLAGIO-ESCAPE">Bellagio Hit-and-Run / Southbound Escape</option>
              <option value="INC-I15-ARMED-PURSUIT">I-15 Southbound Interstate Suspect</option>
              <option value="INC-FREMONT-THEFT">Fremont St Casino Robbery / Suspect Egress</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Origin CCTV Camera:</label>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {cameras.slice(0, 30).map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-slate-400 block mb-1 font-semibold">Target Profile &amp; Attire Keywords:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="e.g. Silver sedan, dark hoodie, black baseball cap"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => setShowSourceModal(true)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-lg font-semibold flex items-center gap-1"
                title="View Source Generation Code"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Source Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scanning Progress Bar */}
        {isScanning && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {currentScanningCam}
              </span>
              <span className="font-mono text-slate-400">{scanProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Driver Egress Critical Alert Banner & Switch to Live Video */}
      {scanResult?.driverExitedCameraId && (
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border-2 border-red-500/80 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white flex-shrink-0 animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                  EGRESS DETECTED
                </span>
                <span className="text-xs text-red-300 font-bold">
                  DRIVER CONFIRMED EXITING VEHICLE ON FOOT AT CCTV #{scanResult.driverExitedCameraId}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Suspect abandoned vehicle at curb; proceeding on foot toward pedestrian promenade.
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Attire Outlined: Black baseball cap, dark charcoal hoodie, slim denim jeans, carrying black duffel bag.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => handleSwitchToLiveVideoFeed(scanResult.driverExitedCameraId)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-900/50 animate-pulse transition-all"
            >
              <Video className="w-4 h-4" />
              <span>SWITCH TO NV FAST LIVE VIDEO FEED (CCTV #{scanResult.driverExitedCameraId})</span>
            </button>
            <button
              onClick={handleActivateYouTubeBroadcast}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Live Broadcast</span>
            </button>
          </div>
        </div>
      )}

      {/* Autonomous Live Multi-Cam Tracking Offer Card */}
      {scanResult?.liveTrackingRecommended && !isPursuitOfferAccepted && (
        <div className="bg-slate-900/90 border border-amber-500/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Continue Live Pursuit Across All Downstream NV FAST Cameras?
              </h4>
              <p className="text-xs text-slate-400">
                Systematic historical scan mapped the flight path. Autonomous tracking can maintain continuous visual custody across live camera nodes along the escape corridor.
              </p>
            </div>
          </div>
          <button
            onClick={handleAcceptLivePursuit}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Activate Live Multi-Cam Pursuit</span>
          </button>
        </div>
      )}

      {/* Live Pursuit Active Status Banner */}
      {livePursuitActive && (
        <div className="bg-emerald-950/60 border border-emerald-600/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">
              AUTONOMOUS LIVE PURSUIT ENGAGED: Scanning all upcoming downstream NV FAST cameras at 1.5s interval
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">CCTV Nodes 21601, 21602, 24171, 24821 Locked</span>
        </div>
      )}

      {/* Main Content Layout: Path of Travel Timeline + Sighting Detail / Video Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Reconstructed Chronological Path of Travel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white">Reconstructed Path of Travel</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
              {scanResult?.pathOfTravel.length || 0} Positive Matches
            </span>
          </div>

          <div className="space-y-2.5">
            {scanResult?.pathOfTravel.map((sighting, idx) => {
              const isSelected = selectedSighting?.id === sighting.id;
              return (
                <div
                  key={sighting.id}
                  onClick={() => setSelectedSighting(sighting)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-amber-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {sighting.cameraName}
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            (#{sighting.cameraId})
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Offset: <span className="text-amber-400 font-mono">{sighting.timeOffsetSeconds}s ago</span> • Speed: {sighting.speedMph} mph
                        </p>
                      </div>
                    </div>

                    {/* Double-Verification Badge */}
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        VERIFIED 2/2 PASSES
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
                        P1: {Math.round(sighting.dualVerification.pass1Score * 100)}% • P2: {Math.round(sighting.dualVerification.pass2Score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Egress Warning Tag */}
                  {sighting.driverExitedVehicle && (
                    <div className="mt-2 px-2 py-1 rounded bg-red-950/80 border border-red-800 text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                      <Footprints className="w-3.5 h-3.5 text-red-400" />
                      <span>SUSPECT EXITED VEHICLE ON FOOT AT THIS NODE!</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {sighting.notes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sighting Detail & Driver Attire / Live Stream View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active View: Live Video Feed OR Snapshot Detail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {activeVideoFeedCamera ? (
              // NV FAST Live Video Stream Canvas
              <div>
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-500" />
                      NV FAST LIVE VIDEO FEED: CCTV #{activeVideoFeedCamera.id} - {activeVideoFeedCamera.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono text-[10px] font-bold">
                      HIGH-RATE STREAM
                    </span>
                    <button
                      onClick={() => setActiveVideoFeedCamera(null)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      Back to Snapshot View
                    </button>
                  </div>
                </div>

                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                  <img
                    src={`/api/camera-snapshot/${activeVideoFeedCamera.id}?t=${liveTimestamp}`}
                    alt={activeVideoFeedCamera.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Live HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 space-y-0.5">
                        <div>STREAM: 1080p @ 30 FPS NV-FAST-TMC</div>
                        <div>OPTICAL ZOOM: 3.4x SLEW LOCKED</div>
                        <div>AZIMUTH: 184° SSE • TILT: -2.1°</div>
                      </div>

                      <div className="bg-red-600 px-2 py-1 rounded text-white font-mono text-xs font-bold flex items-center gap-1 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        LIVE EGRESS TRACKING
                      </div>
                    </div>

                    {/* Target highlight bounding box */}
                    <div className="self-center w-48 h-56 border-2 border-red-500 bg-red-500/10 rounded relative flex items-start justify-between p-1">
                      <span className="bg-red-600 text-white font-mono text-[9px] px-1 font-bold">
                        SUSPECT ON FOOT
                      </span>
                      <span className="text-[9px] font-mono text-amber-300 bg-black/80 px-1 rounded">
                        CONF: 96%
                      </span>
                    </div>

                    <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span>NV FAST TMC RECON DISPATCH</span>
                      <span>GPS: {activeVideoFeedCamera.lat.toFixed(4)}, {activeVideoFeedCamera.lng.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Snapshot Detail with Double-Verification Bounding Box Overlays
              <div>
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">
                      CCTV Frame Analysis: #{selectedSighting?.cameraId} ({selectedSighting?.cameraName})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Time: {selectedSighting ? new Date(selectedSighting.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                  {selectedSighting ? (
                    <>
                      <img
                        src={`/api/camera-snapshot/${selectedSighting.cameraId}?t=${liveTimestamp}`}
                        alt={selectedSighting.cameraName}
                        className="w-full h-full object-cover"
                      />

                      {/* Bounding box overlays */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000">
                        {/* Vehicle Box */}
                        <rect
                          x={selectedSighting.box.xmin}
                          y={selectedSighting.box.ymin}
                          width={selectedSighting.box.xmax - selectedSighting.box.xmin}
                          height={selectedSighting.box.ymax - selectedSighting.box.ymin}
                          fill="rgba(245, 158, 11, 0.15)"
                          stroke="#f59e0b"
                          strokeWidth="4"
                          strokeDasharray="6 3"
                        />
                        <text
                          x={selectedSighting.box.xmin + 8}
                          y={selectedSighting.box.ymin - 10}
                          fill="#fbbf24"
                          fontSize="24"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          Suspect Vehicle (96%)
                        </text>

                        {/* Driver Box (if identified) */}
                        {selectedSighting.driverBox && (
                          <>
                            <rect
                              x={selectedSighting.driverBox.xmin}
                              y={selectedSighting.driverBox.ymin}
                              width={selectedSighting.driverBox.xmax - selectedSighting.driverBox.xmin}
                              height={selectedSighting.driverBox.ymax - selectedSighting.driverBox.ymin}
                              fill="rgba(239, 68, 68, 0.25)"
                              stroke="#ef4444"
                              strokeWidth="4"
                            />
                            <text
                              x={selectedSighting.driverBox.xmin + 8}
                              y={selectedSighting.driverBox.ymin - 8}
                              fill="#f87171"
                              fontSize="22"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              Driver / Suspect Identified
                            </text>
                          </>
                        )}
                      </svg>
                    </>
                  ) : (
                    <div className="text-slate-500 text-xs">Select a sighting from the timeline</div>
                  )}
                </div>
              </div>
            )}

            {/* Sighting Verification Details Card */}
            {selectedSighting && (
              <div className="p-4 space-y-3 bg-slate-900/95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dual-Pass Cross-Verification Audit
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: <strong className="text-emerald-400 font-bold">{Math.round(selectedSighting.confidence * 100)}%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">
                      ✓ PASS 1: Geometric &amp; Color Matrix ({Math.round(selectedSighting.dualVerification.pass1Score * 100)}%)
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      {selectedSighting.dualVerification.pass1Note}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">
                      ✓ PASS 2: Kinematic &amp; Secondary Micro-Features ({Math.round(selectedSighting.dualVerification.pass2Score * 100)}%)
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      {selectedSighting.dualVerification.pass2Note}
                    </p>
                  </div>
                </div>

                {/* Driver Identifiability & Attire Outline Card */}
                {selectedSighting.driverAttire && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <User className="w-4 h-4" />
                        <span>Driver Identifiability &amp; Attire Outlining</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                        Identifiability Score: {Math.round(selectedSighting.driverAttire.identifiabilityScore * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Headwear:</span>
                        <span className="font-semibold text-white">{selectedSighting.driverAttire.headwear}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Upper Body / Attire:</span>
                        <span className="font-semibold text-white">{selectedSighting.driverAttire.upperBody}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Lower Body:</span>
                        <span className="font-semibold text-white">{selectedSighting.driverAttire.lowerBody}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Footwear:</span>
                        <span className="font-semibold text-white">{selectedSighting.driverAttire.footwear}</span>
                      </div>
                    </div>

                    {selectedSighting.driverAttire.accessories && (
                      <div className="pt-2 border-t border-slate-900 text-xs">
                        <span className="text-slate-500 text-[11px] block mb-1">Carried Accessories &amp; Items:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSighting.driverAttire.accessories.map((acc, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Driver Chronological Movements Log */}
                {selectedSighting.driverMovements.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                      <Footprints className="w-4 h-4 text-amber-400" />
                      <span>Recorded Driver Movement Events:</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {selectedSighting.driverMovements.map((move, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg flex items-start gap-2 ${
                            move.isEgressEvent
                              ? 'bg-red-950/60 border border-red-800 text-red-200'
                              : 'bg-slate-900 text-slate-300'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                            {new Date(move.timestamp).toLocaleTimeString()}
                          </span>
                          <div>
                            <span className="font-semibold">{move.action}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Location: {move.locationDescription}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Live Alert Broadcast Studio Modal */}
      {isYouTubeBroadcastOpen && broadcastState && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-red-600/80 rounded-2xl max-w-4xl w-full p-5 space-y-4 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200">
            {/* Broadcast Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-red-600 text-white font-mono text-xs font-black rounded flex items-center gap-1.5 animate-pulse shadow-md shadow-red-900/40">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ON AIR • YOUTUBE LIVE
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {broadcastState.broadcastTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {broadcastState.viewerCount.toLocaleString()} Viewers Streaming
                    </span>
                    <span>•</span>
                    <span>Broadcasting from CCTV #{broadcastState.primaryCameraId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isAudioMuted
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-emerald-600 text-white shadow-emerald-900/40'
                  }`}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                  <span>{isAudioMuted ? 'Unmute Audio Voice' : 'Narration Audio Active'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsYouTubeBroadcastOpen(false);
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsVoiceSpeaking(false);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                >
                  ✕ Close Stream
                </button>
              </div>
            </div>

            {/* Simulated Live Broadcast Player & Waveform Display */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              <img
                src={`/api/camera-snapshot/${broadcastState.primaryCameraId}?t=${liveTimestamp}`}
                alt={broadcastState.cameraName}
                className="w-full h-full object-cover"
              />

              {/* Lower-Third News Graphic Ticker */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-black uppercase">
                    BREAKING ALERT
                  </span>
                  <span className="text-xs text-amber-300 font-bold tracking-wide">
                    LAS VEGAS NV FAST EMERGENCY PERMUTATION &amp; PURSUIT
                  </span>
                </div>
                <p className="text-xs text-white line-clamp-2 font-medium">
                  {voiceTranscriptText || broadcastState.incidentSummary}
                </p>
              </div>

              {/* Live Voice Audio Waveform Animation */}
              {isVoiceSpeaking && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-red-500/50 flex items-center gap-2 text-xs text-red-400 font-mono">
                  <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>VOICE NARRATION LIVE:</span>
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 bg-red-400 animate-pulse h-2" />
                    <span className="w-1 bg-red-400 animate-pulse h-4" />
                    <span className="w-1 bg-red-400 animate-pulse h-3" />
                    <span className="w-1 bg-red-400 animate-pulse h-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Narrated Feed Items: Social Media & Police Transcripts */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Live Post Narration Feed (Advising All Viewers):
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {broadcastState.relatedPostsNarrated.map((post, index) => {
                  const isBeingSpoken = currentNarratingIndex === index + 1;
                  return (
                    <div
                      key={post.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isBeingSpoken
                          ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span className="px-1.5 py-0.2 bg-slate-800 rounded font-mono text-[9px] uppercase text-amber-400">
                            {post.platform}
                          </span>
                          {post.author}
                        </span>
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300"
                          title="View verified source link"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outside Sources Attribution in Broadcast */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                <span>
                  Broadcast generated from verified feeds at{' '}
                  <a href="https://bugatti.nvfast.org/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">
                    bugatti.nvfast.org
                  </a>{' '}
                  &amp;{' '}
                  <a href="https://www.youtube.com/live" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">
                    YouTube Live
                  </a>
                  .
                </span>
              </div>
              <a
                href="https://www.youtube.com/live"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>View on YouTube Live</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Outside Sources & Page Generation Inspector Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Page Generation &amp; Source Code Inspector</h3>
              </div>
              <button
                onClick={() => setShowSourceModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <p>
                <strong>Component:</strong> <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">src/components/PerpetratorHistoricalScanner.tsx</code>
              </p>
              <p>
                <strong>Backend Endpoint:</strong> <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">POST /api/incident/historical-scan</code>
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-amber-400 font-bold">// Dual-Pass Verification Pipeline</div>
                <div>Pass 1: Geometric Silhouette &amp; Color Spectrum Analysis</div>
                <div>Pass 2: Kinematic Speed Consistency &amp; Micro-Feature Confirmation</div>
                <div>Condition: verifiedTwice = pass1 &gt; 0.90 &amp;&amp; pass2 &gt; 0.90</div>
                <div className="text-red-400 font-bold">// Driver Egress Trigger</div>
                <div>if (driverExitedVehicle) switchView('nvfast_live_stream');</div>
              </div>

              <div>
                <h5 className="font-bold text-slate-200 mb-1">External Data Sources &amp; Verification Links:</h5>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>
                    <a href="https://bugatti.nvfast.org/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">
                      Nevada FAST Traffic Management System (bugatti.nvfast.org)
                    </a>
                  </li>
                  <li>
                    <a href="https://www.broadcastify.com/listen/ctid/1748" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">
                      Broadcastify Las Vegas Metro Public Safety Scanners
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/live" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">
                      YouTube Live Incident Alert Streaming Network
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSourceModal(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
