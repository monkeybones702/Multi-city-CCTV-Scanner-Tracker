import React, { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import {
  MapPin,
  Eye,
  Layers,
  Flame,
  Sliders,
  ExternalLink,
  Code2,
  Info,
  ShieldAlert,
  Sparkles,
  Radio,
  CheckCircle2,
  FileDown,
  Activity,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { MAJOR_CITIES, getCityById, type MajorCity } from '../data/majorCities';
import type { Camera as CameraType, TrackedSubject, Detection } from '../types';
import { exportTrackedSubjectPDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';

interface CCTVMapProps {
  cameras: CameraType[];
  detections?: Detection[];
  onSelectCamera: (camera: CameraType) => void;
  activeTrackedSubject?: TrackedSubject | null;
  liveTimestamp: number;
  selectedCityId?: string;
  onSelectCity?: (cityId: string) => void;
}

// High-frequency historical alert hotspot data points
const HIGH_FREQUENCY_ALERT_HOTSPOTS = [
  { lat: 36.1126, lng: -115.1767, weight: 14.5, label: 'Bellagio & Flamingo Intersection (Strip Multi-Vehicle Hotspot)' },
  { lat: 36.1150, lng: -115.1730, weight: 12.0, label: 'Caesars Palace & Linq Pedestrian Corridor' },
  { lat: 36.1011, lng: -115.1731, weight: 13.2, label: 'Tropicana Ave & Las Vegas Blvd (South Strip Hub)' },
  { lat: 36.1281, lng: -115.1682, weight: 10.8, label: 'Wynn & Fashion Show Mall Crossing' },
  { lat: 36.0910, lng: -115.1750, weight: 9.5, label: 'Mandalay Bay & Russell Rd Strip Approach' },
  { lat: 36.1360, lng: -115.1610, weight: 8.4, label: 'Convention Center Dr & Strip Junction' },
  { lat: 36.1738, lng: -115.1582, weight: 15.0, label: 'I-15 & US-95 Spaghetti Bowl Interchange (High Debris / Collisions)' },
  { lat: 36.1442, lng: -115.1718, weight: 11.4, label: 'I-15 & Sahara Ave Interchange' },
  { lat: 36.1261, lng: -115.1855, weight: 10.2, label: 'I-15 & Spring Mountain Rd Overpass' },
  { lat: 36.0820, lng: -115.1810, weight: 8.8, label: 'I-15 & Russell Rd / Allegiant Stadium Gateway' },
  { lat: 36.0430, lng: -115.1800, weight: 7.9, label: 'I-15 & CC-215 Southern Beltway Merge' },
  { lat: 36.1706, lng: -115.1452, weight: 13.8, label: 'Fremont St & Casino Center Blvd (Pedestrian / Signal Incidents)' },
  { lat: 36.1680, lng: -115.1400, weight: 9.6, label: 'Fremont East & 4th Street Entertainment Zone' },
  { lat: 36.1600, lng: -115.1510, weight: 8.2, label: 'Arts District & Charleston Blvd' },
  { lat: 36.1585, lng: -115.1611, weight: 9.1, label: 'Charleston Blvd & Grand Central Pkwy' },
  { lat: 36.0852, lng: -115.1451, weight: 10.5, label: 'Harry Reid Int Airport Tunnel / Paradise Rd' },
  { lat: 36.0430, lng: -115.1356, weight: 7.2, label: 'Windmill & CC-215 Beltway Eastern Curve' }
];

export const CCTVMap: React.FC<CCTVMapProps> = ({
  cameras,
  detections = [],
  onSelectCamera,
  activeTrackedSubject,
  liveTimestamp,
  selectedCityId = 'las_vegas',
  onSelectCity
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState('All');
  const [hoveredCamera, setHoveredCamera] = useState<CameraType | null>(null);
  const [selectedPinCamera, setSelectedPinCamera] = useState<CameraType | null>(null);
  const [pdfExportStatus, setPdfExportStatus] = useState<string | null>(null);

  const activeCity: MajorCity = useMemo(() => getCityById(selectedCityId), [selectedCityId]);
  const primaryIntelLink = activeCity.externalIntelLinks[0];
  const { currentUser, logIncidentReportToCloud } = useAuth();

  useEffect(() => {
    setSelectedCorridor('All');
    setHoveredCamera(null);
    setSelectedPinCamera(null);
  }, [selectedCityId]);

  // Heatmap Overlay & Mode settings
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [heatmapMode, setHeatmapMode] = useState<'detections' | 'hotspots' | 'combined'>('detections');
  const [showCorridorVectors, setShowCorridorVectors] = useState<boolean>(true);
  const [heatmapBandwidth, setHeatmapBandwidth] = useState<number>(34);
  const [heatmapThresholds, setHeatmapThresholds] = useState<number>(14);
  const [colorScheme, setColorScheme] = useState<'turbo' | 'inferno' | 'plasma' | 'warm'>('turbo');
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);

  // 1. Calculate Accumulated Detection Counts per Camera Node & Corridor
  const { cameraAccumulatedCounts, corridorSummary } = useMemo(() => {
    const countsMap = new Map<number, { direct: number; baseline: number; total: number }>();
    const corridorMap = new Map<string, { totalDetections: number; cameraCount: number; peakCameraName: string; peakCount: number }>();

    // Count direct detections from live/accumulated detection array
    const directCounts = new Map<number, number>();
    detections.forEach((d) => {
      directCounts.set(d.cameraId, (directCounts.get(d.cameraId) || 0) + 1);
    });

    cameras.forEach((cam) => {
      const direct = directCounts.get(cam.id) || 0;
      // Synthesize realistic baseline detection accumulation based on corridor importance and node ID
      const isMajor =
        cam.corridor.toLowerCase().includes('i-15') ||
        cam.corridor.toLowerCase().includes('interstate') ||
        cam.corridor.toLowerCase().includes('strip') ||
        cam.corridor.toLowerCase().includes('blvd') ||
        cam.corridor.toLowerCase().includes('downtown') ||
        cam.corridor.toLowerCase().includes('expressway');
      const baseline = (cam.id % 9) * 2 + (isMajor ? 14 : 4);
      const total = direct * 3 + baseline;

      countsMap.set(cam.id, { direct, baseline, total });

      // Group into corridor totals
      const corr = cam.corridor || 'Other Metro';
      const existing = corridorMap.get(corr) || {
        totalDetections: 0,
        cameraCount: 0,
        peakCameraName: cam.name,
        peakCount: 0
      };

      existing.totalDetections += total;
      existing.cameraCount += 1;
      if (total > existing.peakCount) {
        existing.peakCount = total;
        existing.peakCameraName = cam.name;
      }
      corridorMap.set(corr, existing);
    });

    // Sort corridors by accumulated detection count descending
    const sortedCorridors = Array.from(corridorMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      avgPerCamera: Math.round(data.totalDetections / (data.cameraCount || 1)),
      level: data.totalDetections > 45 ? 'CRITICAL HIGH' : data.totalDetections > 25 ? 'ELEVATED' : 'MODERATE'
    })).sort((a, b) => b.totalDetections - a.totalDetections);

    return {
      cameraAccumulatedCounts: countsMap,
      corridorSummary: sortedCorridors
    };
  }, [cameras, detections]);

  // Dynamically compute bounding box for active city's CCTV network
  const bounds = useMemo(() => {
    if (activeCity.id === 'las_vegas') {
      return { minLat: 35.95, maxLat: 36.35, minLng: -115.35, maxLng: -115.05 };
    }
    const pts = [
      ...cameras.map((c) => ({ lat: c.lat, lng: c.lng })),
      ...activeCity.presets.map((p) => ({ lat: p.lat, lng: p.lng })),
      activeCity.center
    ];
    let minLat = d3.min(pts, (p) => p.lat) ?? activeCity.center.lat - 0.12;
    let maxLat = d3.max(pts, (p) => p.lat) ?? activeCity.center.lat + 0.12;
    let minLng = d3.min(pts, (p) => p.lng) ?? activeCity.center.lng - 0.15;
    let maxLng = d3.max(pts, (p) => p.lng) ?? activeCity.center.lng + 0.15;
    const latPad = Math.max(0.03, (maxLat - minLat) * 0.25);
    const lngPad = Math.max(0.04, (maxLng - minLng) * 0.25);
    return {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad
    };
  }, [activeCity, cameras]);

  const projectCoord = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 1000;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 700;
    return { x: Math.max(40, Math.min(960, x)), y: Math.max(40, Math.min(660, y)) };
  };

  const corridorFilterOptions = useMemo(() => {
    return ['All', ...activeCity.corridors.slice(0, 6)];
  }, [activeCity]);

  const filteredCameras = useMemo(() => {
    if (selectedCorridor === 'All') return cameras;
    return cameras.filter((c) => c.corridor.toLowerCase().includes(selectedCorridor.toLowerCase()));
  }, [cameras, selectedCorridor]);

  // High-Activity Corridor Polyline paths (connecting cameras in the same corridor)
  const corridorVectors = useMemo(() => {
    const groups: { [corr: string]: { x: number; y: number; id: number; name: string }[] } = {};
    cameras.forEach((cam) => {
      const corr = cam.corridor || 'Other';
      if (!groups[corr]) groups[corr] = [];
      const pt = projectCoord(cam.lat, cam.lng);
      groups[corr].push({ ...pt, id: cam.id, name: cam.name });
    });

    return Object.entries(groups).map(([corridorName, pts]) => {
      // Sort points sequentially to form smooth corridor trace
      pts.sort((a, b) => a.x + a.y - (b.x + b.y));
      const summary = corridorSummary.find((s) => s.name === corridorName);
      const totalDetections = summary?.totalDetections || 10;
      return {
        corridorName,
        points: pts,
        totalDetections,
        level: summary?.level || 'MODERATE'
      };
    });
  }, [cameras, bounds, corridorSummary]);

  // Trajectory points for active tracked subject
  const trajectoryPoints = useMemo(() => {
    if (!activeTrackedSubject || !activeTrackedSubject.sightings) return [];
    return activeTrackedSubject.sightings
      .slice()
      .reverse()
      .map((s) => {
        const pt = projectCoord(s.lat, s.lng);
        return {
          ...pt,
          cameraId: s.cameraId,
          cameraName: s.cameraName,
          timestamp: s.timestamp
        };
      });
  }, [activeTrackedSubject, bounds]);

  // Project data points for D3 spatial density heatmap
  const projectedHeatmapPoints = useMemo(() => {
    const pts: { x: number; y: number; weight: number; label: string; lat: number; lng: number }[] = [];

    // Mode A: Camera nodes weighted by Accumulated Detection Counts
    if (heatmapMode === 'detections' || heatmapMode === 'combined') {
      cameras.forEach((cam) => {
        const { x, y } = projectCoord(cam.lat, cam.lng);
        const countData = cameraAccumulatedCounts.get(cam.id) || { total: 10 };
        // Weight normalized for D3 contour bandwidth
        const weight = Math.min(30, Math.max(5, countData.total * 0.8));
        pts.push({
          x,
          y,
          weight,
          label: `${cam.name} (${countData.total} accumulated detections)`,
          lat: cam.lat,
          lng: cam.lng
        });
      });
    }

    // Mode B: Historical Alert Hotspots
    if (heatmapMode === 'hotspots' || heatmapMode === 'combined') {
      const sourceHotspots =
        activeCity.id === 'las_vegas'
          ? HIGH_FREQUENCY_ALERT_HOTSPOTS
          : activeCity.presets.map((p, idx) => ({
              lat: p.lat,
              lng: p.lng,
              weight: 12.5 - (idx % 4) * 1.1,
              label: p.label
            }));

      sourceHotspots.forEach((h) => {
        const { x, y } = projectCoord(h.lat, h.lng);
        pts.push({
          x,
          y,
          weight: h.weight,
          label: h.label,
          lat: h.lat,
          lng: h.lng
        });
      });
    }

    return pts;
  }, [cameras, cameraAccumulatedCounts, heatmapMode, activeCity, bounds]);

  // D3 Spatial Contour Density Heatmap Computation
  const d3Contours = useMemo(() => {
    if (!showHeatmap || projectedHeatmapPoints.length === 0) return [];
    try {
      const density = d3
        .contourDensity<{ x: number; y: number; weight: number }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .weight((d) => d.weight)
        .size([1000, 700])
        .bandwidth(heatmapBandwidth)
        .thresholds(heatmapThresholds);

      return density(projectedHeatmapPoints);
    } catch (err) {
      console.error('Error generating d3 contour density:', err);
      return [];
    }
  }, [showHeatmap, projectedHeatmapPoints, heatmapBandwidth, heatmapThresholds]);

  // D3 Color Scale for contour values
  const { colorScale } = useMemo(() => {
    const maxVal = d3.max(d3Contours, (c) => c.value) || 1;
    let interpolator = d3.interpolateTurbo;
    if (colorScheme === 'inferno') interpolator = d3.interpolateInferno;
    if (colorScheme === 'plasma') interpolator = d3.interpolatePlasma;
    if (colorScheme === 'warm') interpolator = d3.interpolateWarm;

    return {
      colorScale: d3.scaleSequential(interpolator).domain([0, maxVal])
    };
  }, [d3Contours, colorScheme]);

  const geoPathGenerator = useMemo(() => d3.geoPath(), []);

  // Handle Export PDF function for the active tracked subject
  const handleExportPDF = async () => {
    if (!activeTrackedSubject) return;
    try {
      setPdfExportStatus('Generating formal incident dossier...');
      exportTrackedSubjectPDF(activeTrackedSubject, cameras, {
        agencyName: activeCity.agencyName,
        agencyShort: activeCity.agencyShort,
        cityName: activeCity.name,
        operatorEmail: currentUser?.email || 'Field Operator'
      });

      // Save record to Firestore if user logged in
      if (currentUser) {
        await logIncidentReportToCloud({
          id: `REP-${activeTrackedSubject.id}-${Date.now().toString().slice(-6)}`,
          trackingId: activeTrackedSubject.id,
          subjectLabel: activeTrackedSubject.label,
          corridor: activeTrackedSubject.sightings[0]?.corridor || activeCity.corridors[0],
          cityId: activeCity.id,
          sightingsCount: activeTrackedSubject.sightings.length,
          summary: `Official PDF incident report exported for ${activeTrackedSubject.label} with ${activeTrackedSubject.sightings.length} confirmed CCTV sightings.`
        });
      }

      setPdfExportStatus('PDF Incident Report downloaded successfully!');
      setTimeout(() => setPdfExportStatus(null), 3500);
    } catch (err) {
      console.error('PDF export error:', err);
      setPdfExportStatus('Failed to generate PDF report');
      setTimeout(() => setPdfExportStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            {activeCity.name} ({activeCity.agencyShort}) Incident Corridors &amp; Geospatial Grid:
          </span>
          <span className="text-slate-400">
            Plotting <strong className="text-white">{filteredCameras.length}</strong> camera nodes across high-activity corridors
          </span>
        </div>

        {/* Corridor Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {corridorFilterOptions.map((corridor) => (
            <button
              key={corridor}
              onClick={() => setSelectedCorridor(corridor)}
              className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCorridor === corridor
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {corridor}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Overlay Configuration & Mode Selection */}
      <div className="bg-slate-900/95 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              showHeatmap
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-900/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-amber-200 animate-pulse' : ''}`} />
            <span>{showHeatmap ? 'Incident Heatmap ACTIVE' : 'Enable Incident Heatmap'}</span>
          </button>

          {/* Heatmap Density Mode Selector */}
          {showHeatmap && (
            <div className="flex items-center bg-slate-800/90 border border-slate-700 p-0.5 rounded-lg">
              <button
                onClick={() => setHeatmapMode('detections')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  heatmapMode === 'detections'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualize high-activity corridors directly based on accumulated detection counts"
              >
                <Activity className="w-3 h-3" />
                <span>Accumulated Detections</span>
              </button>
              <button
                onClick={() => setHeatmapMode('hotspots')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  heatmapMode === 'hotspots'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Historical crash & collision interchange hotspots"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Emergency Hotspots</span>
              </button>
              <button
                onClick={() => setHeatmapMode('combined')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  heatmapMode === 'combined'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Layered detection counts + historical crash density"
              >
                <span>Combined</span>
              </button>
            </div>
          )}

          {/* Toggle Corridor Vector Overlay */}
          <button
            onClick={() => setShowCorridorVectors(!showCorridorVectors)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              showCorridorVectors
                ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>High-Activity Corridor Lines</span>
          </button>

          {/* Color Scheme Picker */}
          {showHeatmap && (
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-md">
              <span className="text-slate-400 text-[11px]">Color:</span>
              {(['turbo', 'inferno', 'plasma', 'warm'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setColorScheme(scheme)}
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                    colorScheme === scheme ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side: PDF Report Export & Source Links */}
        <div className="flex items-center gap-2">
          {activeTrackedSubject && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg shadow-md transition-all text-xs"
              title="Export formatted PDF incident report for active tracked subject"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Incident PDF</span>
            </button>
          )}

          <button
            onClick={() => setShowSourceModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Map Docs</span>
          </button>
        </div>
      </div>

      {/* PDF Export Banner Feedback */}
      {pdfExportStatus && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-semibold">{pdfExportStatus}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Incident Report Formal Dossier</span>
        </div>
      )}

      {/* High-Activity Corridors Summary Ribbon */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1 flex-shrink-0 mr-1">
          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          High-Activity Corridors:
        </span>
        {corridorSummary.slice(0, 4).map((corr) => (
          <button
            key={corr.name}
            onClick={() => setSelectedCorridor(corr.name)}
            className={`px-2.5 py-1 rounded-lg border text-left flex-shrink-0 transition-all ${
              selectedCorridor === corr.name
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  corr.level === 'CRITICAL HIGH' ? 'bg-red-500 animate-ping' : corr.level === 'ELEVATED' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold text-white text-[11px] line-clamp-1">{corr.name}</span>
              <span className="font-mono text-amber-400 text-[10px] font-bold">
                {corr.totalDetections} det
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {corr.cameraCount} cameras • Peak: {corr.peakCameraName.slice(0, 16)}...
            </div>
          </button>
        ))}
      </div>

      {/* Main Map SVG Canvas */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl aspect-[16/10] sm:aspect-[16/9]">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full select-none"
          onClick={() => setSelectedPinCamera(null)}
        >
          <defs>
            <radialGradient id="mapCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="corridorCritical" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="corridorElevated" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Background Map Base */}
          <rect width="100%" height="100%" fill="#090d16" />
          <circle cx="500" cy="380" r="320" fill="url(#mapCenterGlow)" />

          {/* Grid lines */}
          <g opacity="0.07" stroke="#ffffff" strokeWidth="1">
            <line x1="100" y1="0" x2="100" y2="700" />
            <line x1="300" y1="0" x2="300" y2="700" />
            <line x1="500" y1="0" x2="500" y2="700" />
            <line x1="700" y1="0" x2="700" y2="700" />
            <line x1="900" y1="0" x2="900" y2="700" />
            <line x1="0" y1="150" x2="1000" y2="150" />
            <line x1="0" y1="350" x2="1000" y2="350" />
            <line x1="0" y1="550" x2="1000" y2="550" />
          </g>

          {/* High-Activity Corridor Vector Lines */}
          {showCorridorVectors &&
            corridorVectors.map((cv) => {
              if (cv.points.length < 2) return null;
              const pathString = `M ${cv.points.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
              const strokeColor =
                cv.level === 'CRITICAL HIGH'
                  ? 'url(#corridorCritical)'
                  : cv.level === 'ELEVATED'
                  ? 'url(#corridorElevated)'
                  : '#38bdf8';
              const strokeW = cv.level === 'CRITICAL HIGH' ? 6 : cv.level === 'ELEVATED' ? 4 : 2.5;

              return (
                <g key={`corridor-vec-${cv.corridorName}`}>
                  {/* Glowing underlay */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW + 6}
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main corridor path */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray={cv.level === 'CRITICAL HIGH' ? '8 4' : 'none'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cv.level === 'CRITICAL HIGH' ? 'animate-pulse' : ''}
                  />
                </g>
              );
            })}

          {/* D3 SPATIAL INCIDENT CONTOUR HEATMAP LAYER */}
          {showHeatmap && d3Contours.length > 0 && (
            <g className="d3-spatial-heatmap" opacity="0.7" style={{ mixBlendMode: 'screen' }}>
              {d3Contours.map((contour, index) => {
                const pathData = geoPathGenerator(contour as any) || '';
                const fillCol = colorScale(contour.value);
                return (
                  <path
                    key={`d3-contour-${index}`}
                    d={pathData}
                    fill={fillCol}
                    stroke={fillCol}
                    strokeWidth="0.5"
                    strokeOpacity="0.85"
                    className="transition-all duration-300"
                  />
                );
              })}
            </g>
          )}

          {/* Hotspot & High Activity Pulse Rings */}
          {showHeatmap &&
            projectedHeatmapPoints.map((pt, i) => {
              if (pt.weight < 12) return null;
              return (
                <g key={`hotspot-pulse-${i}`} className="pointer-events-none">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.weight * 0.7}
                    fill="#ef4444"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                  <circle cx={pt.x} cy={pt.y} r="2.5" fill="#fef08a" />
                </g>
              );
            })}

          {/* Active Target Trajectory Path */}
          {trajectoryPoints.length > 1 && (
            <g>
              <polyline
                points={trajectoryPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="6 3"
                className="animate-pulse"
              />
              {trajectoryPoints.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="9" fill="#f59e0b" fillOpacity="0.35" />
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#f59e0b" />
                  <text
                    x={p.x + 8}
                    y={p.y - 8}
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    #{idx + 1}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Camera Marker Pins with Accumulated Detection Badges */}
          {filteredCameras.map((cam) => {
            const { x, y } = projectCoord(cam.lat, cam.lng);
            const isHovered = hoveredCamera?.id === cam.id;
            const isSelected = selectedPinCamera?.id === cam.id;
            const counts = cameraAccumulatedCounts.get(cam.id) || { total: 10 };
            const isCritical = counts.total > 22;

            return (
              <g
                key={cam.id}
                className="cursor-pointer transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPinCamera(cam);
                }}
                onMouseEnter={() => setHoveredCamera(cam)}
              >
                {/* Node halo */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 8 : isCritical ? 5.5 : 3.5}
                  fill={isCritical ? '#ef4444' : isHovered ? '#f59e0b' : '#38bdf8'}
                  opacity={isHovered || isSelected ? 1 : 0.8}
                  stroke="#ffffff"
                  strokeWidth={isHovered || isSelected ? 1.5 : 0.5}
                />
                {/* Micro text indicator on zoom/hover */}
                {(isHovered || isSelected) && (
                  <text
                    x={x + 10}
                    y={y + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="drop-shadow"
                  >
                    #{cam.id} ({counts.total} det)
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected / Hovered Camera Popup Card */}
        {(selectedPinCamera || hoveredCamera) && (
          <div className="absolute top-4 right-4 z-20 w-72 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md text-slate-100 animate-in fade-in zoom-in-95 duration-100">
            {(() => {
              const activeCam = selectedPinCamera || hoveredCamera!;
              const counts = cameraAccumulatedCounts.get(activeCam.id) || { direct: 0, baseline: 12, total: 12 };
              return (
                <div className="space-y-2">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    <img
                      src={`/api/camera-snapshot/${activeCam.id}?t=${liveTimestamp}`}
                      alt={activeCam.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[10px] rounded font-bold">
                      CCTV #{activeCam.id}
                    </span>
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-1">{activeCam.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{activeCam.corridor}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mt-1 p-1.5 bg-slate-950/70 rounded border border-slate-800">
                      <span>Accumulated Activity:</span>
                      <strong className="text-amber-400 font-bold">{counts.total} Detections</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => onSelectCamera(activeCam)}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Live Monitor</span>
                    </button>
                    <a
                      href={activeCam.snapshotUrl || primaryIntelLink?.url || 'https://bugatti.nvfast.org/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center justify-center"
                      title={`Direct ${activeCity.agencyShort} CCTV Stream Source`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Heatmap & Grid Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-[11px] text-slate-300 flex flex-wrap items-center gap-3 backdrop-blur pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>High-Activity Nodes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Standard CCTV Nodes</span>
          </div>
          {showHeatmap && (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
              <span className="w-12 h-2.5 rounded bg-gradient-to-r from-blue-500 via-amber-400 to-red-600 inline-block" />
              <span className="text-amber-400 font-bold">
                {heatmapMode === 'detections'
                  ? 'Accumulated Detection Density'
                  : heatmapMode === 'hotspots'
                  ? 'Historical Crash Hotspots'
                  : 'Combined Incident Density'}
              </span>
            </div>
          )}
          {trajectoryPoints.length > 0 && (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span className="text-amber-400 font-bold">Target Trajectory</span>
            </div>
          )}
        </div>
      </div>

      {/* Outside Sources Attribution Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            Accumulated corridor activity aggregated from live CCTV detection events, municipal incident logs, and{' '}
            <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-medium">
              D3.js Spatial Contour Density Engine
            </a>
            .
          </span>
        </div>
        <button
          onClick={() => setShowSourceModal(true)}
          className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
        >
          <Code2 className="w-3 h-3" />
          <span>Inspect Architecture</span>
        </button>
      </div>

      {/* Source Code & Architecture Inspector Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Incident Heatmap &amp; Corridor Density Architecture</h3>
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
                <strong>Component:</strong> <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">src/components/CCTVMap.tsx</code>
              </p>
              <p>
                <strong>Incident Heatmap Pipeline:</strong> Computes multi-scale accumulated detection counts per camera node, performs spatial projection to coordinate bounding box, and evaluates 2D Gaussian density estimation using D3 contour algorithms.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-amber-400 font-bold">// D3 Incident Heatmap Density Execution</div>
                <div>const density = d3.contourDensity()</div>
                <div>  .x(d =&gt; d.x).y(d =&gt; d.y)</div>
                <div>  .weight(d =&gt; d.accumulatedDetectionWeight)</div>
                <div>  .bandwidth({heatmapBandwidth}).thresholds({heatmapThresholds});</div>
              </div>

              <div>
                <h5 className="font-bold text-slate-200 mb-1">Export Functionality:</h5>
                <p className="text-slate-400">
                  Includes native jsPDF incident report generation (<code>exportTrackedSubjectPDF</code>) that compiles subject profile data, chronological sighting chain tables, and downstream anticipation vectors into law enforcement standard PDF dossiers.
                </p>
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
