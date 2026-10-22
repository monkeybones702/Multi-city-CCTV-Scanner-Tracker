export interface PTZMovementState {
  status: 'stationary' | 'programmed_tour' | 'operator_manual';
  panSpeedDegPerSec: number;
  tiltSpeedDegPerSec: number;
  zoomLevel: number; // e.g. 1.0x to 15.0x
  zoomDelta: number;
  operatorConfidence: number; // 0.00 to 1.00
  tourMatchScore: number; // 0.00 to 1.00
  movementDurationSec: number;
  headingDeg: number; // 0 to 360
  lastMovementTime: string;
  classificationReason: string;
  isMovingLive: boolean;
}

export interface PTZAlert {
  id: string;
  cameraId: number;
  cameraName: string;
  corridor: string;
  type: 'operator_manual' | 'programmed_tour';
  timestamp: string;
  details: string;
  snapshotUrl: string;
  telemetry: {
    panSpeed: number;
    tiltSpeed: number;
    zoomLevel: number;
    durationSec: number;
    operatorConfidence: number;
  };
  isActive: boolean;
}

export interface CommunityResponse {
  id: string;
  postId: string;
  author: string;
  authorBadge?: string;
  content: string;
  timestamp: string;
  statusUpdate?: 'active' | 'updating' | 'cleared';
  upvotes?: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorRole: 'spotter' | 'driver' | 'resident' | 'verified_responder';
  category: 'incident' | 'hazard' | 'operator_activity' | 'congestion' | 'general';
  title: string;
  content: string;
  cameraId?: number;
  cameraName?: string;
  corridor?: string;
  snapshotUrl?: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
  status: 'active' | 'updating' | 'cleared';
  responses: CommunityResponse[];
  tags: string[];
}

export interface CADIncident {
  id: string;
  agency: 'LVMPD_TRAFFIC' | 'CCFD' | 'NHP_SOUTHERN' | 'NDOT_TIM';
  agencyLabel: string;
  callType: string;
  location: string;
  nearestCameraId?: number;
  nearestCameraName?: string;
  timestamp: string;
  unitsDispatched: string[];
  status: 'dispatched' | 'en_route' | 'on_scene' | 'cleared';
  details: string;
}

export interface Camera {
  id: number;
  name: string;
  lat: number;
  lng: number;
  corridor: string;
  cityId?: string;
  cityName?: string;
  streamUrl?: string | null;
  snapshotUrl: string;
  lastUpdated?: string;
  status?: 'active' | 'offline' | 'warning';
  ptzState?: PTZMovementState;
}

export type TargetCategory = 'vehicle' | 'person' | 'cyclist' | 'all';

export type VehicleSubtype =
  | 'any'
  | 'sedan'
  | 'suv'
  | 'pickup'
  | 'semi_truck'
  | 'box_truck'
  | 'van'
  | 'bus'
  | 'motorcycle'
  | 'emergency_vehicle'
  | 'taxi';

export type TargetColor =
  | 'any'
  | 'white'
  | 'black'
  | 'silver_gray'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'brown'
  | 'gold'
  | 'orange'
  | 'dark'
  | 'light';

export type TargetHeight =
  | 'any'
  | 'low' // < 1.5m (compact car, sports car, low bike)
  | 'standard' // 1.5m - 2.0m (sedan, standard SUV, adult person)
  | 'tall' // 2.0m - 3.5m (van, lifted pickup, box truck)
  | 'very_tall'; // > 3.5m (semi truck, commercial hauler, double-decker bus)

export type TargetSize =
  | 'any'
  | 'pedestrian' // single human or small object
  | 'compact' // small car, motorcycle, bike
  | 'standard' // sedan, crossover, average vehicle
  | 'large' // full-size SUV, large truck, group
  | 'oversized'; // commercial semi, flatbed, bus

export type CyclistType =
  | 'any'
  | 'bicycle'
  | 'motorcycle'
  | 'e_bike_scooter';

export interface BoundingBox {
  ymin: number; // 0 - 1000
  xmin: number; // 0 - 1000
  ymax: number; // 0 - 1000
  xmax: number; // 0 - 1000
}

export interface Detection {
  id: string;
  cameraId: number;
  cameraName: string;
  corridor: string;
  lat: number;
  lng: number;
  timestamp: string;
  category: 'vehicle' | 'person' | 'cyclist';
  subtype: string;
  color: string;
  height: 'low' | 'standard' | 'tall' | 'very_tall';
  size: 'pedestrian' | 'compact' | 'standard' | 'large' | 'oversized';
  isCyclist: boolean;
  cyclistType?: CyclistType;
  confidence: number;
  tags: string[];
  description: string;
  box: BoundingBox;
  snapshotUrl: string;
  thumbnailUrl?: string;
  trackingId?: string;
  direction?: 'NB' | 'SB' | 'EB' | 'WB' | 'stationary';
  speedEstimateMph?: number;
}

export interface SnapshotHistoryItem {
  id: string;
  cameraId: number;
  timestamp: string;
  url: string;
  detectionCount: number;
  note?: string;
}

export interface SearchFilterState {
  keyword: string;
  category: TargetCategory;
  vehicleType: VehicleSubtype;
  color: TargetColor;
  height: TargetHeight;
  size: TargetSize;
  cyclistOnly: boolean;
  selectedTags: string[];
  corridor: string;
  minConfidence: number;
}

export interface TrackedSubject {
  id: string;
  label: string;
  category: 'vehicle' | 'person' | 'cyclist';
  subtype?: string;
  description: string;
  color: string;
  height: string;
  size: string;
  firstSeen: string;
  lastSeen: string;
  lastCameraId: number;
  lastCameraName: string;
  sightings: Detection[];
  predictedNextCameraIds: number[];
  isFollowingLive: boolean;
}

// ----------------------------------------------------
// Broadcastify & Police / Fire Scanning Transcripts
// ----------------------------------------------------
export interface ScannerFeed {
  id: string;
  name: string;
  agency: 'LVMPD' | 'CCFD' | 'NHP' | 'HENDERSON_PD';
  talkgroup: string;
  frequencyMhz: number;
  listenersCount: number;
  isLive: boolean;
  feedUrl?: string;
  description: string;
}

export interface ScannerTranscript {
  id: string;
  feedId: string;
  agency: string;
  talkgroup: string;
  timestamp: string;
  rawAudioDurationSec: number;
  callSign: string;
  unit: string;
  tenCode?: string;
  tenCodeMeaning?: string;
  transcript: string;
  priority: 'critical' | 'high' | 'medium' | 'routine';
  correlatedCameraId?: number;
  correlatedCameraName?: string;
  locationKeyword: string;
  lat?: number;
  lng?: number;
  distanceMeters?: number;
  isTranscribingLive?: boolean;
}

// ----------------------------------------------------
// Fix It Clark County Municipal Public Works Database
// ----------------------------------------------------
export type FixItCategory =
  | 'traffic_signal_failure'
  | 'street_light_out'
  | 'roadway_hazard_debris'
  | 'pothole_asphalt'
  | 'sidewalk_obstruction'
  | 'illegal_dumping'
  | 'flooding_drainage'
  | 'damaged_guardrail';

export interface FixItReport {
  ticketId: string;
  source: 'FixIt Clark County 311' | 'SeeClickFix' | 'Citizen Report';
  category: FixItCategory;
  title: string;
  description: string;
  address: string;
  corridor: string;
  lat: number;
  lng: number;
  nearestCameraId: number;
  nearestCameraName: string;
  status: 'received' | 'in_progress' | 'scheduled' | 'resolved';
  priority: 'urgent' | 'high' | 'normal';
  submittedAt: string;
  updatedAt: string;
  assignedDepartment: string;
  upvotes: number;
  photoUrl?: string;
}

// ----------------------------------------------------
// Multi-Platform Social Media Geofenced Feeds
// ----------------------------------------------------
export type SocialPlatform =
  | 'x'
  | 'snapchat'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'nextdoor'
  | 'reddit';

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  mediaType: 'image' | 'video' | 'text';
  mediaUrl?: string;
  videoDurationSec?: number;
  hashtags: string[];
  lat: number;
  lng: number;
  locationName: string;
  corridor: string;
  nearestCameraId: number;
  nearestCameraName: string;
  distanceMeters?: number;
  engagement: {
    likes: number;
    shares: number;
    views?: number;
    comments: number;
  };
  sentiment: 'urgent' | 'caution' | 'informative' | 'neutral';
  verifiedUser?: boolean;
  correlatedCctvSnapshotUrl?: string;
}

// ----------------------------------------------------
// Unified Cross-Correlation Intelligence
// ----------------------------------------------------
export interface CrossCorrelationEvent {
  id: string;
  title: string;
  incidentType: string;
  primaryLocation: string;
  corridor: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100%
  nearestCameraId: number;
  nearestCameraName: string;
  cameraSnapshotUrl: string;
  summary: string;
  sources: {
    hasScanner: boolean;
    scannerTranscriptId?: string;
    scannerSnippet?: string;
    hasFixIt: boolean;
    fixItTicketId?: string;
    fixItCategory?: string;
    hasSocial: boolean;
    socialPlatforms: SocialPlatform[];
    socialPostIds: string[];
    socialSnippet?: string;
    hasCAD: boolean;
    cadIncidentId?: string;
  };
  status: 'active' | 'investigating' | 'resolved';
}

// ----------------------------------------------------
// Systematic Incident Historical Perpetrator Scan & Pursuit
// ----------------------------------------------------
export interface DriverAttire {
  headwear?: string;
  upperBody: string;
  lowerBody: string;
  footwear?: string;
  accessories?: string[];
  identifiabilityScore: number; // 0.00 - 1.00
  notableFeatures?: string[];
}

export interface DriverMovementRecord {
  timestamp: string;
  action: string;
  locationDescription: string;
  isEgressEvent: boolean;
  frameOffsetSeconds: number;
}

export interface DualVerification {
  verifiedTwice: boolean;
  pass1Score: number; // 0.00 - 1.00
  pass1Note: string;
  pass2Score: number; // 0.00 - 1.00
  pass2Note: string;
  doubleVerifiedTimestamp: string;
}

export interface HistoricalSighting {
  id: string;
  cameraId: number;
  cameraName: string;
  corridor: string;
  lat: number;
  lng: number;
  timestamp: string;
  timeOffsetSeconds: number; // -120s, -90s, -60s, -45s, -30s, -15s, 0s
  snapshotUrl: string;
  confidence: number;
  box: BoundingBox;
  driverBox?: BoundingBox;
  heading: 'NB' | 'SB' | 'EB' | 'WB';
  speedMph: number;
  dualVerification: DualVerification;
  driverIdentified: boolean;
  driverAttire?: DriverAttire;
  driverMovements: DriverMovementRecord[];
  driverExitedVehicle: boolean;
  notes: string;
  sourceUrl: string;
}

export interface IncidentHistoricalScanResult {
  id: string;
  incidentId: string;
  incidentTitle: string;
  incidentLocation: string;
  primaryCameraId: number;
  surroundingCameraIds: number[];
  scannedFramesCount: number;
  positiveMatchesCount: number;
  pathOfTravel: HistoricalSighting[];
  driverExitedCameraId?: number;
  driverExitedTimestamp?: string;
  liveTrackingRecommended: boolean;
  sourceUrl: string;
  createdAt: string;
}

export interface NarratedPostItem {
  id: string;
  platform: 'x' | 'snapchat' | 'tiktok' | 'facebook' | 'broadcastify' | 'cad';
  author: string;
  content: string;
  timestamp: string;
  narratedAt: string;
  sourceUrl: string;
}

export interface YouTubeLiveBroadcastState {
  isActive: boolean;
  broadcastTitle: string;
  streamUrl: string;
  viewerCount: number;
  incidentSummary: string;
  primaryCameraId: number;
  cameraName: string;
  relatedPostsNarrated: NarratedPostItem[];
  isNarratingVoice: boolean;
  audioSpeechSupported: boolean;
  currentNarratingText?: string;
  autoSwitchedToLiveVideo: boolean;
  sourceUrl: string;
}

// ----------------------------------------------------
// Automatic License Plate Reader (ALPR) & Intersection Traffic
// ----------------------------------------------------
export interface LicensePlateData {
  plateNumber: string; // e.g. "78B-X49"
  state: string; // "NV", "CA", "AZ", "UT"
  stateName: string; // "Nevada", "California"
  plateType: 'standard' | 'commercial' | 'personalized' | 'apportioned' | 'exempt';
  confidence: number; // 0.85 - 0.99
  ocrCharacters: { char: string; confidence: number }[];
  isHotlistMatch: boolean;
  hotlistReason?: string; // e.g. "BOLO: Felony Evading Suspect", "STOLEN VEHICLE REPORT #LV-8924"
  hotlistSeverity?: 'critical' | 'warning' | 'info';
  cropCoordinates?: BoundingBox;
}

export interface VehicleIdentification {
  make: string; // e.g. "Toyota", "Tesla", "Ford", "Dodge", "Honda"
  model: string; // e.g. "Camry", "Model Y", "F-150", "Charger"
  yearEstimate: string; // e.g. "2023-2025"
  bodySubtype: VehicleSubtype;
  color: string;
  colorHex: string;
  distinctiveFeatures: string[];
  classificationConfidence: number;
}

export interface IntersectionTrafficRecord {
  id: string;
  cameraId: number;
  cameraName: string;
  intersectionName: string;
  corridor: string;
  lat: number;
  lng: number;
  distanceFromFocalMeters: number;
  timestamp: string;
  timeOffsetSeconds: number; // e.g. 12
  formattedTime: string; // e.g. "01:04:12 AM"
  direction: 'NB' | 'SB' | 'EB' | 'WB';
  directionAngleDeg: number;
  lane: string;
  speedMph: number;
  speedLimitMph: number;
  isSpeeding: boolean;
  vehicle: VehicleIdentification;
  plate: LicensePlateData;
  snapshotUrl: string;
  transitSequenceId?: string;
  transitLegIndex?: number;
  totalTransitNodes?: number;
  notes?: string;
  isBookmarked?: boolean;
  bookmarkData?: BookmarkedVehicle;
  sourceUrl: string;
}

export interface ClosestCameraNode {
  camera: Camera;
  distanceMeters: number;
  intersection: string;
  recentTrafficCount: number;
  activeLprDetectionsCount: number;
}

export interface ClosestCameraTrafficSummary {
  focalCamera: Camera;
  radiusMeters: number;
  totalClosestCameras: number;
  closestCameras: ClosestCameraNode[];
  activeTrafficLogs: IntersectionTrafficRecord[];
  activeBolosCount: number;
  totalPlatesRead: number;
  averageSpeedMph: number;
  sourceUrl: string;
}

export interface BoloEntry {
  id: string;
  plateNumber: string;
  state: string;
  makeModel: string;
  color: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
  flaggedBy: string;
  flaggedAt: string;
  notes: string;
}

// ----------------------------------------------------
// Bookmarked Vehicle & User 0.5 Radius Logging
// ----------------------------------------------------
export type BookmarkCategoryTag =
  | 'Suspicious Vehicle'
  | 'Person of Interest'
  | 'Witness / Transit'
  | 'Resident / Neighbor'
  | 'Commercial / Delivery'
  | 'Fleet Vehicle'
  | 'VIP / Transport'
  | 'Speeding / Violator'
  | 'Custom Tracked';

export type BookmarkPriority = 'low' | 'medium' | 'high' | 'critical';

export interface BookmarkedVehicle {
  id: string;
  plateNumber: string;
  state: string;
  make: string;
  model: string;
  year?: string;
  color: string;
  colorHex?: string;
  bodySubtype: string;
  categoryTag: BookmarkCategoryTag;
  priority: BookmarkPriority;
  caseNumber?: string;
  notes: string;
  driverDescription?: string;
  observedBehaviors: string[];
  alertOnDetection: boolean;
  cityId?: string;
  cityName?: string;
  bookmarkedAt: string;
  lastSeenAt: string;
  lastSeenLocation: string;
  lastSeenCameraId: number;
  lastSeenDirection: 'NB' | 'SB' | 'EB' | 'WB';
  lastSeenSpeedMph: number;
  sightingCount: number;
  sourceUrl: string;
}

export interface UserLocationState {
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'preset' | 'custom';
  accuracyMeters?: number;
  cityId?: string;
  cityName?: string;
}

export interface CitySummaryInfo {
  id: string;
  name: string;
  state: string;
  stateName: string;
  agencyName: string;
  agencyShort: string;
  externalIntelLinks?: Array<{
    name: string;
    url: string;
    description: string;
    agency: string;
  }>;
  plateStyle?: {
    state: string;
    stateName: string;
    motto: string;
    bgColorClass: string;
    headerTextColor: string;
    mottoColor: string;
    borderStyle: string;
  };
}

export interface UserRadiusTrafficSummary {
  cityInfo?: CitySummaryInfo;
  userLocation: UserLocationState;
  radiusMeters: number;
  radiusUnit: 'miles' | 'km';
  radiusDisplay: string;
  totalCamerasInRadius: number;
  camerasInRadius: ClosestCameraNode[];
  activeVehicleLogs: IntersectionTrafficRecord[];
  bookmarkedVehiclesInRadius: BookmarkedVehicle[];
  totalVehiclesLogged: number;
  averageSpeedMph: number;
  speedingCount: number;
  activeBolosCount: number;
  sourceUrl: string;
}


