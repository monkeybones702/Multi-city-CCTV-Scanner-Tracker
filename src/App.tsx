/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTabType } from './components/Header';
import { LiveMonitor } from './components/LiveMonitor';
import { PTZMovementScanner } from './components/PTZMovementScanner';
import { CrimeRadarIntelligence } from './components/CrimeRadarIntelligence';
import { CommunityResponseSystem } from './components/CommunityResponseSystem';
import { AIScannerSearch } from './components/AIScannerSearch';
import { TrajectoryTracker } from './components/TrajectoryTracker';
import { CCTVMap } from './components/CCTVMap';
import { CameraDetailModal } from './components/CameraDetailModal';
import { PerpetratorHistoricalScanner } from './components/PerpetratorHistoricalScanner';
import { ClosestTrafficLPRTracker } from './components/ClosestTrafficLPRTracker';
import { MAJOR_CITIES, type MajorCity } from './data/majorCities';
import type { Camera, Detection, TrackedSubject } from './types';
import { Sparkles, Shield, AlertCircle, CheckCircle2, Code2, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('monitor');
  const [selectedCityId, setSelectedCityId] = useState<string>('las_vegas');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [trackedSubjects, setTrackedSubjects] = useState<TrackedSubject[]>([]);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>('TRK-RED-SUV-01');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [preselectedPostCamera, setPreselectedPostCamera] = useState<Camera | null>(null);
  const [movingCamerasCount, setMovingCamerasCount] = useState<number>(5);
  const [postsCount, setPostsCount] = useState<number>(3);
  const [correlationCount, setCorrelationCount] = useState<number>(4);
  const [refreshRate, setRefreshRate] = useState<number>(2500);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [liveTimestamp, setLiveTimestamp] = useState<number>(Date.now());
  const [isScanningCorridor, setIsScanningCorridor] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectCity = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    const city = MAJOR_CITIES.find((c) => c.id === cityId);
    if (city) {
      showToast(`Surveillance network shifted to ${city.name} (${city.agencyShort})`);
    }
    fetch(`/api/cameras?city=${cityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.cameras) {
          setCameras(data.cameras);
          if (data.cameras.length > 0) {
            setSelectedCamera(data.cameras[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load cameras for city:', err));
  }, []);

  // 1. Load initial cameras list
  useEffect(() => {
    fetch(`/api/cameras?city=${selectedCityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.cameras) {
          setCameras(data.cameras);
          if (data.cameras.length > 0) {
            setSelectedCamera(data.cameras[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load cameras:', err))
      .finally(() => setIsLoadingInitial(false));
  }, [selectedCityId]);

  // Check PTZ and community post counts for header badges (filtered by active city CCTV network)
  useEffect(() => {
    const fetchCounters = () => {
      fetch(`/api/ptz/status?city=${selectedCityId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.totalActiveMoving === 'number') {
            setMovingCamerasCount(data.totalActiveMoving);
          }
        })
        .catch(() => {});

      fetch('/api/posts')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.total === 'number') {
            setPostsCount(data.total);
          }
        })
        .catch(() => {});

      fetch('/api/correlation/events')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.total === 'number') {
            setCorrelationCount(data.total);
          }
        })
        .catch(() => {});
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 8000);
    return () => clearInterval(interval);
  }, [selectedCityId]);

  // 2. Load detections
  const loadDetections = useCallback(() => {
    fetch('/api/detections')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.detections) {
          setDetections(data.detections);
        }
      })
      .catch((err) => console.error('Failed to load detections:', err));
  }, []);

  useEffect(() => {
    loadDetections();
  }, [loadDetections]);

  // 3. Load tracked subjects
  const loadTrackedSubjects = useCallback(() => {
    fetch('/api/track/list')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.tracked) {
          setTrackedSubjects(data.tracked);
          if (data.tracked.length > 0 && !activeTrackingId) {
            setActiveTrackingId(data.tracked[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load tracked subjects:', err));
  }, [activeTrackingId]);

  useEffect(() => {
    loadTrackedSubjects();
  }, [loadTrackedSubjects]);

  // 4. Live frame refresh timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setLiveTimestamp(Date.now());
    }, refreshRate);
    return () => clearInterval(interval);
  }, [isPaused, refreshRate]);

  // Handler: Run scan on a specific camera
  const handleRunScan = async (cameraId: number): Promise<Detection[]> => {
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraId })
      });
      const data = await res.json();
      if (data && data.detections) {
        setDetections((prev) => [...data.detections, ...prev]);
        showToast(`AI Scan detected ${data.detections.length} objects at CCTV #${cameraId}`);
        return data.detections;
      }
      return [];
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast('Vision scan failed to reach node');
      return [];
    }
  };

  // Handler: Corridor multi-camera scan trigger (uses active city's CCTV network cameras)
  const handleQuickScanCorridor = async () => {
    const activeCity = MAJOR_CITIES.find((c) => c.id === selectedCityId) || MAJOR_CITIES[0];
    setIsScanningCorridor(true);
    showToast(`Initiating AI Vision Scan across ${activeCity.name} (${activeCity.agencyShort}) CCTV cameras...`);
    try {
      const targetIds = cameras.slice(0, 3).map((c) => c.id);
      for (const id of targetIds) {
        await handleRunScan(id);
      }
      showToast(`${activeCity.agencyShort} corridor visual analysis complete. New detections indexed.`);
    } finally {
      setIsScanningCorridor(false);
    }
  };

  // Handler: Track subject
  const handleTrackSubject = async (detection: Detection) => {
    try {
      const res = await fetch('/api/track/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectionId: detection.id,
          customLabel: `${detection.color.toUpperCase()} ${detection.subtype.toUpperCase()} (${detection.direction || 'SB'})`
        })
      });
      const data = await res.json();
      if (data && data.trackedSubject) {
        setTrackedSubjects((prev) => [data.trackedSubject, ...prev]);
        setActiveTrackingId(data.trackedSubject.id);
        setActiveTab('tracker');
        showToast(`Now tracking ${data.trackedSubject.label} live across corridor`);
      }
    } catch (err) {
      console.error('Track error:', err);
      showToast('Failed to initialize tracking sequence');
    }
  };

  // Handler: Sighting confirmation at downstream camera
  const handleConfirmSighting = async (trackingId: string, cameraId: number) => {
    const cam = cameras.find((c) => c.id === cameraId);
    if (!cam) return;

    // Scan or log sighting
    const newDet: Detection = {
      id: `det-${cameraId}-${Date.now()}`,
      cameraId: cam.id,
      cameraName: cam.name,
      corridor: cam.corridor,
      lat: cam.lat,
      lng: cam.lng,
      timestamp: new Date().toISOString(),
      category: 'vehicle',
      subtype: 'target',
      color: 'tracked',
      height: 'standard',
      size: 'standard',
      isCyclist: false,
      confidence: 0.95,
      tags: ['trajectory_confirmed', cam.corridor.toLowerCase().replace(/[^a-z0-9]/g, '_')],
      description: `Target sighted downstream passing ${cam.name}`,
      box: { ymin: 420, xmin: 350, ymax: 580, xmax: 480 },
      snapshotUrl: `/api/camera-snapshot/${cam.id}?t=${Date.now()}`
    };

    setTrackedSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id === trackingId) {
          return {
            ...subj,
            lastSeen: newDet.timestamp,
            lastCameraId: cam.id,
            lastCameraName: cam.name,
            sightings: [newDet, ...subj.sightings]
          };
        }
        return subj;
      })
    );
    showToast(`Target sighted downstream at CCTV #${cam.id} (${cam.name})!`);
  };

  const handleOpenSelectedCameraById = (cameraId: number) => {
    const cam = cameras.find((c) => c.id === cameraId);
    if (cam) {
      setSelectedCamera(cam);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        refreshRate={refreshRate}
        setRefreshRate={setRefreshRate}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        lastRefreshTime={new Date(liveTimestamp)}
        trackedCount={trackedSubjects.length}
        movingCount={movingCamerasCount}
        postsCount={postsCount}
        correlationCount={correlationCount}
        onQuickScanCorridor={handleQuickScanCorridor}
        isScanningCorridor={isScanningCorridor}
        selectedCityId={selectedCityId}
        onSelectCity={handleSelectCity}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {isLoadingInitial ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">
              Connecting to {MAJOR_CITIES.find((c) => c.id === selectedCityId)?.name || 'Metro'} DOT Traffic Network...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Synchronizing active metropolitan traffic camera nodes &amp; corridors
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'monitor' && (
              <LiveMonitor
                cameras={cameras}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                onRunScan={handleRunScan}
                onTrackSubject={handleTrackSubject}
                detections={detections}
                liveTimestamp={liveTimestamp}
                selectedCityId={selectedCityId}
                onSelectCity={handleSelectCity}
              />
            )}

            {activeTab === 'traffic' && (
              <ClosestTrafficLPRTracker
                cameras={cameras}
                selectedCamera={selectedCamera}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                liveTimestamp={liveTimestamp}
                selectedCityId={selectedCityId}
                onSelectCity={handleSelectCity}
              />
            )}

            {activeTab === 'pursuit' && (
              <PerpetratorHistoricalScanner
                cameras={cameras}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                liveTimestamp={liveTimestamp}
                selectedCityId={selectedCityId}
              />
            )}

            {activeTab === 'ptz' && (
              <PTZMovementScanner
                cameras={cameras}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                onOpenCommunityPostModal={(cam) => {
                  setPreselectedPostCamera(cam || null);
                  setActiveTab('community');
                }}
                liveTimestamp={liveTimestamp}
                selectedCityId={selectedCityId}
              />
            )}

            {activeTab === 'radar' && (
              <CrimeRadarIntelligence
                cameras={cameras}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                liveTimestamp={liveTimestamp}
              />
            )}

            {activeTab === 'community' && (
              <CommunityResponseSystem
                cameras={cameras}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                preselectedCamera={preselectedPostCamera}
                onClosePreselected={() => setPreselectedPostCamera(null)}
              />
            )}

            {activeTab === 'search' && (
              <AIScannerSearch
                detections={detections}
                onTrackSubject={handleTrackSubject}
                onOpenCamera={handleOpenSelectedCameraById}
                onTriggerCorridorScan={handleQuickScanCorridor}
                isScanning={isScanningCorridor}
              />
            )}

            {activeTab === 'tracker' && (
              <TrajectoryTracker
                trackedSubjects={trackedSubjects}
                activeTrackingId={activeTrackingId}
                onSelectTrackedSubject={(id) => setActiveTrackingId(id)}
                cameras={cameras}
                onOpenCamera={handleOpenSelectedCameraById}
                onConfirmSightingAtCamera={handleConfirmSighting}
                liveTimestamp={liveTimestamp}
              />
            )}

            {activeTab === 'map' && (
              <CCTVMap
                cameras={cameras}
                detections={detections}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
                activeTrackedSubject={trackedSubjects.find((s) => s.id === activeTrackingId)}
                liveTimestamp={liveTimestamp}
                selectedCityId={selectedCityId}
                onSelectCity={handleSelectCity}
              />
            )}
          </>
        )}
      </main>

      {/* Global Intelligence Sources & Page Generation Links Footer (Dynamically Switched per City CCTV Network) */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-3 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {(() => {
            const activeCity = MAJOR_CITIES.find((c) => c.id === selectedCityId) || MAJOR_CITIES[0];
            return (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-slate-300 font-semibold">
                  {activeCity.name} ({activeCity.agencyShort}) CCTV &amp; Intel Feeds:
                </span>
                {activeCity.externalIntelLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1"
                    title={link.description}
                  >
                    <span>{link.name} ({link.agency})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
                <a
                  href="https://www.broadcastify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <span>Broadcastify {activeCity.state} Dispatch</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })()}

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Current View: {activeTab.toUpperCase()}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" />
              <span>Generated from: src/App.tsx &amp; src/components/{activeTab === 'traffic' ? 'ClosestTrafficLPRTracker.tsx' : activeTab === 'pursuit' ? 'PerpetratorHistoricalScanner.tsx' : activeTab === 'map' ? 'CCTVMap.tsx' : 'LiveMonitor.tsx'}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Camera Full View & Snapshot History Modal */}
      {selectedCamera && (
        <CameraDetailModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
          onTrackSubject={handleTrackSubject}
          onRunScan={handleRunScan}
          onOpenCommunityPostModal={(cam) => {
            setPreselectedPostCamera(cam);
            setSelectedCamera(null);
            setActiveTab('community');
          }}
          onOpenTrafficLPR={(cam) => {
            setSelectedCamera(cam);
            setActiveTab('traffic');
          }}
          initialDetections={detections.filter((d) => d.cameraId === selectedCamera.id)}
          historyTimestamp={liveTimestamp}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-amber-500/80 text-amber-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
