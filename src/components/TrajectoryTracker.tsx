import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  Camera,
  ArrowRight,
  Eye,
  Play,
  Pause,
  MapPin,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Shield,
  FileDown,
  FileText,
  CloudCheck,
  AlertCircle
} from 'lucide-react';
import type { TrackedSubject, Camera as CameraType, Detection } from '../types';
import { exportTrackedSubjectPDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';

interface TrajectoryTrackerProps {
  trackedSubjects: TrackedSubject[];
  activeTrackingId: string | null;
  onSelectTrackedSubject: (id: string) => void;
  cameras: CameraType[];
  onOpenCamera: (cameraId: number) => void;
  onConfirmSightingAtCamera: (trackingId: string, cameraId: number) => void;
  liveTimestamp: number;
}

export const TrajectoryTracker: React.FC<TrajectoryTrackerProps> = ({
  trackedSubjects,
  activeTrackingId,
  onSelectTrackedSubject,
  cameras,
  onOpenCamera,
  onConfirmSightingAtCamera,
  liveTimestamp
}) => {
  const currentSubject =
    trackedSubjects.find((s) => s.id === activeTrackingId) || trackedSubjects[0];

  const cameraMap = new Map<number, CameraType>();
  cameras.forEach((c) => cameraMap.set(c.id, c));

  const { currentUser, logIncidentReportToCloud, saveTrackedSubjectToCloud } = useAuth();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportPDF = async () => {
    if (!currentSubject) return;
    try {
      setIsExporting(true);
      setExportNotice('Formatting incident documentation dossier...');

      exportTrackedSubjectPDF(currentSubject, cameras, {
        operatorEmail: currentUser?.email || 'Authorized Operator'
      });

      if (currentUser) {
        await logIncidentReportToCloud({
          id: `REP-${currentSubject.id}-${Date.now().toString().slice(-6)}`,
          trackingId: currentSubject.id,
          subjectLabel: currentSubject.label,
          corridor: currentSubject.sightings[0]?.corridor || 'Metropolitan Grid',
          cityId: 'active_metro',
          sightingsCount: currentSubject.sightings.length,
          summary: `Official PDF incident report generated for ${currentSubject.label} with ${currentSubject.sightings.length} confirmed CCTV sightings.`
        });
        await saveTrackedSubjectToCloud(currentSubject);
      }

      setExportNotice('Incident Report PDF downloaded & logged!');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportNotice('Export failed. Please retry.');
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  if (trackedSubjects.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 max-w-xl mx-auto my-6">
        <Navigation className="w-12 h-12 mx-auto text-amber-500 mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-100">No Target Active in Live Tracker</h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Select any vehicle, person, or cyclist from the <strong>Attribute Scanner &amp; Search</strong> or click <strong>Track</strong> on a live camera feed to follow them live across CCTV corridors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Target Selector Bar & PDF Quick Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            Tracked Targets:
          </span>
          {trackedSubjects.map((subject) => {
            const isSelected = subject.id === currentSubject?.id;
            return (
              <button
                key={subject.id}
                onClick={() => onSelectTrackedSubject(subject.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    subject.isFollowingLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span>{subject.label}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({subject.sightings.length} sights)
                </span>
              </button>
            );
          })}
        </div>

        {/* PDF Export Action Button */}
        {currentSubject && (
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg text-xs shadow-md transition-all disabled:opacity-50"
            title="Export full subject specifications and sighting history to a formatted PDF incident report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting PDF...' : 'Export Incident PDF Report'}</span>
          </button>
        )}
      </div>

      {/* Export Notice Notification Banner */}
      {exportNotice && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentSubject ? `Case ID: CAD-INC-${currentSubject.id}` : ''}
          </span>
        </div>
      )}

      {currentSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Target Profile & Real-Time Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ACTIVE SURVEILLANCE
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TRAJECTORY
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-2">
                {currentSubject.label}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {currentSubject.description}
              </p>

              {/* Target Attributes Summary */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">Category</span>
                  <span className="font-semibold text-slate-200 capitalize">{currentSubject.category}</span>
                </div>
                <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">Color</span>
                  <span className="font-semibold text-slate-200 capitalize">{currentSubject.color}</span>
                </div>
                <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">Profile Height</span>
                  <span className="font-semibold text-slate-200 capitalize">{currentSubject.height}</span>
                </div>
                <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">Size</span>
                  <span className="font-semibold text-slate-200 capitalize">{currentSubject.size}</span>
                </div>
              </div>

              {/* Last Sighting Info */}
              <div className="mt-4 p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Last Confirmed Sighting:</span>
                  <span className="font-mono text-white">
                    {new Date(currentSubject.lastSeen).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 truncate">
                  <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>CCTV #{currentSubject.lastCameraId} - {currentSubject.lastCameraName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenCamera(currentSubject.lastCameraId)}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Watch Live Feed at Last Sighting</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4 text-rose-400" />
                <span>Export Formatted PDF Dossier</span>
              </button>
            </div>
          </div>

          {/* Sighting Timeline with Snapshot Thumbnails */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Sighting History &amp; Camera Chain</span>
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {currentSubject.sightings.length} sequential sightings
                </span>
                <button
                  onClick={handleExportPDF}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1"
                >
                  <FileDown className="w-3 h-3" />
                  <span>PDF Export</span>
                </button>
              </div>
            </div>

            {/* Step-by-step camera timeline */}
            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {currentSubject.sightings.map((sighting, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={sighting.id || idx} className="relative flex items-start gap-4">
                    {/* Step marker */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 border ${
                        isLatest
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      #{currentSubject.sightings.length - idx}
                    </div>

                    {/* Sighting Card */}
                    <div className="flex-1 bg-slate-800/70 border border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Thumbnail */}
                      <div
                        onClick={() => onOpenCamera(sighting.cameraId)}
                        className="w-full sm:w-28 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer group"
                      >
                        <img
                          src={sighting.snapshotUrl}
                          alt={sighting.cameraName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-[9px] font-mono text-white rounded">
                          CCTV #{sighting.cameraId}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                            {sighting.cameraName}
                          </h5>
                          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                            {new Date(sighting.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                          {sighting.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {sighting.corridor}
                          </span>
                          <span>
                            Direction: <strong className="text-amber-400">{sighting.direction || 'SB'}</strong>
                          </span>
                          {sighting.speedEstimateMph && (
                            <span>
                              Est: <strong className="text-slate-200">~{sighting.speedEstimateMph} mph</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCamera(sighting.cameraId)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors flex-shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Downstream Predicted Cameras (Follow Live Next Step) */}
            {currentSubject.predictedNextCameraIds && currentSubject.predictedNextCameraIds.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Predicted Downstream Cameras (Anticipated Path)
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Live corridor monitors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentSubject.predictedNextCameraIds.map((nextId) => {
                    const cam = cameraMap.get(nextId);
                    if (!cam) return null;
                    return (
                      <div
                        key={nextId}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between gap-2 hover:border-amber-500/50 transition-colors"
                      >
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={`/api/camera-snapshot/${cam.id}?t=${liveTimestamp}`}
                            alt={cam.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/80 text-white font-mono text-[9px] rounded">
                            #{cam.id}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {cam.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{cam.corridor}</div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => onOpenCamera(cam.id)}
                            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium text-center transition-colors"
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => onConfirmSightingAtCamera(currentSubject.id, cam.id)}
                            title="Confirm target reached this camera"
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sighted</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
