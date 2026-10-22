import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Camera as CameraIcon,
  Car,
  ShieldAlert,
  Navigation,
  Compass,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Gauge,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Code2,
  MapPin,
  Sparkles,
  PlusCircle,
  X,
  ChevronRight,
  Sliders,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Star,
  Bookmark,
  BookmarkCheck,
  Tag,
  AlertOctagon,
  Download,
  Trash2,
  Edit3,
  Crosshair,
  UserCheck,
  Info,
  Building2
} from 'lucide-react';
import { MAJOR_CITIES, type MajorCity, getCityById, findClosestMajorCity } from '../data/majorCities';
import type {
  Camera,
  IntersectionTrafficRecord,
  ClosestCameraTrafficSummary,
  ClosestCameraNode,
  BoloEntry,
  BookmarkedVehicle,
  UserRadiusTrafficSummary,
  UserLocationState,
  BookmarkCategoryTag,
  BookmarkPriority
} from '../types';

interface ClosestTrafficLPRTrackerProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  liveTimestamp: number;
  selectedCityId?: string;
  onSelectCity?: (cityId: string) => void;
}

export const ClosestTrafficLPRTracker: React.FC<ClosestTrafficLPRTrackerProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  liveTimestamp,
  selectedCityId,
  onSelectCity
}) => {
  // Operational View Mode
  // 'user_radius' (0.5 radius logging around user), 'intersection' (focal camera radius), 'bookmarks' (intel vault)
  const [activeTrackerTab, setActiveTrackerTab] = useState<'user_radius' | 'intersection' | 'bookmarks'>('user_radius');

  // Multi-City Management
  const [internalCityId, setInternalCityId] = useState<string>('las_vegas');
  const activeCityId = selectedCityId || internalCityId;
  const currentCity: MajorCity = useMemo(() => getCityById(activeCityId), [activeCityId]);
  const [bookmarkCityFilter, setBookmarkCityFilter] = useState<string>('all');
  const [bmCityId, setBmCityId] = useState<string>(activeCityId);

  // ----------------------------------------------------
  // 1. User Location & 0.5 Radius Logging State
  // ----------------------------------------------------
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    lat: 36.1126,
    lng: -115.1767,
    label: 'Las Vegas Blvd & Flamingo Rd (Bellagio / Horseshoe)',
    source: 'preset',
    cityId: 'las_vegas',
    cityName: 'Las Vegas'
  });
  // Default to 805 meters (0.5 miles)
  const [radiusMeters, setRadiusMeters] = useState<number>(805);
  const [radiusUnit, setRadiusUnit] = useState<'miles' | 'km'>('miles');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string>('');
  const [userRadiusSummary, setUserRadiusSummary] = useState<UserRadiusTrafficSummary | null>(null);

  // Switch City Handler
  const handleSwitchCity = useCallback((cityId: string) => {
    if (onSelectCity) {
      onSelectCity(cityId);
    } else {
      setInternalCityId(cityId);
    }
    const targetCity = getCityById(cityId);
    const p = targetCity.presets[0];
    if (p) {
      setUserLocation({
        lat: p.lat,
        lng: p.lng,
        label: p.label,
        source: 'preset',
        cityId: targetCity.id,
        cityName: targetCity.name
      });
    }
    if (targetCity.cameras[0]) {
      setFocalCamId(targetCity.cameras[0].id);
    }
    setBmState(targetCity.state);
    setNewBoloState(targetCity.state);
    setBmCityId(targetCity.id);
  }, [onSelectCity]);

  // Sync external city changes
  useEffect(() => {
    if (selectedCityId && selectedCityId !== userLocation.cityId) {
      const targetCity = getCityById(selectedCityId);
      const p = targetCity.presets[0];
      if (p) {
        setUserLocation({
          lat: p.lat,
          lng: p.lng,
          label: p.label,
          source: 'preset',
          cityId: targetCity.id,
          cityName: targetCity.name
        });
      }
      if (targetCity.cameras[0]) {
        setFocalCamId(targetCity.cameras[0].id);
      }
      setBmState(targetCity.state);
      setNewBoloState(targetCity.state);
      setBmCityId(targetCity.id);
    }
  }, [selectedCityId]);

  // ----------------------------------------------------
  // 2. Focal Camera / Intersection Mode State
  // ----------------------------------------------------
  const defaultFocalId = selectedCamera?.id || 21603;
  const [focalCamId, setFocalCamId] = useState<number>(defaultFocalId);
  const [intersectionRadiusMeters, setIntersectionRadiusMeters] = useState<number>(2500);
  const [intersectionSummary, setIntersectionSummary] = useState<ClosestCameraTrafficSummary | null>(null);

  // ----------------------------------------------------
  // 3. Bookmarking & Info Management State
  // ----------------------------------------------------
  const [bookmarkedVehicles, setBookmarkedVehicles] = useState<BookmarkedVehicle[]>([]);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState<boolean>(false);
  const [editingBookmarkTarget, setEditingBookmarkTarget] = useState<IntersectionTrafficRecord | BookmarkedVehicle | null>(null);

  // Bookmark Form Fields
  const [bmPlate, setBmPlate] = useState<string>('');
  const [bmState, setBmState] = useState<string>('NV');
  const [bmMake, setBmMake] = useState<string>('');
  const [bmModel, setBmModel] = useState<string>('');
  const [bmYear, setBmYear] = useState<string>('2023');
  const [bmColor, setBmColor] = useState<string>('');
  const [bmBodySubtype, setBmBodySubtype] = useState<string>('sedan');
  const [bmCategoryTag, setBmCategoryTag] = useState<BookmarkCategoryTag>('Suspicious Vehicle');
  const [bmPriority, setBmPriority] = useState<BookmarkPriority>('high');
  const [bmCaseNumber, setBmCaseNumber] = useState<string>('');
  const [bmNotes, setBmNotes] = useState<string>('');
  const [bmDriverDesc, setBmDriverDesc] = useState<string>('');
  const [bmBehaviors, setBmBehaviors] = useState<string[]>([]);
  const [bmAlertOnDetection, setBmAlertOnDetection] = useState<boolean>(true);
  const [isSavingBookmark, setIsSavingBookmark] = useState<boolean>(false);
  const [bookmarkSuccessMsg, setBookmarkSuccessMsg] = useState<string>('');

  // ----------------------------------------------------
  // 4. Filters, Search & Inspect State
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'NB' | 'SB' | 'EB' | 'WB'>('ALL');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [boloOnly, setBoloOnly] = useState<boolean>(false);
  const [speedingOnly, setSpeedingOnly] = useState<boolean>(false);

  // BOLO Hotlist
  const [boloHotlist, setBoloHotlist] = useState<BoloEntry[]>([]);
  const [isBoloModalOpen, setIsBoloModalOpen] = useState<boolean>(false);
  const [newBoloPlate, setNewBoloPlate] = useState<string>('');
  const [newBoloState, setNewBoloState] = useState<string>('NV');
  const [newBoloMakeModel, setNewBoloMakeModel] = useState<string>('');
  const [newBoloColor, setNewBoloColor] = useState<string>('');
  const [newBoloReason, setNewBoloReason] = useState<string>('');
  const [newBoloSeverity, setNewBoloSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [newBoloNotes, setNewBoloNotes] = useState<string>('');
  const [isSubmittingBolo, setIsSubmittingBolo] = useState<boolean>(false);

  // Inspect Modal
  const [inspectedRecord, setInspectedRecord] = useState<IntersectionTrafficRecord | null>(null);
  const [copiedPlate, setCopiedPlate] = useState<boolean>(false);

  // Source Code Modal
  const [isSourceCodeModalOpen, setIsSourceCodeModalOpen] = useState<boolean>(false);

  // Polling & Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeLoggingEnabled, setActiveLoggingEnabled] = useState<boolean>(true);

  // Available Category Tags & Behavior Presets
  const categoryTags: BookmarkCategoryTag[] = [
    'Suspicious Vehicle',
    'Person of Interest',
    'Witness / Transit',
    'Resident / Neighbor',
    'Commercial / Delivery',
    'Fleet Vehicle',
    'VIP / Transport',
    'Speeding / Violator',
    'Custom Tracked'
  ];

  const behaviorPresets = [
    'Excessive Speed (+15mph)',
    'Rapid Lane Weaving',
    'Failed to Signal',
    'Loitering / Cruising (<15mph)',
    'Multiple Passes in Radius',
    'Damaged Front/Rear Fascia',
    'Privacy Tint Violation',
    'Out-of-State Plates',
    'Suspicious Valet / Loading Dock Stop'
  ];

  // Las Vegas User Location Presets
  const userLocationPresets = [
    { label: 'The Strip (Bellagio & Flamingo)', lat: 36.1126, lng: -115.1767 },
    { label: 'Downtown Fremont St Experience', lat: 36.1699, lng: -115.1438 },
    { label: 'Paradise / UNLV Campus', lat: 36.1070, lng: -115.1430 },
    { label: 'I-15 & Tropicana Corridor', lat: 36.1005, lng: -115.1780 },
    { label: 'Spring Mountain / Chinatown', lat: 36.1265, lng: -115.1900 },
    { label: 'Summerlin / Red Rock Gateway', lat: 36.1700, lng: -115.3000 }
  ];

  // ----------------------------------------------------
  // API Fetch Functions
  // ----------------------------------------------------

  // Fetch Bookmarked Vehicles
  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch('/api/traffic/bookmarks');
      const data = await res.json();
      if (data && data.bookmarks) {
        setBookmarkedVehicles(data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to load bookmarked vehicles:', err);
    }
  }, []);

  // Fetch User 0.5 Radius Traffic Log
  const fetchUserRadiusTraffic = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({
        userLat: userLocation.lat.toString(),
        userLng: userLocation.lng.toString(),
        userLabel: userLocation.label,
        radiusMeters: radiusMeters.toString(),
        radiusUnit: radiusUnit,
        source: userLocation.source,
        cityId: currentCity.id
      });

      const res = await fetch(`/api/traffic/user-radius-log?${params.toString()}`);
      const data = await res.json();
      if (data && data.summary) {
        setUserRadiusSummary(data.summary);
      }

      // Also refresh BOLO hotlist
      const boloRes = await fetch('/api/traffic/bolo-hotlist');
      const boloData = await boloRes.json();
      if (boloData && boloData.bolos) {
        setBoloHotlist(boloData.bolos);
      }
    } catch (err) {
      console.error('Failed to load user radius traffic log:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userLocation, radiusMeters, radiusUnit, currentCity]);

  // Fetch Focal Camera Traffic
  const fetchIntersectionTraffic = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({
        cameraId: focalCamId.toString(),
        radiusMeters: intersectionRadiusMeters.toString(),
        direction: directionFilter,
        boloOnly: boloOnly.toString(),
        cityId: currentCity.id
      });

      if (searchQuery.trim()) {
        params.append('plateQuery', searchQuery.trim());
        params.append('vehicleQuery', searchQuery.trim());
      }

      const res = await fetch(`/api/traffic/closest-cams?${params.toString()}`);
      const data = await res.json();
      if (data && data.summary) {
        setIntersectionSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load intersection traffic:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [focalCamId, intersectionRadiusMeters, directionFilter, boloOnly, searchQuery, currentCity]);

  // Initial load
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Trigger main data fetch when tab or location changes
  useEffect(() => {
    if (activeTrackerTab === 'user_radius') {
      fetchUserRadiusTraffic(true);
    } else if (activeTrackerTab === 'intersection') {
      fetchIntersectionTraffic(true);
    } else if (activeTrackerTab === 'bookmarks') {
      fetchBookmarks();
    }
  }, [activeTrackerTab, fetchUserRadiusTraffic, fetchIntersectionTraffic, fetchBookmarks]);

  // Active Logging Continuous Stream Poller
  useEffect(() => {
    if (!activeLoggingEnabled) return;
    const interval = setInterval(() => {
      if (activeTrackerTab === 'user_radius') {
        fetchUserRadiusTraffic(false);
      } else if (activeTrackerTab === 'intersection') {
        fetchIntersectionTraffic(false);
      }
    }, 3800);
    return () => clearInterval(interval);
  }, [activeLoggingEnabled, activeTrackerTab, fetchUserRadiusTraffic, fetchIntersectionTraffic]);

  // ----------------------------------------------------
  // Geolocation Handler
  // ----------------------------------------------------
  const handleDetectUserGps = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported by this browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMessage('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const closestCity = findClosestMajorCity(latitude, longitude);
        if (onSelectCity) {
          onSelectCity(closestCity.id);
        } else {
          setInternalCityId(closestCity.id);
        }
        setUserLocation({
          lat: latitude,
          lng: longitude,
          label: `GPS Device Location (±${Math.round(accuracy)}m) in ${closestCity.name}`,
          source: 'gps',
          accuracyMeters: accuracy,
          cityId: closestCity.id,
          cityName: closestCity.name
        });
        setBmState(closestCity.state);
        setNewBoloState(closestCity.state);
        setBmCityId(closestCity.id);
        setIsDetectingGps(false);
        setGpsStatusMessage(`GPS Pinpointed: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} — Surrounding CCTV nodes engaged in ${closestCity.name} (${closestCity.agencyShort})`);
        setTimeout(() => setGpsStatusMessage(''), 5000);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsDetectingGps(false);
        setGpsStatusMessage(`GPS unavailable (${error.message}). Using preset location in ${currentCity.name}.`);
        setTimeout(() => setGpsStatusMessage(''), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  };

  // ----------------------------------------------------
  // Bookmarking Handlers
  // ----------------------------------------------------
  const openBookmarkModalForRecord = (record: IntersectionTrafficRecord) => {
    setEditingBookmarkTarget(record);
    setBmPlate(record.plate.plateNumber);
    setBmState(record.plate.state);
    setBmMake(record.vehicle.make);
    setBmModel(record.vehicle.model);
    setBmYear(record.vehicle.yearEstimate || '2023');
    setBmColor(record.vehicle.color);
    setBmBodySubtype(record.vehicle.bodySubtype);
    setBmCityId(currentCity.id);

    // If already bookmarked, populate existing info
    if (record.bookmarkData) {
      setBmCategoryTag(record.bookmarkData.categoryTag);
      setBmPriority(record.bookmarkData.priority);
      setBmCaseNumber(record.bookmarkData.caseNumber || '');
      setBmNotes(record.bookmarkData.notes || '');
      setBmDriverDesc(record.bookmarkData.driverDescription || '');
      setBmBehaviors(record.bookmarkData.observedBehaviors || []);
      setBmAlertOnDetection(record.bookmarkData.alertOnDetection);
      if (record.bookmarkData.cityId) {
        setBmCityId(record.bookmarkData.cityId);
      }
    } else {
      setBmCategoryTag('Suspicious Vehicle');
      setBmPriority(record.isSpeeding ? 'high' : 'medium');
      setBmCaseNumber('');
      setBmNotes(
        record.isSpeeding
          ? `Observed speeding at ${record.speedMph} mph (Limit: ${record.speedLimitMph} mph) through ${record.intersectionName} in ${currentCity.name}.`
          : `Spotted passing through ${record.intersectionName}. Monitored in 0.5 radius of ${currentCity.name}.`
      );
      setBmDriverDesc('');
      setBmBehaviors(record.isSpeeding ? ['Excessive Speed (+15mph)'] : []);
      setBmAlertOnDetection(true);
    }

    setIsBookmarkModalOpen(true);
  };

  const openBookmarkModalForSaved = (bm: BookmarkedVehicle) => {
    setEditingBookmarkTarget(bm);
    setBmPlate(bm.plateNumber);
    setBmState(bm.state);
    setBmMake(bm.make);
    setBmModel(bm.model);
    setBmYear(bm.year || '2023');
    setBmColor(bm.color);
    setBmBodySubtype(bm.bodySubtype);
    setBmCategoryTag(bm.categoryTag);
    setBmPriority(bm.priority);
    setBmCaseNumber(bm.caseNumber || '');
    setBmNotes(bm.notes || '');
    setBmDriverDesc(bm.driverDescription || '');
    setBmBehaviors(bm.observedBehaviors || []);
    setBmAlertOnDetection(bm.alertOnDetection);
    setBmCityId(bm.cityId || currentCity.id);

    setIsBookmarkModalOpen(true);
  };

  const handleSaveBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmPlate.trim()) return;

    setIsSavingBookmark(true);
    try {
      const activeCityMeta = getCityById(bmCityId || currentCity.id);
      const payload = {
        plateNumber: bmPlate.trim().toUpperCase(),
        state: bmState,
        make: bmMake,
        model: bmModel,
        year: bmYear,
        color: bmColor,
        bodySubtype: bmBodySubtype,
        categoryTag: bmCategoryTag,
        priority: bmPriority,
        caseNumber: bmCaseNumber.trim(),
        notes: bmNotes.trim(),
        driverDescription: bmDriverDesc.trim(),
        observedBehaviors: bmBehaviors,
        alertOnDetection: bmAlertOnDetection,
        cityId: activeCityMeta.id,
        cityName: activeCityMeta.name,
        lastSeenLocation:
          (editingBookmarkTarget as IntersectionTrafficRecord)?.intersectionName ||
          (editingBookmarkTarget as BookmarkedVehicle)?.lastSeenLocation ||
          userLocation.label,
        lastSeenCameraId:
          (editingBookmarkTarget as IntersectionTrafficRecord)?.cameraId ||
          (editingBookmarkTarget as BookmarkedVehicle)?.lastSeenCameraId ||
          (currentCity.cameras[0]?.id || 21603),
        lastSeenDirection:
          (editingBookmarkTarget as IntersectionTrafficRecord)?.direction ||
          (editingBookmarkTarget as BookmarkedVehicle)?.lastSeenDirection ||
          'SB',
        lastSeenSpeedMph:
          (editingBookmarkTarget as IntersectionTrafficRecord)?.speedMph ||
          (editingBookmarkTarget as BookmarkedVehicle)?.lastSeenSpeedMph ||
          35
      };

      const res = await fetch('/api/traffic/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookmarkSuccessMsg(`Vehicle ${bmPlate.toUpperCase()} bookmarked with custom info!`);
        await fetchBookmarks();
        if (activeTrackerTab === 'user_radius') {
          fetchUserRadiusTraffic(false);
        }
        setTimeout(() => {
          setBookmarkSuccessMsg('');
          setIsBookmarkModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save bookmark:', err);
    } finally {
      setIsSavingBookmark(false);
    }
  };

  const handleDeleteBookmark = async (bmId: string) => {
    if (!confirm('Remove this vehicle from bookmarked intel vault?')) return;
    try {
      const res = await fetch(`/api/traffic/bookmarks/${bmId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchBookmarks();
        if (activeTrackerTab === 'user_radius') {
          fetchUserRadiusTraffic(false);
        }
      }
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  const handleToggleBehavior = (beh: string) => {
    if (bmBehaviors.includes(beh)) {
      setBmBehaviors(bmBehaviors.filter((b) => b !== beh));
    } else {
      setBmBehaviors([...bmBehaviors, beh]);
    }
  };

  // Export Bookmarks
  const handleExportBookmarksJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarkedVehicles, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `bookmarked-vehicles-intel-${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  const handleCopyPlate = (plateNum: string) => {
    navigator.clipboard.writeText(plateNum);
    setCopiedPlate(true);
    setTimeout(() => setCopiedPlate(false), 2000);
  };

  // Filtered vehicle records for display in user radius view
  const filteredUserRadiusLogs = useMemo(() => {
    if (!userRadiusSummary?.activeVehicleLogs) return [];
    let list = userRadiusSummary.activeVehicleLogs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.plate.plateNumber.toLowerCase().includes(q) ||
          r.vehicle.make.toLowerCase().includes(q) ||
          r.vehicle.model.toLowerCase().includes(q) ||
          r.vehicle.color.toLowerCase().includes(q) ||
          (r.bookmarkData && r.bookmarkData.categoryTag.toLowerCase().includes(q)) ||
          (r.bookmarkData && r.bookmarkData.notes.toLowerCase().includes(q))
      );
    }

    if (directionFilter !== 'ALL') {
      list = list.filter((r) => r.direction === directionFilter);
    }

    if (subtypeFilter !== 'all') {
      list = list.filter((r) => r.vehicle.bodySubtype === subtypeFilter);
    }

    if (bookmarkedOnly) {
      list = list.filter((r) => r.isBookmarked);
    }

    if (boloOnly) {
      list = list.filter((r) => r.plate.isHotlistMatch);
    }

    if (speedingOnly) {
      list = list.filter((r) => r.isSpeeding);
    }

    return list;
  }, [userRadiusSummary, searchQuery, directionFilter, subtypeFilter, bookmarkedOnly, boloOnly, speedingOnly]);

  // Compass icon helper
  const renderDirectionIcon = (dir: 'NB' | 'SB' | 'EB' | 'WB') => {
    switch (dir) {
      case 'NB':
        return <ArrowUp className="w-3.5 h-3.5 text-sky-400" />;
      case 'SB':
        return <ArrowDown className="w-3.5 h-3.5 text-rose-400" />;
      case 'EB':
        return <ArrowRight className="w-3.5 h-3.5 text-amber-400" />;
      case 'WB':
        return <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Priority color helper
  const getPriorityBadgeClass = (priority: BookmarkPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-950 text-red-300 border-red-700/80';
      case 'high':
        return 'bg-amber-950 text-amber-300 border-amber-700/80';
      case 'medium':
        return 'bg-sky-950 text-sky-300 border-sky-700/80';
      case 'low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Hero & Attribution Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Active 0.5 Radius Vehicle Logger &amp; ALPR Tracker
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live 0.5 Radius Logging Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuously logging vehicles inside a 0.5 radius of user coordinates. Bookmark vehicles of interest, attach case intelligence, notes, and track real-time passage kinematics.
                </p>
              </div>
            </div>
          </div>

          {/* Operational View Switcher & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveTrackerTab('user_radius')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
                  activeTrackerTab === 'user_radius'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>My 0.5 Radius Logger</span>
              </button>

              <button
                onClick={() => setActiveTrackerTab('intersection')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
                  activeTrackerTab === 'intersection'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Focal Cam Explorer</span>
              </button>

              <button
                onClick={() => setActiveTrackerTab('bookmarks')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
                  activeTrackerTab === 'bookmarks'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Bookmarked Vehicles ({bookmarkedVehicles.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsSourceCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium transition"
              title="View source code generated for this page"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source Links</span>
            </button>
          </div>
        </div>

        {/* External Intel Links Ribbon (Mandatory Requirement) */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              <span>{currentCity.name} Intel Sources ({currentCity.agencyShort}):</span>
            </span>
            {currentCity.externalIntelLinks.map((link, lIdx) => (
              <React.Fragment key={link.url}>
                {lIdx > 0 && <span className="text-slate-600">•</span>}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline hover:text-cyan-300 flex items-center gap-0.5"
                  title={link.description}
                >
                  <span>{link.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-cyan-500" />
                </a>
              </React.Fragment>
            ))}
          </div>

          <div className="text-slate-400 flex items-center gap-2">
            <span>City: <strong className="text-cyan-400 font-semibold">{currentCity.displayName}</strong></span>
            <span>•</span>
            <span>Radius: <strong className="text-amber-400 font-semibold">{userRadiusSummary?.radiusDisplay || '0.50 mi (805m)'}</strong></span>
            <span>•</span>
            <span>Bookmarks: <strong className="text-amber-300">{bookmarkedVehicles.length} vehicles</strong></span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 1: MY 0.5 RADIUS ACTIVE LOGGER */}
      {/* ---------------------------------------------------- */}
      {activeTrackerTab === 'user_radius' && (
        <>
          {/* User Location Radar HUD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
            {/* Major Metro City Quick Selector Bar */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Surveillance Metropolitan Region ({MAJOR_CITIES.length} Cities):</span>
                </span>
                <span className="text-[11px] text-cyan-300 font-medium">
                  Active: {currentCity.displayName} • {currentCity.agencyShort} ({currentCity.cameras.length} CCTV nodes)
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {MAJOR_CITIES.map((city) => {
                  const isSelected = city.id === currentCity.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSwitchCity(city.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-900/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`${city.displayName} — ${city.agencyName}`}
                    >
                      <span>{city.name}, {city.state}</span>
                      <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-cyan-950/30 text-slate-950 font-bold' : 'bg-slate-900 text-cyan-400'}`}>
                        {city.cameras.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Geolocation Controller */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Location &amp; 0.5 Radius Anchor in {currentCity.name}</span>
                  </label>
                  {gpsStatusMessage && (
                    <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {gpsStatusMessage}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDetectUserGps}
                    disabled={isDetectingGps}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-md shadow-sky-950/40 whitespace-nowrap"
                    title="Detect real-time GPS location via browser and match closest city"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
                  </button>

                  <select
                    value={userLocation.label}
                    onChange={(e) => {
                      const found = currentCity.presets.find((p) => p.label === e.target.value);
                      if (found) {
                        setUserLocation({
                          lat: found.lat,
                          lng: found.lng,
                          label: found.label,
                          source: 'preset',
                          cityId: currentCity.id,
                          cityName: currentCity.name
                        });
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500 flex-1"
                    title={`Select landmark intersection in ${currentCity.name}`}
                  >
                    {currentCity.presets.map((p) => (
                      <option key={p.label} value={p.label}>
                        📍 {p.label} ({p.lat.toFixed(4)}, {p.lng.toFixed(4)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radius Configuration */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-2 min-w-[280px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Logging Radius:
                  </span>
                  <span className="text-amber-400 font-bold">
                    {radiusMeters === 805
                      ? '0.5 Miles (805m)'
                      : radiusMeters === 500
                      ? '0.5 Kilometers (500m)'
                      : radiusMeters === 402
                      ? '0.25 Miles (402m)'
                      : `${(radiusMeters / 1609.34).toFixed(2)} mi (${radiusMeters}m)`}
                  </span>
                </div>

                {/* Quick Radius Selection Buttons */}
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    onClick={() => {
                      setRadiusMeters(805);
                      setRadiusUnit('miles');
                    }}
                    className={`py-1 rounded font-semibold transition border ${
                      radiusMeters === 805
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    0.5 Miles
                  </button>

                  <button
                    onClick={() => {
                      setRadiusMeters(500);
                      setRadiusUnit('km');
                    }}
                    className={`py-1 rounded font-semibold transition border ${
                      radiusMeters === 500
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    0.5 Km
                  </button>

                  <button
                    onClick={() => {
                      setRadiusMeters(1609);
                      setRadiusUnit('miles');
                    }}
                    className={`py-1 rounded font-semibold transition border ${
                      radiusMeters === 1609
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    1.0 Mile
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[11px]">
                  <span className="text-slate-400">Stream Status:</span>
                  <button
                    onClick={() => setActiveLoggingEnabled(!activeLoggingEnabled)}
                    className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                      activeLoggingEnabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeLoggingEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                    <span>{activeLoggingEnabled ? 'ACTIVE LOGGING ON' : 'PAUSED'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Counters in User 0.5 Radius */}
            {userRadiusSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Car className="w-3 h-3 text-amber-400" />
                    <span>Logged in 0.5 Radius</span>
                  </div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5">
                    {userRadiusSummary.totalVehiclesLogged} <span className="text-xs text-slate-400 font-normal">vehicles</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CameraIcon className="w-3 h-3 text-sky-400" />
                    <span>CCTV Nodes in Radius</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {userRadiusSummary.totalCamerasInRadius} <span className="text-xs text-slate-400 font-normal">intersections</span>
                  </div>
                </div>

                <div className={`rounded-lg p-2.5 border ${
                  userRadiusSummary.bookmarkedVehiclesInRadius.length > 0
                    ? 'bg-amber-950/40 border-amber-600/80 text-amber-200 shadow-md shadow-amber-950/30'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-400'
                }`}>
                  <div className="text-[11px] flex items-center gap-1">
                    <Star className={`w-3 h-3 ${userRadiusSummary.bookmarkedVehiclesInRadius.length > 0 ? 'fill-amber-400 text-amber-400 animate-pulse' : ''}`} />
                    <span>Bookmarked Spotted</span>
                  </div>
                  <div className={`text-lg font-bold mt-0.5 ${userRadiusSummary.bookmarkedVehiclesInRadius.length > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                    {userRadiusSummary.bookmarkedVehiclesInRadius.length} <span className="text-xs font-normal">spotted</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-400" />
                    <span>Avg Speed &amp; Violations</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-300 mt-0.5">
                    {userRadiusSummary.averageSpeedMph} <span className="text-xs text-slate-400 font-normal">mph</span>
                    {userRadiusSummary.speedingCount > 0 && (
                      <span className="text-xs text-rose-400 ml-1.5 font-normal">({userRadiusSummary.speedingCount} speeding)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Surrounding CCTV Nodes Strip inside 0.5 Radius */}
          {userRadiusSummary && userRadiusSummary.camerasInRadius.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Intersections Actively Monitored in 0.5 Radius ({userRadiusSummary.camerasInRadius.length} nodes)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Sorted by distance from your location
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {userRadiusSummary.camerasInRadius.map((node) => (
                  <div
                    key={node.camera.id}
                    onClick={() => onSelectCamera(node.camera)}
                    className="group relative rounded-lg border border-slate-700/60 bg-slate-800/60 p-2 cursor-pointer transition hover:bg-slate-800 hover:border-slate-600 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded overflow-hidden bg-slate-950 mb-1.5">
                        <img
                          src={`/api/camera-snapshot/${node.camera.id}?t=${liveTimestamp}`}
                          alt={node.camera.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-[9px] font-mono text-white rounded">
                          #{node.camera.id}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-300">
                        {node.intersection}
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-amber-400">
                        {(node.distanceMeters / 1609.34).toFixed(2)} mi ({node.distanceMeters}m)
                      </span>
                      <span className="text-slate-300">
                        {node.recentTrafficCount} logs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Universal Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 0.5 Radius by Plate #, Make/Model, Color, Bookmark Tag, or Notes..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Bookmarked Only Toggle */}
                <button
                  onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                    bookmarkedOnly
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-white text-white' : 'text-amber-400'}`} />
                  <span>Bookmarked Only ({bookmarkedVehicles.length})</span>
                </button>

                {/* Direction Filter */}
                <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
                  {(['ALL', 'NB', 'SB', 'EB', 'WB'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setDirectionFilter(dir)}
                      className={`px-2 py-1 rounded font-medium transition ${
                        directionFilter === dir
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>

                {/* Subtype Dropdown */}
                <select
                  value={subtypeFilter}
                  onChange={(e) => setSubtypeFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Vehicles</option>
                  <option value="sedan">Sedans</option>
                  <option value="suv">SUVs</option>
                  <option value="pickup">Pickups</option>
                  <option value="van">Vans</option>
                  <option value="taxi">Taxis</option>
                  <option value="semi_truck">Semis</option>
                  <option value="motorcycle">Motorcycles</option>
                </select>

                {/* Speeding Toggle */}
                <button
                  onClick={() => setSpeedingOnly(!speedingOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                    speedingOnly
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Speeding</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Logged Vehicles Stream in 0.5 Radius */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Actively Logged Vehicles Stream in Your 0.5 Radius</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-amber-400 border border-slate-700">
                  {filteredUserRadiusLogs.length} Logged Passages
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Geodesic Logging (0.5 Radius)</span>
              </div>
            </div>

            {/* Empty State */}
            {filteredUserRadiusLogs.length === 0 && !isLoading && (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Car className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-200">No vehicles match current 0.5 radius filters</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try clearing search filters or changing your location coordinates to view active vehicle passages.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDirectionFilter('ALL');
                    setSubtypeFilter('all');
                    setBookmarkedOnly(false);
                    setSpeedingOnly(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-medium"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Vehicle Records List */}
            {filteredUserRadiusLogs.length > 0 && (
              <div className="divide-y divide-slate-800/80">
                {filteredUserRadiusLogs.map((record) => {
                  const isBookmarked = record.isBookmarked || Boolean(record.bookmarkData);
                  const bmData = record.bookmarkData;

                  return (
                    <div
                      key={record.id}
                      className={`p-4 transition hover:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isBookmarked
                          ? 'bg-amber-950/20 border-l-4 border-l-amber-500'
                          : record.plate.isHotlistMatch
                          ? 'bg-red-950/20 border-l-4 border-l-red-500'
                          : ''
                      }`}
                    >
                      {/* Left: Log Time, Distance from User & Direction */}
                      <div className="flex items-start gap-3.5 min-w-[280px]">
                        {/* Direction Compass Badge */}
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 text-center">
                          <div className="flex items-center gap-0.5">
                            {renderDirectionIcon(record.direction)}
                            <span className="font-bold text-xs text-white">{record.direction}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {record.directionAngleDeg}°
                          </span>
                        </div>

                        <div className="space-y-1">
                          {/* Passage Time & Distance from User */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-mono">
                              {record.formattedTime}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {record.timeOffsetSeconds}s ago
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                              {(record.distanceFromFocalMeters / 1609.34).toFixed(2)} mi from you
                            </span>
                          </div>

                          {/* Intersection & Camera */}
                          <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="line-clamp-1">{record.intersectionName}</span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="font-mono text-amber-400/90">
                              CCTV #{record.cameraId}
                            </span>
                            <span>•</span>
                            <span>{record.lane}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Vehicle Identification & ALPR Plate */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        {/* US License Plate Widget */}
                        <div
                          onClick={() => setInspectedRecord(record)}
                          className="cursor-pointer group flex-shrink-0 shadow-lg"
                          title="Click to inspect optical ALPR crop & confidence"
                        >
                          <div className="w-36 bg-gradient-to-b from-slate-100 to-slate-200 text-slate-950 rounded border-2 border-slate-400 px-2 py-1 shadow transition group-hover:border-amber-400 group-hover:scale-105">
                            <div className="flex justify-between items-center text-[9px] font-bold tracking-widest text-sky-900 uppercase border-b border-slate-300/80 pb-0.5">
                              <span>{record.plate.stateName.toUpperCase()}</span>
                              <span className="text-[8px] text-slate-500 font-normal">HOME MEANS NV</span>
                            </div>
                            <div className="text-center font-mono font-black text-lg tracking-wider text-slate-900 py-0.5">
                              {record.plate.plateNumber}
                            </div>
                            <div className="flex justify-between items-center text-[8px] text-slate-600 font-mono">
                              <span>OCR: {(record.plate.confidence * 100).toFixed(1)}%</span>
                              <span className="uppercase">{record.plate.plateType}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Details & Bookmarked Info */}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                              style={{ backgroundColor: record.vehicle.colorHex }}
                            ></span>
                            <span className="text-sm font-bold text-white">
                              {record.vehicle.color} {record.vehicle.make} {record.vehicle.model}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({record.vehicle.yearEstimate} {record.vehicle.bodySubtype})
                            </span>

                            {/* Bookmarked Badge */}
                            {isBookmarked && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-slate-950" />
                                <span>BOOKMARKED</span>
                              </span>
                            )}

                            {/* Custom User Category Tag */}
                            {bmData?.categoryTag && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeClass(bmData.priority)}`}>
                                {bmData.categoryTag}
                              </span>
                            )}
                          </div>

                          {/* Distinctive Features */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            {record.vehicle.distinctiveFeatures.map((feat, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>

                          {/* Speed & Transit Notes */}
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Gauge className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-200">{record.speedMph} mph</strong>
                              <span className="text-[10px] text-slate-400">({record.speedLimitMph} limit)</span>
                            </span>
                            {record.isSpeeding && (
                              <span className="text-rose-400 font-bold text-[10px]">
                                SPEED VIOLATION (+{record.speedMph - record.speedLimitMph} mph)
                              </span>
                            )}
                          </div>

                          {/* Attached Custom User Notes if Bookmarked */}
                          {bmData?.notes && (
                            <div className="mt-1.5 p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
                                <span>Intel Notes {bmData.caseNumber ? `(${bmData.caseNumber})` : ''}:</span>
                                <span>Priority: {bmData.priority.toUpperCase()}</span>
                              </div>
                              <p className="text-slate-200">{bmData.notes}</p>
                              {bmData.driverDescription && (
                                <p className="text-slate-400 text-[10px]">Driver: {bmData.driverDescription}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Bookmarking Button & Camera Feed Snapshot */}
                      <div className="flex items-center gap-3 justify-end flex-shrink-0">
                        <div
                          onClick={() => onSelectCamera(cameras.find((c) => c.id === record.cameraId) || cameras[0])}
                          className="cursor-pointer group relative w-20 h-14 rounded overflow-hidden bg-slate-950 border border-slate-700"
                          title="Click to view camera feed"
                        >
                          <img
                            src={record.snapshotUrl}
                            alt="CCTV"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] text-slate-200 rounded font-mono">
                            CCTV
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {/* Primary Bookmark Button */}
                          <button
                            onClick={() => openBookmarkModalForRecord(record)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                              isBookmarked
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-950/30'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'fill-slate-950 text-slate-950'}`} />
                            <span>{isBookmarked ? 'Edit Info / Notes' : 'Bookmark Vehicle'}</span>
                          </button>

                          <button
                            onClick={() => setInspectedRecord(record)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect ALPR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 2: INTERSECTION & FOCAL CAMERA EXPLORER */}
      {/* ---------------------------------------------------- */}
      {activeTrackerTab === 'intersection' && (
        <>
          {/* Focal Node Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Selected Focal Intersection Node</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={focalCamId}
                    onChange={(e) => setFocalCamId(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-cyan-500 flex-1"
                  >
                    {(cameras.length > 0 ? cameras : currentCity.cameras).map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} - {c.name} ({c.corridor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radius Distance Slider */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Distance Radius:</span>
                  <span className="text-amber-400 font-bold">
                    {(intersectionRadiusMeters / 1000).toFixed(1)} km ({Math.round(intersectionRadiusMeters * 3.28084)} ft)
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={250}
                  value={intersectionRadiusMeters}
                  onChange={(e) => setIntersectionRadiusMeters(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Surrounding Nodes Strip */}
          {intersectionSummary && intersectionSummary.closestCameras.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Surrounding Closest Intersections ({intersectionSummary.closestCameras.length} nodes)</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {intersectionSummary.closestCameras.map((node) => (
                  <div
                    key={node.camera.id}
                    onClick={() => setFocalCamId(node.camera.id)}
                    className={`rounded-lg border p-2 cursor-pointer transition flex flex-col justify-between ${
                      node.camera.id === focalCamId
                        ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/20'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                      {node.intersection}
                    </div>
                    <div className="text-[10px] text-amber-400 mt-1">
                      {node.distanceMeters}m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intersection Log List */}
          {intersectionSummary && intersectionSummary.activeTrafficLogs && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-400">
                Displaying {intersectionSummary.activeTrafficLogs.length} active passage records near #{focalCamId}. Switch to "My 0.5 Radius Logger" tab to monitor your immediate perimeter.
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 3: BOOKMARKED VEHICLES INTEL VAULT */}
      {/* ---------------------------------------------------- */}
      {activeTrackerTab === 'bookmarks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Bookmarked Vehicles Intel Vault ({bookmarkedVehicles.length} Tracked)
                </h3>
                <p className="text-xs text-slate-400">
                  Target vehicles with custom annotations, threat priorities, and automatic sighting alerts in your 0.5 radius.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBookmarksJson}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>City Vault:</span>
            </span>
            <button
              onClick={() => setBookmarkCityFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition border ${
                bookmarkCityFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              All Cities ({bookmarkedVehicles.length})
            </button>
            {MAJOR_CITIES.map((city) => {
              const count = bookmarkedVehicles.filter((b) => (b.cityId || 'las_vegas') === city.id).length;
              return (
                <button
                  key={city.id}
                  onClick={() => setBookmarkCityFilter(city.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 border ${
                    bookmarkCityFilter === city.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{city.name}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1 rounded ${bookmarkCityFilter === city.id ? 'bg-cyan-950/40 text-slate-950 font-bold' : 'bg-slate-900 text-amber-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty Bookmarks State */}
          {bookmarkedVehicles.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-slate-200">No vehicles bookmarked yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Bookmark Vehicle" on any vehicle passing through your 0.5 radius to add intelligence notes, case references, and alert tags.
              </p>
              <button
                onClick={() => setActiveTrackerTab('user_radius')}
                className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Go to 0.5 Radius Logger
              </button>
            </div>
          )}

          {/* Bookmarked Vehicles Grid */}
          {bookmarkedVehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedVehicles
                .filter((bm) => bookmarkCityFilter === 'all' || (bm.cityId || 'las_vegas') === bookmarkCityFilter)
                .map((bm) => (
                <div
                  key={bm.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3 transition hover:border-amber-500/60"
                >
                  {/* Card Header: Plate, Tag, Priority */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* US Plate Graphic */}
                      <div className="w-28 bg-slate-100 text-slate-950 rounded border border-slate-400 px-2 py-0.5 shadow font-mono text-center">
                        <div className="text-[8px] font-bold text-sky-900 border-b border-slate-300 pb-0.5">
                          {bm.state} • {bm.state === 'CA' ? 'GOLDEN STATE' : bm.state === 'NY' ? 'EMPIRE STATE' : bm.state === 'TX' ? 'LONE STAR STATE' : bm.state === 'IL' ? 'LAND OF LINCOLN' : bm.state === 'FL' ? 'SUNSHINE STATE' : bm.state === 'WA' ? 'EVERGREEN' : bm.state === 'AZ' ? 'GRAND CANYON' : bm.state === 'GA' ? 'PEACH STATE' : bm.state === 'DC' ? 'DISTRICT OF COLUMBIA' : 'SILVER STATE'}
                        </div>
                        <div className="text-base font-black tracking-wider text-slate-900">
                          {bm.plateNumber}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white">
                          {bm.color} {bm.make} {bm.model}
                        </div>
                        <div className="text-xs text-slate-400">
                          {bm.year} {bm.bodySubtype.toUpperCase()}
                        </div>
                        <div className="mt-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                            📍 {bm.cityName || 'Las Vegas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeClass(bm.priority)}`}>
                        {bm.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 border border-slate-600">
                        {bm.categoryTag}
                      </span>
                    </div>
                  </div>

                  {/* Case & Sighting Info */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                    <div>
                      {bm.caseNumber && (
                        <span className="text-amber-400 font-mono font-semibold">
                          Case #{bm.caseNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400">
                      Spotted: <strong className="text-white">{bm.sightingCount || 1} times</strong> in radius
                    </div>
                  </div>

                  {/* Custom Notes Section */}
                  <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-400 font-semibold text-[11px]">User Intel &amp; Notes:</div>
                    <p className="text-slate-200">{bm.notes || 'No notes added.'}</p>
                    {bm.driverDescription && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span className="font-semibold text-slate-300">Driver:</span> {bm.driverDescription}
                      </div>
                    )}
                  </div>

                  {/* Observed Behaviors Tags */}
                  {bm.observedBehaviors && bm.observedBehaviors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {bm.observedBehaviors.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/60"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                    <div className="text-[11px] text-slate-400">
                      Last seen at {bm.lastSeenLocation}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openBookmarkModalForSaved(bm)}
                        className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Info</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="p-1 rounded bg-slate-700 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. BOOKMARKING & VEHICLE INFO MODAL */}
      {/* ---------------------------------------------------- */}
      {isBookmarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Bookmark Vehicle &amp; Add Intelligence Info
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add custom tags, case numbers, notes, driver description, and 0.5 radius alert flags
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBookmarkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookmarkSuccessMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{bookmarkSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveBookmark} className="space-y-4 text-xs">
              {/* Vehicle & Plate Overview */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Plate Number</label>
                  <input
                    type="text"
                    value={bmPlate}
                    onChange={(e) => setBmPlate(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono font-bold mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Surveillance Metro Region</label>
                  <select
                    value={bmCityId}
                    onChange={(e) => {
                      setBmCityId(e.target.value);
                      const selected = getCityById(e.target.value);
                      setBmState(selected.state);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white mt-1"
                  >
                    {MAJOR_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.state} ({c.agencyShort})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Plate State / Jurisdiction</label>
                  <select
                    value={bmState}
                    onChange={(e) => setBmState(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white mt-1"
                  >
                    <option value="NV">NV - Nevada</option>
                    <option value="CA">CA - California</option>
                    <option value="NY">NY - New York</option>
                    <option value="IL">IL - Illinois</option>
                    <option value="TX">TX - Texas</option>
                    <option value="AZ">AZ - Arizona</option>
                    <option value="FL">FL - Florida</option>
                    <option value="WA">WA - Washington</option>
                    <option value="GA">GA - Georgia</option>
                    <option value="DC">DC - District of Columbia</option>
                    <option value="VA">VA - Virginia</option>
                    <option value="MD">MD - Maryland</option>
                    <option value="UT">UT - Utah</option>
                    <option value="CO">CO - Colorado</option>
                    <option value="OR">OR - Oregon</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Make &amp; Model</label>
                  <input
                    type="text"
                    value={`${bmMake} ${bmModel}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setBmMake(parts[0] || '');
                      setBmModel(parts.slice(1).join(' ') || '');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Color &amp; Subtype</label>
                  <input
                    type="text"
                    value={`${bmColor} (${bmBodySubtype})`}
                    readOnly
                    className="w-full bg-slate-800/50 border border-slate-700 rounded p-1.5 text-slate-300 mt-1"
                  />
                </div>
              </div>

              {/* Tag & Priority Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category Intel Tag</label>
                  <select
                    value={bmCategoryTag}
                    onChange={(e) => setBmCategoryTag(e.target.value as BookmarkCategoryTag)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {categoryTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Threat / Priority Level</label>
                  <select
                    value={bmPriority}
                    onChange={(e) => setBmPriority(e.target.value as BookmarkPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="critical">🔴 Critical (Immediate BOLO Watch)</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="medium">🔵 Medium (General Monitoring)</option>
                    <option value="low">⚪ Low (Informational)</option>
                  </select>
                </div>
              </div>

              {/* Case Number & Driver Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Case / Incident Reference ID</label>
                  <input
                    type="text"
                    value={bmCaseNumber}
                    onChange={(e) => setBmCaseNumber(e.target.value)}
                    placeholder="e.g. LVMPD-2026-9921"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Driver / Occupant Description</label>
                  <input
                    type="text"
                    value={bmDriverDesc}
                    onChange={(e) => setBmDriverDesc(e.target.value)}
                    placeholder="e.g. Single occupant, dark ballcap & sunglasses"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Multi-line User Notes / Observations */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Intelligence Notes &amp; Observations
                </label>
                <textarea
                  value={bmNotes}
                  onChange={(e) => setBmNotes(e.target.value)}
                  rows={3}
                  placeholder="Record observations, reasons for tracking, unusual driving behavior, or patrol instructions..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Observed Behaviors Checkboxes */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Observed Behaviors (Click to tag)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {behaviorPresets.map((b) => {
                    const isSelected = bmBehaviors.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleToggleBehavior(b)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Toggle */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Alert on Detection in 0.5 Radius</div>
                  <div className="text-slate-400 text-[11px]">
                    Highlight vehicle and trigger notification when detected at any camera inside 0.5 radius
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bmAlertOnDetection}
                  onChange={(e) => setBmAlertOnDetection(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookmarkModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingBookmark}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isSavingBookmark ? 'Saving...' : 'Save Bookmark & Info'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. ALPR DEEP INSPECTION MODAL */}
      {/* ---------------------------------------------------- */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Automatic License Plate Recognition (ALPR) Deep Inspection
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-accuracy optical character recognition (OCR) and vehicle classification analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embossed Large Plate Graphic */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="w-64 bg-gradient-to-b from-slate-100 to-slate-200 text-slate-950 rounded-lg border-4 border-slate-400 p-4 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-bold tracking-widest text-sky-950 border-b border-slate-300 pb-1">
                  <span>{inspectedRecord.plate.stateName.toUpperCase()}</span>
                  <span className="text-[10px] text-slate-600 font-normal">{currentCity.plateStyle.motto}</span>
                </div>
                <div className="text-center font-mono font-black text-3xl tracking-widest text-slate-950 py-3">
                  {inspectedRecord.plate.plateNumber}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-700 font-mono pt-1 border-t border-slate-300">
                  <span>OPTICAL ALPR SENSOR</span>
                  <span className="font-bold text-emerald-800">
                    {(inspectedRecord.plate.confidence * 100).toFixed(1)}% CONFIDENCE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyPlate(inspectedRecord.plate.plateNumber)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {copiedPlate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPlate ? 'Plate Number Copied!' : 'Copy Plate Number'}</span>
                </button>

                <button
                  onClick={() => {
                    openBookmarkModalForRecord(inspectedRecord);
                    setInspectedRecord(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Bookmark Vehicle &amp; Add Info</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. SOURCE CODE MODAL (Requirement Compliance) */}
      {/* ---------------------------------------------------- */}
      {isSourceCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Generated Page Source Code &amp; Citations
                  </h3>
                  <p className="text-xs text-slate-400">
                    Source architecture and external intelligence references
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSourceCodeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold uppercase tracking-wider text-slate-300">
                  External Intelligence Sources:
                </h4>
                <ul className="space-y-2">
                  {currentCity.externalIntelLinks.map((link) => (
                    <li
                      key={link.url}
                      className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {link.name} ({link.agency})
                        </div>
                        <div className="text-slate-400 text-[11px]">{link.description}</div>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sky-400 flex items-center gap-1 font-medium flex-shrink-0"
                      >
                        <span>Visit Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                  <li className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">OpenALPR Optical Character Recognition Library</div>
                      <div className="text-slate-400 text-[11px]">ALPR vehicle identification and plate confidence methodology</div>
                    </div>
                    <a
                      href="https://github.com/openalpr/openalpr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sky-400 flex items-center gap-1 font-medium"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-300">
                  Source Code Architecture for This Page Generation
                </h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>// UI Component:</div>
                  <div className="text-amber-400">src/components/ClosestTrafficLPRTracker.tsx</div>
                  <div className="mt-2">// Types Definition:</div>
                  <div className="text-amber-400">src/types.ts (BookmarkedVehicle, UserRadiusTrafficSummary, LicensePlateData)</div>
                  <div className="mt-2">// Backend API Implementation:</div>
                  <div className="text-amber-400">server.ts (GET /api/traffic/user-radius-log, GET/POST/PUT/DELETE /api/traffic/bookmarks)</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsSourceCodeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
