import type { Camera } from '../types';

export interface CityExternalIntelLink {
  name: string;
  url: string;
  description: string;
  agency: string;
}

export interface CityPresetLocation {
  label: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface PlateStyleConfig {
  state: string;
  stateName: string;
  motto: string;
  bgColorClass: string;
  headerTextColor: string;
  mottoColor: string;
  borderStyle: string;
  fontFamily?: string;
}

export interface MajorCity {
  id: string;
  name: string;
  state: string;
  stateName: string;
  displayName: string;
  tagline: string;
  agencyName: string;
  agencyShort: string;
  center: { lat: number; lng: number };
  defaultZoom: number;
  corridors: string[];
  plateStyle: PlateStyleConfig;
  neighborStates: string[];
  presets: CityPresetLocation[];
  externalIntelLinks: CityExternalIntelLink[];
  cameras: Camera[];
}

// ----------------------------------------------------
// Major Cities Traffic & CCTV Surveillance Registry
// ----------------------------------------------------
export const MAJOR_CITIES: MajorCity[] = [
  // 1. LAS VEGAS, NV
  {
    id: 'las_vegas',
    name: 'Las Vegas',
    state: 'NV',
    stateName: 'Nevada',
    displayName: 'Las Vegas, NV',
    tagline: 'Clark County & Las Vegas Strip Corridor',
    agencyName: 'Nevada Freeway and Arterial System of Transportation (FAST) / NDOT',
    agencyShort: 'NV FAST / NDOT',
    center: { lat: 36.1126, lng: -115.1767 },
    defaultZoom: 13,
    corridors: [
      'Las Vegas Blvd (The Strip)',
      'I-15 Interstate',
      'I-215 Beltway',
      'I-515 / US-95 Freeway',
      'Downtown / Fremont',
      'Flamingo Rd',
      'Tropicana Ave',
      'Sahara Ave',
      'Spring Mountain Rd'
    ],
    plateStyle: {
      state: 'NV',
      stateName: 'NEVADA',
      motto: 'THE SILVER STATE',
      bgColorClass: 'from-slate-100 to-slate-200',
      headerTextColor: 'text-sky-900',
      mottoColor: 'text-slate-600',
      borderStyle: 'border-slate-400'
    },
    neighborStates: ['NV', 'CA', 'AZ', 'UT'],
    presets: [
      { label: 'The Strip (Bellagio & Flamingo)', lat: 36.1126, lng: -115.1767 },
      { label: 'Downtown Fremont St Experience', lat: 36.1699, lng: -115.1438 },
      { label: 'Paradise / UNLV Campus', lat: 36.1070, lng: -115.1430 },
      { label: 'I-15 & Tropicana Corridor', lat: 36.1005, lng: -115.1780 },
      { label: 'Spring Mountain / Chinatown', lat: 36.1265, lng: -115.1900 },
      { label: 'Summerlin / Red Rock Gateway', lat: 36.1700, lng: -115.3000 }
    ],
    externalIntelLinks: [
      {
        name: 'Nevada FAST Traffic Portal',
        url: 'https://bugatti.nvfast.org/',
        description: 'Real-time Clark County CCTV snapshots, DMS signs & sensor loops',
        agency: 'NV FAST'
      },
      {
        name: 'NDOT CCTV Network',
        url: 'https://www.dot.nv.gov/travel-info/cctv-cameras',
        description: 'Statewide Nevada Department of Transportation traffic video feeds',
        agency: 'NDOT'
      },
      {
        name: 'Nevada DMV Plate Specifications',
        url: 'https://dmv.nv.gov/plates.htm',
        description: 'Official Nevada standard & specialty plate formats',
        agency: 'Nevada DMV'
      }
    ],
    cameras: [
      {
        id: 21603,
        name: 'Las Vegas Blvd at Bellagio',
        lat: 36.1126,
        lng: -115.1767,
        corridor: 'Las Vegas Blvd (The Strip)',
        streamUrl: 'https://d1wse1.its.nv.gov:443/vegasxcd04/lv_blvd_bellagio_public.stream/playlist.m3u8',
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/21603.jpeg'
      },
      {
        id: 100,
        name: 'I-15 SB I-515 Interchange (dual)',
        lat: 36.1738,
        lng: -115.1560,
        corridor: 'I-15 Interstate',
        streamUrl: 'https://d1wse1.its.nv.gov:443/vegasxcd04/i15_sb_i515_interchange_dual2_public.stream/playlist.m3u8',
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/100.jpeg'
      },
      {
        id: 30561,
        name: 'Casino Center & Fremont N',
        lat: 36.1706,
        lng: -115.1452,
        corridor: 'Downtown / Fremont',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/30561.jpeg'
      },
      {
        id: 24821,
        name: 'Las Vegas Blvd & Tropicana',
        lat: 36.1011,
        lng: -115.1731,
        corridor: 'Las Vegas Blvd (The Strip)',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/24821.jpeg'
      },
      {
        id: 21531,
        name: 'Las Vegas Blvd at Harmon Median',
        lat: 36.1082,
        lng: -115.1728,
        corridor: 'Las Vegas Blvd (The Strip)',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/21531.jpeg'
      },
      {
        id: 23522,
        name: 'Flamingo Rd & Linq Promenade',
        lat: 36.1151,
        lng: -115.1683,
        corridor: 'Flamingo Rd',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/23522.jpeg'
      },
      {
        id: 21601,
        name: 'Paris & Harmon Ave',
        lat: 36.1095,
        lng: -115.1715,
        corridor: 'Las Vegas Blvd (The Strip)',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/21601.jpeg'
      },
      {
        id: 20112,
        name: 'Sahara Ave & Strip North',
        lat: 36.1448,
        lng: -115.1565,
        corridor: 'Sahara Ave',
        streamUrl: null,
        snapshotUrl: 'https://bugatti.nvfast.org/Snapshots/20112.jpeg'
      }
    ]
  },

  // 2. LOS ANGELES, CA
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    state: 'CA',
    stateName: 'California',
    displayName: 'Los Angeles, CA',
    tagline: 'Caltrans District 7 & LADOT Arterial Network',
    agencyName: 'California Department of Transportation (Caltrans District 7) / LADOT',
    agencyShort: 'Caltrans D7 / LADOT',
    center: { lat: 34.0522, lng: -118.2437 },
    defaultZoom: 12,
    corridors: [
      'I-405 (San Diego Fwy)',
      'I-10 (Santa Monica / San Bernardino Fwy)',
      'US-101 (Hollywood Fwy)',
      'I-5 (Golden State / Santa Ana Fwy)',
      'I-110 / SR-110 (Harbor Fwy / Pasadena Fwy)',
      'Wilshire Blvd Corridor',
      'Santa Monica Blvd',
      'Sunset Blvd / Hollywood',
      'Sepulveda Pass'
    ],
    plateStyle: {
      state: 'CA',
      stateName: 'CALIFORNIA',
      motto: 'DMV.CA.GOV',
      bgColorClass: 'from-slate-50 to-slate-200',
      headerTextColor: 'text-red-700',
      mottoColor: 'text-sky-800',
      borderStyle: 'border-slate-400'
    },
    neighborStates: ['CA', 'NV', 'AZ', 'OR'],
    presets: [
      { label: 'Downtown LA (Staples / Crypto.com Arena)', lat: 34.0430, lng: -118.2673 },
      { label: 'Hollywood Blvd & Highland Ave', lat: 34.1016, lng: -118.3387 },
      { label: 'Santa Monica Pier & Ocean Ave', lat: 34.0110, lng: -118.4950 },
      { label: 'I-405 & Wilshire Blvd Interchange', lat: 34.0583, lng: -118.4611 },
      { label: 'LAX Airport (Century & Sepulveda)', lat: 33.9450, lng: -118.3980 },
      { label: 'US-101 at Cahuenga Pass', lat: 34.1250, lng: -118.3490 }
    ],
    externalIntelLinks: [
      {
        name: 'Caltrans District 7 CCTV Cameras',
        url: 'https://cctv.dot.ca.gov/',
        description: 'Live Los Angeles and Ventura county freeway CCTV feeds',
        agency: 'Caltrans D7'
      },
      {
        name: 'Caltrans QuickMap Portal',
        url: 'https://quickmap.dot.ca.gov/',
        description: 'Statewide California road conditions, lane closures, and real-time CCTV',
        agency: 'Caltrans'
      },
      {
        name: 'California DMV License Plate Catalog',
        url: 'https://www.dmv.ca.gov/portal/vehicle-registration/license-plates-decals-and-placards/',
        description: 'California standardized seven-character numbering format and specifications',
        agency: 'California DMV'
      }
    ],
    cameras: [
      {
        id: 7001,
        name: 'I-110 at 4th St / Downtown LA',
        lat: 34.0538,
        lng: -118.2570,
        corridor: 'I-110 / SR-110 (Harbor Fwy / Pasadena Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7001.jpg'
      },
      {
        id: 7002,
        name: 'I-10 Santa Monica Fwy at Vermont Ave',
        lat: 34.0345,
        lng: -118.2915,
        corridor: 'I-10 (Santa Monica / San Bernardino Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7002.jpg'
      },
      {
        id: 7003,
        name: 'US-101 Hollywood Fwy at Highland Ave',
        lat: 34.1065,
        lng: -118.3395,
        corridor: 'US-101 (Hollywood Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7003.jpg'
      },
      {
        id: 7004,
        name: 'I-405 San Diego Fwy at Wilshire Blvd',
        lat: 34.0575,
        lng: -118.4590,
        corridor: 'I-405 (San Diego Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7004.jpg'
      },
      {
        id: 7005,
        name: 'I-105 at I-405 Sepulveda Interchange',
        lat: 33.9290,
        lng: -118.3750,
        corridor: 'I-405 (San Diego Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7005.jpg'
      },
      {
        id: 7006,
        name: 'I-5 Golden State Fwy at Stadium Way',
        lat: 34.0840,
        lng: -118.2430,
        corridor: 'I-5 (Golden State / Santa Ana Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7006.jpg'
      },
      {
        id: 7007,
        name: 'Wilshire Blvd & Figueroa St (LADOT)',
        lat: 34.0505,
        lng: -118.2590,
        corridor: 'Wilshire Blvd Corridor',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7007.jpg'
      },
      {
        id: 7008,
        name: 'Santa Monica Blvd at 4th St',
        lat: 34.0150,
        lng: -118.4970,
        corridor: 'Santa Monica Blvd',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d7/7008.jpg'
      }
    ]
  },

  // 3. NEW YORK CITY, NY
  {
    id: 'new_york',
    name: 'New York City',
    state: 'NY',
    stateName: 'New York',
    displayName: 'New York City, NY',
    tagline: 'NYC DOT Traffic Management Center & 511NY Network',
    agencyName: 'New York City Department of Transportation (NYC DOT) / 511NY',
    agencyShort: 'NYC DOT / 511NY',
    center: { lat: 40.7128, lng: -74.0060 },
    defaultZoom: 12,
    corridors: [
      'FDR Drive (East River)',
      'West Side Highway (Route 9A)',
      'Broadway & Times Square Midtown',
      'Canal St / Manhattan Chinatown',
      'Brooklyn Bridge / Flatbush Ave',
      'I-278 (BQE / Gowanus Expressway)',
      'I-495 (Long Island Expressway)',
      'Queens Boulevard',
      'Grand Central Parkway'
    ],
    plateStyle: {
      state: 'NY',
      stateName: 'NEW YORK',
      motto: 'EXCELSIOR',
      bgColorClass: 'from-amber-100 to-amber-200',
      headerTextColor: 'text-sky-950',
      mottoColor: 'text-amber-900',
      borderStyle: 'border-amber-400'
    },
    neighborStates: ['NY', 'NJ', 'CT', 'PA'],
    presets: [
      { label: 'Times Square (Broadway & 42nd St)', lat: 40.7580, lng: -73.9855 },
      { label: 'Brooklyn Bridge Manhattan Plaza', lat: 40.7118, lng: -74.0005 },
      { label: 'Grand Central (42nd & Park Ave)', lat: 40.7527, lng: -73.9772 },
      { label: 'FDR Drive at 34th St Heliport', lat: 40.7420, lng: -73.9720 },
      { label: 'Canal St & Broadway (SoHo / Chinatown)', lat: 40.7190, lng: -74.0020 },
      { label: 'Queens Midtown Tunnel Plaza', lat: 40.7485, lng: -73.9685 }
    ],
    externalIntelLinks: [
      {
        name: 'NYC DOT Traffic Management Cameras',
        url: 'https://webcams.nyctmc.org/',
        description: 'Over 900 CCTV cameras across the 5 boroughs of New York City',
        agency: 'NYC DOT'
      },
      {
        name: '511 New York Traffic System',
        url: 'https://511ny.org/',
        description: 'New York State traffic conditions, toll plazas, bridges & highway cameras',
        agency: 'NYSDOT / 511NY'
      },
      {
        name: 'New York DMV License Plate Series',
        url: 'https://dmv.ny.gov/plates/standard-plates',
        description: 'Official New York Excelsior and Empire standard license plate specifications',
        agency: 'New York DMV'
      }
    ],
    cameras: [
      {
        id: 1001,
        name: 'Broadway & 42nd St Times Square',
        lat: 40.7562,
        lng: -73.9863,
        corridor: 'Broadway & Times Square Midtown',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1001/image'
      },
      {
        id: 1002,
        name: 'FDR Drive at E 34th St',
        lat: 40.7428,
        lng: -73.9715,
        corridor: 'FDR Drive (East River)',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1002/image'
      },
      {
        id: 1003,
        name: 'West Side Hwy (Rt 9A) at 14th St',
        lat: 40.7415,
        lng: -74.0090,
        corridor: 'West Side Highway (Route 9A)',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1003/image'
      },
      {
        id: 1004,
        name: 'Canal St & Bowery / Manhattan Bridge',
        lat: 40.7160,
        lng: -73.9960,
        corridor: 'Canal St / Manhattan Chinatown',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1004/image'
      },
      {
        id: 1005,
        name: 'Brooklyn Bridge Manhattan Anchorage',
        lat: 40.7100,
        lng: -74.0010,
        corridor: 'Brooklyn Bridge / Flatbush Ave',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1005/image'
      },
      {
        id: 1006,
        name: 'I-278 BQE at Atlantic Ave',
        lat: 40.6920,
        lng: -73.9980,
        corridor: 'I-278 (BQE / Gowanus Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1006/image'
      },
      {
        id: 1007,
        name: 'I-495 LIE at Queens Blvd',
        lat: 40.7380,
        lng: -73.8740,
        corridor: 'I-495 (Long Island Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1007/image'
      },
      {
        id: 1008,
        name: '5th Ave & 57th St Plaza',
        lat: 40.7628,
        lng: -73.9740,
        corridor: 'Broadway & Times Square Midtown',
        streamUrl: null,
        snapshotUrl: 'https://webcams.nyctmc.org/api/cameras/1008/image'
      }
    ]
  },

  // 4. CHICAGO, IL
  {
    id: 'chicago',
    name: 'Chicago',
    state: 'IL',
    stateName: 'Illinois',
    displayName: 'Chicago, IL',
    tagline: 'IDOT & TravelMidwest Traffic Management Hub',
    agencyName: 'Illinois Department of Transportation (IDOT) / TravelMidwest',
    agencyShort: 'IDOT / TravelMidwest',
    center: { lat: 41.8781, lng: -87.6298 },
    defaultZoom: 12,
    corridors: [
      'I-90/94 (Kennedy / Dan Ryan Expressway)',
      'I-290 (Eisenhower Expressway)',
      'US-41 (DuSable Lake Shore Drive)',
      'I-55 (Stevenson Expressway)',
      'Michigan Ave (Magnificent Mile)',
      'The Loop (Wacker Dr / State St)',
      'I-94 (Edens Expressway)',
      'I-294 (Tri-State Tollway)'
    ],
    plateStyle: {
      state: 'IL',
      stateName: 'ILLINOIS',
      motto: 'LAND OF LINCOLN',
      bgColorClass: 'from-slate-100 to-sky-100',
      headerTextColor: 'text-sky-900',
      mottoColor: 'text-rose-800',
      borderStyle: 'border-sky-300'
    },
    neighborStates: ['IL', 'IN', 'WI', 'MI', 'IA'],
    presets: [
      { label: 'The Loop (Michigan Ave & Wacker Dr)', lat: 41.8885, lng: -87.6245 },
      { label: 'Jane Byrne Interchange (I-90/94 & I-290)', lat: 41.8755, lng: -87.6440 },
      { label: 'Navy Pier & Lake Shore Drive', lat: 41.8920, lng: -87.6140 },
      { label: 'Millennium Park / Art Institute', lat: 41.8825, lng: -87.6230 },
      { label: 'O’Hare Airport (I-190 & I-90 Junction)', lat: 41.9780, lng: -87.8820 },
      { label: 'Dan Ryan (I-90/94) at 35th St (Guaranteed Rate)', lat: 41.8310, lng: -87.6310 }
    ],
    externalIntelLinks: [
      {
        name: 'TravelMidwest Chicago Traffic Cameras',
        url: 'https://travelmidwest.com/',
        description: 'Real-time expressway and arterial video surveillance across Chicagoland',
        agency: 'IDOT / TravelMidwest'
      },
      {
        name: 'City of Chicago Traffic Tracker',
        url: 'https://www.chicago.gov/city/en/depts/cdot.html',
        description: 'Chicago Department of Transportation congestion metrics and arterial sensors',
        agency: 'CDOT'
      },
      {
        name: 'Illinois Secretary of State License Plate Guide',
        url: 'https://www.ilsos.gov/departments/vehicles/license_plate_guide/standard.html',
        description: 'Illinois Land of Lincoln standard and Lincoln portrait plate specs',
        agency: 'Illinois SOS'
      }
    ],
    cameras: [
      {
        id: 4001,
        name: 'I-90/94 Kennedy at Ohio St',
        lat: 41.8925,
        lng: -87.6490,
        corridor: 'I-90/94 (Kennedy / Dan Ryan Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4001.jpg'
      },
      {
        id: 4002,
        name: 'DuSable Lake Shore Dr at Chicago Ave',
        lat: 41.8970,
        lng: -87.6180,
        corridor: 'US-41 (DuSable Lake Shore Drive)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4002.jpg'
      },
      {
        id: 4003,
        name: 'Jane Byrne Interchange (I-90/94 & I-290)',
        lat: 41.8755,
        lng: -87.6440,
        corridor: 'I-290 (Eisenhower Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4003.jpg'
      },
      {
        id: 4004,
        name: 'Michigan Ave & Wacker Drive Bridge',
        lat: 41.8885,
        lng: -87.6245,
        corridor: 'Michigan Ave (Magnificent Mile)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4004.jpg'
      },
      {
        id: 4005,
        name: 'I-55 Stevenson at Damen Ave',
        lat: 41.8380,
        lng: -87.6740,
        corridor: 'I-55 (Stevenson Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4005.jpg'
      },
      {
        id: 4006,
        name: 'I-90/94 Dan Ryan at 47th St',
        lat: 41.8090,
        lng: -87.6320,
        corridor: 'I-90/94 (Kennedy / Dan Ryan Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://travelmidwest.com/cctv/IL/4006.jpg'
      }
    ]
  },

  // 5. HOUSTON, TX
  {
    id: 'houston',
    name: 'Houston',
    state: 'TX',
    stateName: 'Texas',
    displayName: 'Houston, TX',
    tagline: 'Houston TranStar / TxDOT CCTV Matrix',
    agencyName: 'Houston TranStar / Texas Department of Transportation (TxDOT)',
    agencyShort: 'Houston TranStar / TxDOT',
    center: { lat: 29.7604, lng: -95.3698 },
    defaultZoom: 12,
    corridors: [
      'I-10 (Katy Freeway)',
      'I-610 (The Loop / Galleria)',
      'I-45 (Gulf Freeway / North Freeway)',
      'US-59 / I-69 (Southwest Freeway)',
      'Beltway 8 (Sam Houston Tollway)',
      'Westheimer Rd Corridor',
      'Texas Medical Center Corridors',
      'Downtown / Memorial Drive'
    ],
    plateStyle: {
      state: 'TX',
      stateName: 'TEXAS',
      motto: 'THE LONE STAR STATE',
      bgColorClass: 'from-slate-100 to-slate-200',
      headerTextColor: 'text-slate-900',
      mottoColor: 'text-slate-600',
      borderStyle: 'border-slate-400'
    },
    neighborStates: ['TX', 'LA', 'OK', 'NM'],
    presets: [
      { label: 'Downtown Houston (Main & Texas Ave)', lat: 29.7600, lng: -95.3630 },
      { label: 'The Galleria (I-610 & Westheimer Rd)', lat: 29.7400, lng: -95.4610 },
      { label: 'I-10 Katy Fwy at Gessner Rd', lat: 29.7850, lng: -95.5420 },
      { label: 'Texas Medical Center (Fannin & Holcombe)', lat: 29.7080, lng: -95.3990 },
      { label: 'George Bush Intercontinental (IAH Plaza)', lat: 29.9840, lng: -95.3410 }
    ],
    externalIntelLinks: [
      {
        name: 'Houston TranStar CCTV & Travel Times',
        url: 'https://houstontranstar.org/',
        description: 'Consolidated incident management and over 1,000 CCTV freeway cameras',
        agency: 'Houston TranStar'
      },
      {
        name: 'DriveTexas Statewide Map',
        url: 'https://drivetexas.org/',
        description: 'Official TxDOT highway conditions, lane restrictions and radar',
        agency: 'TxDOT'
      },
      {
        name: 'Texas DMV The Texas Classic Plate Guide',
        url: 'https://www.txdmv.gov/motorists/license-plates',
        description: 'Official Texas Classic seven-character license plate specifications',
        agency: 'Texas DMV'
      }
    ],
    cameras: [
      {
        id: 5001,
        name: 'I-10 Katy Fwy at I-610 West Loop',
        lat: 29.7845,
        lng: -95.4560,
        corridor: 'I-10 (Katy Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://traffic.houstontranstar.org/cctv/5001.jpg'
      },
      {
        id: 5002,
        name: 'I-610 West Loop at Westheimer Rd',
        lat: 29.7410,
        lng: -95.4590,
        corridor: 'I-610 (The Loop / Galleria)',
        streamUrl: null,
        snapshotUrl: 'https://traffic.houstontranstar.org/cctv/5002.jpg'
      },
      {
        id: 5003,
        name: 'US-59 / I-69 at Main St / Montrose',
        lat: 29.7310,
        lng: -95.3890,
        corridor: 'US-59 / I-69 (Southwest Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://traffic.houstontranstar.org/cctv/5003.jpg'
      },
      {
        id: 5004,
        name: 'I-45 at Pierce Elevated Downtown',
        lat: 29.7530,
        lng: -95.3720,
        corridor: 'I-45 (Gulf Freeway / North Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://traffic.houstontranstar.org/cctv/5004.jpg'
      },
      {
        id: 5005,
        name: 'Beltway 8 at I-10 Energy Corridor',
        lat: 29.7860,
        lng: -95.5600,
        corridor: 'Beltway 8 (Sam Houston Tollway)',
        streamUrl: null,
        snapshotUrl: 'https://traffic.houstontranstar.org/cctv/5005.jpg'
      }
    ]
  },

  // 6. PHOENIX, AZ
  {
    id: 'phoenix',
    name: 'Phoenix',
    state: 'AZ',
    stateName: 'Arizona',
    displayName: 'Phoenix, AZ',
    tagline: 'ADOT & AZ511 Valley Freeway Network',
    agencyName: 'Arizona Department of Transportation (ADOT) / AZ511',
    agencyShort: 'ADOT / AZ511',
    center: { lat: 33.4484, lng: -112.0740 },
    defaultZoom: 12,
    corridors: [
      'I-10 (Papago Freeway)',
      'Loop 101 (Agua Fria / Pima Fwy)',
      'Loop 202 (Red Mountain / Santan Fwy)',
      'I-17 (Black Canyon Freeway)',
      'SR-51 (Piestewa Freeway)',
      'Camelback Rd',
      'Central Ave Downtown',
      'Scottsdale Rd Corridor'
    ],
    plateStyle: {
      state: 'AZ',
      stateName: 'ARIZONA',
      motto: 'GRAND CANYON STATE',
      bgColorClass: 'from-amber-100 to-rose-100',
      headerTextColor: 'text-amber-950',
      mottoColor: 'text-emerald-900',
      borderStyle: 'border-amber-300'
    },
    neighborStates: ['AZ', 'CA', 'NV', 'UT', 'NM'],
    presets: [
      { label: 'Downtown Phoenix (Central Ave & Washington)', lat: 33.4480, lng: -112.0740 },
      { label: 'I-10 Deck Park Tunnel', lat: 33.4620, lng: -112.0690 },
      { label: 'Camelback Corridor & 24th St (Biltmore)', lat: 33.5090, lng: -112.0300 },
      { label: 'Scottsdale Old Town & Camelback Rd', lat: 33.5020, lng: -111.9260 },
      { label: 'Tempe Mill Ave & ASU Campus', lat: 33.4250, lng: -111.9400 }
    ],
    externalIntelLinks: [
      {
        name: 'AZ511 Arizona Traveler Information',
        url: 'https://az511.gov/',
        description: 'ADOT live highway cameras, travel times, and electronic message boards',
        agency: 'ADOT / AZ511'
      },
      {
        name: 'Arizona MVD Standard Plate Specifications',
        url: 'https://azdot.gov/mvd/vehicle-services/plates-and-placards',
        description: 'Standard desert gradient license plate requirements and guidelines',
        agency: 'Arizona MVD'
      }
    ],
    cameras: [
      {
        id: 6001,
        name: 'I-10 Papago Fwy at 7th St',
        lat: 33.4615,
        lng: -112.0640,
        corridor: 'I-10 (Papago Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://www.az511.gov/cctv/6001.jpg'
      },
      {
        id: 6002,
        name: 'I-17 Black Canyon at Thomas Rd',
        lat: 33.4795,
        lng: -112.1150,
        corridor: 'I-17 (Black Canyon Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://www.az511.gov/cctv/6002.jpg'
      },
      {
        id: 6003,
        name: 'Loop 202 at Scottsdale Rd',
        lat: 33.4350,
        lng: -111.9260,
        corridor: 'Loop 202 (Red Mountain / Santan Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://www.az511.gov/cctv/6003.jpg'
      },
      {
        id: 6004,
        name: 'SR-51 Piestewa Fwy at Camelback Rd',
        lat: 33.5090,
        lng: -112.0360,
        corridor: 'SR-51 (Piestewa Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://www.az511.gov/cctv/6004.jpg'
      },
      {
        id: 6005,
        name: 'Loop 101 Pima at Shea Blvd',
        lat: 33.5820,
        lng: -111.8900,
        corridor: 'Loop 101 (Agua Fria / Pima Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://www.az511.gov/cctv/6005.jpg'
      }
    ]
  },

  // 7. MIAMI, FL
  {
    id: 'miami',
    name: 'Miami',
    state: 'FL',
    stateName: 'Florida',
    displayName: 'Miami, FL',
    tagline: 'FDOT District 6 & SunGuide Traffic Center',
    agencyName: 'Florida Department of Transportation (FDOT District 6) / FL511',
    agencyShort: 'FDOT D6 / FL511',
    center: { lat: 25.7617, lng: -80.1918 },
    defaultZoom: 12,
    corridors: [
      'I-95 (Express Lanes Corridor)',
      'I-395 (MacArthur Causeway / PortMiami)',
      'I-195 (Julia Tuttle Causeway)',
      'SR-826 (Palmetto Expressway)',
      'SR-836 (Dolphin Expressway)',
      'Biscayne Blvd',
      'Brickell Ave Financial District',
      'Ocean Drive & Collins Ave (South Beach)'
    ],
    plateStyle: {
      state: 'FL',
      stateName: 'FLORIDA',
      motto: 'SUNSHINE STATE',
      bgColorClass: 'from-slate-100 to-amber-50',
      headerTextColor: 'text-emerald-800',
      mottoColor: 'text-orange-600',
      borderStyle: 'border-orange-300'
    },
    neighborStates: ['FL', 'GA', 'AL'],
    presets: [
      { label: 'Downtown Miami & Biscayne Blvd', lat: 25.7740, lng: -80.1880 },
      { label: 'Brickell Financial District (Brickell & 8th)', lat: 25.7660, lng: -80.1920 },
      { label: 'South Beach (Ocean Dr & 10th St)', lat: 25.7800, lng: -80.1310 },
      { label: 'I-95 & I-395 Midtown Interchange', lat: 25.7870, lng: -80.2010 },
      { label: 'Miami International Airport (MIA Plaza)', lat: 25.7950, lng: -80.2870 }
    ],
    externalIntelLinks: [
      {
        name: 'Florida 511 Traffic Management',
        url: 'https://fl511.com/',
        description: 'Real-time video cameras, travel advisories, and bridge status across Florida',
        agency: 'FDOT / FL511'
      },
      {
        name: 'Florida Highway Safety and Motor Vehicles (FLHSMV)',
        url: 'https://www.flhsmv.gov/motor-vehicles-tags-titles/personalized-specialty-license-plates/',
        description: 'Florida Sunshine State license plate specs and registration standards',
        agency: 'FLHSMV'
      }
    ],
    cameras: [
      {
        id: 3001,
        name: 'I-95 at I-395 Midtown Interchange',
        lat: 25.7865,
        lng: -80.2015,
        corridor: 'I-95 (Express Lanes Corridor)',
        streamUrl: null,
        snapshotUrl: 'https://fl511.com/cctv/3001.jpg'
      },
      {
        id: 3002,
        name: 'I-395 MacArthur Causeway at PortMiami Tunnel',
        lat: 25.7840,
        lng: -80.1750,
        corridor: 'I-395 (MacArthur Causeway / PortMiami)',
        streamUrl: null,
        snapshotUrl: 'https://fl511.com/cctv/3002.jpg'
      },
      {
        id: 3003,
        name: 'SR-836 Dolphin Fwy at LeJeune Rd (MIA)',
        lat: 25.7820,
        lng: -80.2610,
        corridor: 'SR-836 (Dolphin Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://fl511.com/cctv/3003.jpg'
      },
      {
        id: 3004,
        name: 'Biscayne Blvd at NE 14th St (Adrienne Arsht)',
        lat: 25.7890,
        lng: -80.1890,
        corridor: 'Biscayne Blvd',
        streamUrl: null,
        snapshotUrl: 'https://fl511.com/cctv/3004.jpg'
      },
      {
        id: 3005,
        name: 'SR-826 Palmetto at Flagler St',
        lat: 25.7710,
        lng: -80.3210,
        corridor: 'SR-826 (Palmetto Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://fl511.com/cctv/3005.jpg'
      }
    ]
  },

  // 8. SEATTLE, WA
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    stateName: 'Washington',
    displayName: 'Seattle, WA',
    tagline: 'WSDOT Puget Sound Traffic Camera Network',
    agencyName: 'Washington State Department of Transportation (WSDOT)',
    agencyShort: 'WSDOT',
    center: { lat: 47.6062, lng: -122.3321 },
    defaultZoom: 12,
    corridors: [
      'I-5 (Puget Sound Interstate)',
      'SR-99 (Alaskan Way Tunnel / Aurora Ave)',
      'I-90 (Lake Washington Floating Bridge)',
      'SR-520 (Evergreen Point Floating Bridge)',
      'I-405 (Eastside Corridor)',
      'Pike / Pine Transit Corridor',
      'Mercer Street / South Lake Union'
    ],
    plateStyle: {
      state: 'WA',
      stateName: 'WASHINGTON',
      motto: 'EVERGREEN STATE',
      bgColorClass: 'from-slate-100 to-emerald-50',
      headerTextColor: 'text-rose-900',
      mottoColor: 'text-emerald-900',
      borderStyle: 'border-emerald-300'
    },
    neighborStates: ['WA', 'OR', 'ID', 'BC'],
    presets: [
      { label: 'Downtown Seattle (Pike Place / 1st Ave)', lat: 47.6090, lng: -122.3410 },
      { label: 'I-5 at Ship Canal Bridge', lat: 47.6530, lng: -122.3220 },
      { label: 'SR-99 Alaskan Way Tunnel South Portal', lat: 47.5990, lng: -122.3350 },
      { label: 'I-90 Floating Bridge at Mercer Island', lat: 47.5890, lng: -122.2500 },
      { label: 'South Lake Union (Mercer St & Westlake)', lat: 47.6250, lng: -122.3380 }
    ],
    externalIntelLinks: [
      {
        name: 'WSDOT Puget Sound Live Cameras',
        url: 'https://wsdot.wa.gov/travel/real-time/traffic-cameras',
        description: 'Comprehensive Washington state floating bridge and freeway camera network',
        agency: 'WSDOT'
      },
      {
        name: 'Washington State Department of Licensing (DOL)',
        url: 'https://www.dol.wa.gov/vehicles-and-boats/license-plates/get-license-plates',
        description: 'Mount Rainier standard seven-character plate formats and specifications',
        agency: 'Washington DOL'
      }
    ],
    cameras: [
      {
        id: 2001,
        name: 'I-5 at Ship Canal Bridge North',
        lat: 47.6535,
        lng: -122.3225,
        corridor: 'I-5 (Puget Sound Interstate)',
        streamUrl: null,
        snapshotUrl: 'https://images.wsdot.wa.gov/nw/005vc16880.jpg'
      },
      {
        id: 2002,
        name: 'SR-99 Alaskan Way Tunnel Portal',
        lat: 47.5995,
        lng: -122.3355,
        corridor: 'SR-99 (Alaskan Way Tunnel / Aurora Ave)',
        streamUrl: null,
        snapshotUrl: 'https://images.wsdot.wa.gov/nw/099vc03150.jpg'
      },
      {
        id: 2003,
        name: 'I-90 at Mount Baker Tunnel West',
        lat: 47.5910,
        lng: -122.2960,
        corridor: 'I-90 (Lake Washington Floating Bridge)',
        streamUrl: null,
        snapshotUrl: 'https://images.wsdot.wa.gov/nw/090vc00375.jpg'
      },
      {
        id: 2004,
        name: 'I-5 at Seneca St Downtown',
        lat: 47.6080,
        lng: -122.3310,
        corridor: 'I-5 (Puget Sound Interstate)',
        streamUrl: null,
        snapshotUrl: 'https://images.wsdot.wa.gov/nw/005vc16500.jpg'
      },
      {
        id: 2005,
        name: 'SR-520 at Montlake Interchange',
        lat: 47.6410,
        lng: -122.3040,
        corridor: 'SR-520 (Evergreen Point Floating Bridge)',
        streamUrl: null,
        snapshotUrl: 'https://images.wsdot.wa.gov/nw/520vc00195.jpg'
      }
    ]
  },

  // 9. SAN FRANCISCO / BAY AREA, CA
  {
    id: 'san_francisco',
    name: 'San Francisco',
    state: 'CA',
    stateName: 'California',
    displayName: 'San Francisco, CA',
    tagline: 'Caltrans District 4 & 511.org Bay Area Network',
    agencyName: 'California Department of Transportation (Caltrans District 4) / 511.org',
    agencyShort: 'Caltrans D4 / 511.org',
    center: { lat: 37.7749, lng: -122.4194 },
    defaultZoom: 12,
    corridors: [
      'I-80 (Bay Bridge / James Lick Skyway)',
      'US-101 (Central Freeway / Bayshore)',
      'I-280 (Southern Freeway)',
      'Market Street Corridor',
      'Van Ness Avenue (US-101)',
      'Embarcadero Waterfront',
      'Golden Gate Bridge (US-101)'
    ],
    plateStyle: {
      state: 'CA',
      stateName: 'CALIFORNIA',
      motto: 'DMV.CA.GOV',
      bgColorClass: 'from-slate-50 to-slate-200',
      headerTextColor: 'text-red-700',
      mottoColor: 'text-sky-800',
      borderStyle: 'border-slate-400'
    },
    neighborStates: ['CA', 'NV', 'OR', 'AZ'],
    presets: [
      { label: 'Downtown SF (Market St & Powell St)', lat: 37.7840, lng: -122.4080 },
      { label: 'Bay Bridge Toll Plaza (I-80 Westbound)', lat: 37.8250, lng: -122.3250 },
      { label: 'Golden Gate Bridge Toll Plaza', lat: 37.8080, lng: -122.4760 },
      { label: 'Embarcadero at Ferry Building', lat: 37.7955, lng: -122.3937 },
      { label: 'US-101 at Octavia Blvd / Central Fwy', lat: 37.7710, lng: -122.4230 }
    ],
    externalIntelLinks: [
      {
        name: '511 SF Bay Area Traffic Cameras',
        url: 'https://511.org/',
        description: 'Live traffic, transit and camera feeds across 9 Bay Area counties',
        agency: 'MTC / 511.org'
      },
      {
        name: 'Caltrans District 4 CCTV System',
        url: 'https://cctv.dot.ca.gov/',
        description: 'Bay Area highway cameras including Bay Bridge and Golden Gate corridors',
        agency: 'Caltrans D4'
      }
    ],
    cameras: [
      {
        id: 4101,
        name: 'I-80 Bay Bridge West Span Anchorage',
        lat: 37.7915,
        lng: -122.3850,
        corridor: 'I-80 (Bay Bridge / James Lick Skyway)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d4/4101.jpg'
      },
      {
        id: 4102,
        name: 'US-101 at Golden Gate Toll Plaza',
        lat: 37.8085,
        lng: -122.4760,
        corridor: 'Golden Gate Bridge (US-101)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d4/4102.jpg'
      },
      {
        id: 4103,
        name: 'US-101 at Hospital Curve / 10th St',
        lat: 37.7680,
        lng: -122.4080,
        corridor: 'US-101 (Central Freeway / Bayshore)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d4/4103.jpg'
      },
      {
        id: 4104,
        name: 'I-280 at 6th & Brannan St',
        lat: 37.7760,
        lng: -122.3990,
        corridor: 'I-280 (Southern Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d4/4104.jpg'
      },
      {
        id: 4105,
        name: 'Embarcadero at Mission St',
        lat: 37.7930,
        lng: -122.3920,
        corridor: 'Embarcadero Waterfront',
        streamUrl: null,
        snapshotUrl: 'https://cctv.dot.ca.gov/cctv/d4/4105.jpg'
      }
    ]
  },

  // 10. ATLANTA, GA
  {
    id: 'atlanta',
    name: 'Atlanta',
    state: 'GA',
    stateName: 'Georgia',
    displayName: 'Atlanta, GA',
    tagline: 'GDOT NaviGAtor & 511GA Traffic Center',
    agencyName: 'Georgia Department of Transportation (GDOT) / 511GA',
    agencyShort: 'GDOT / 511GA',
    center: { lat: 33.7490, lng: -84.3880 },
    defaultZoom: 12,
    corridors: [
      'I-75/85 (Downtown Connector)',
      'I-285 (The Perimeter)',
      'I-20 (Ralph David Abernathy Fwy)',
      'GA-400 (Hospitality Highway)',
      'Peachtree Street Corridor',
      'Midtown / Tech Square'
    ],
    plateStyle: {
      state: 'GA',
      stateName: 'GEORGIA',
      motto: 'PEACH STATE',
      bgColorClass: 'from-slate-100 to-amber-50',
      headerTextColor: 'text-slate-900',
      mottoColor: 'text-amber-700',
      borderStyle: 'border-slate-300'
    },
    neighborStates: ['GA', 'FL', 'AL', 'TN', 'NC', 'SC'],
    presets: [
      { label: 'Downtown Connector (I-75/85 at Freedom Pkwy)', lat: 33.7620, lng: -84.3850 },
      { label: 'Midtown (Peachtree St & 10th St)', lat: 33.7820, lng: -84.3840 },
      { label: 'I-285 at GA-400 (The Interchange)', lat: 33.9180, lng: -84.3540 },
      { label: 'Buckhead (Peachtree Rd & Lenox)', lat: 33.8470, lng: -84.3630 },
      { label: 'Hartsfield-Jackson Airport (Camp Creek Pkwy)', lat: 33.6400, lng: -84.4440 }
    ],
    externalIntelLinks: [
      {
        name: 'GDOT 511GA NaviGAtor Live CCTV',
        url: 'https://511ga.org/',
        description: 'Georgia Statewide real-time traffic speeds, cameras, and incident logs',
        agency: 'GDOT / 511GA'
      },
      {
        name: 'Georgia Department of Revenue Motor Vehicle Division',
        url: 'https://dor.georgia.gov/motor-vehicles/license-plates',
        description: 'Georgia standard Peach State license plate requirements',
        agency: 'Georgia DOR'
      }
    ],
    cameras: [
      {
        id: 8001,
        name: 'I-75/85 Downtown Connector at Freedom Pkwy',
        lat: 33.7625,
        lng: -84.3845,
        corridor: 'I-75/85 (Downtown Connector)',
        streamUrl: null,
        snapshotUrl: 'https://511ga.org/cctv/8001.jpg'
      },
      {
        id: 8002,
        name: 'I-285 at GA-400 Interchange',
        lat: 33.9185,
        lng: -84.3545,
        corridor: 'I-285 (The Perimeter)',
        streamUrl: null,
        snapshotUrl: 'https://511ga.org/cctv/8002.jpg'
      },
      {
        id: 8003,
        name: 'I-20 at Capitol Ave Downtown',
        lat: 33.7420,
        lng: -84.3860,
        corridor: 'I-20 (Ralph David Abernathy Fwy)',
        streamUrl: null,
        snapshotUrl: 'https://511ga.org/cctv/8003.jpg'
      },
      {
        id: 8004,
        name: 'Peachtree St at 14th St Midtown',
        lat: 33.7860,
        lng: -84.3840,
        corridor: 'Peachtree Street Corridor',
        streamUrl: null,
        snapshotUrl: 'https://511ga.org/cctv/8004.jpg'
      },
      {
        id: 8005,
        name: 'GA-400 at Lenox Rd Buckhead',
        lat: 33.8510,
        lng: -84.3590,
        corridor: 'GA-400 (Hospitality Highway)',
        streamUrl: null,
        snapshotUrl: 'https://511ga.org/cctv/8005.jpg'
      }
    ]
  },

  // 11. DALLAS-FORT WORTH, TX
  {
    id: 'dallas',
    name: 'Dallas-Fort Worth',
    state: 'TX',
    stateName: 'Texas',
    displayName: 'Dallas-Fort Worth, TX',
    tagline: 'TxDOT DalTrans & DFW Traffic Matrix',
    agencyName: 'Texas Department of Transportation (TxDOT DalTrans)',
    agencyShort: 'TxDOT DalTrans',
    center: { lat: 32.7767, lng: -96.7970 },
    defaultZoom: 12,
    corridors: [
      'I-35E (Stemmons Freeway)',
      'US-75 (Central Expressway)',
      'I-30 (Tom Landry Freeway)',
      'I-635 (LBJ Freeway)',
      'Dallas North Tollway',
      'Woodall Rodgers Freeway',
      'Downtown / Main St'
    ],
    plateStyle: {
      state: 'TX',
      stateName: 'TEXAS',
      motto: 'THE LONE STAR STATE',
      bgColorClass: 'from-slate-100 to-slate-200',
      headerTextColor: 'text-slate-900',
      mottoColor: 'text-slate-600',
      borderStyle: 'border-slate-400'
    },
    neighborStates: ['TX', 'OK', 'AR', 'LA', 'NM'],
    presets: [
      { label: 'Downtown Dallas (Dealey Plaza & Main)', lat: 32.7780, lng: -96.8080 },
      { label: 'Woodall Rodgers at Klyde Warren Park', lat: 32.7890, lng: -96.8010 },
      { label: 'I-35E Stemmons at Oak Lawn', lat: 32.8020, lng: -96.8290 },
      { label: 'I-635 LBJ Fwy at US-75 High Five', lat: 32.9240, lng: -96.7620 },
      { label: 'DFW Airport (International Pkwy)', lat: 32.8998, lng: -97.0403 }
    ],
    externalIntelLinks: [
      {
        name: 'DriveTexas Dallas / Fort Worth Feeds',
        url: 'https://drivetexas.org/',
        description: 'TxDOT real-time cameras across Dallas, Collin, and Tarrant Counties',
        agency: 'TxDOT'
      },
      {
        name: 'Texas DMV Motorist Vehicle Services',
        url: 'https://www.txdmv.gov/',
        description: 'Texas plate formats and commercial registration standards',
        agency: 'Texas DMV'
      }
    ],
    cameras: [
      {
        id: 9001,
        name: 'Woodall Rodgers at Pearl St / Klyde Warren',
        lat: 32.7895,
        lng: -96.8015,
        corridor: 'Woodall Rodgers Freeway',
        streamUrl: null,
        snapshotUrl: 'https://its.txdot.gov/cctv/9001.jpg'
      },
      {
        id: 9002,
        name: 'US-75 Central Expy at Mockingbird Ln',
        lat: 32.8380,
        lng: -96.7760,
        corridor: 'US-75 (Central Expressway)',
        streamUrl: null,
        snapshotUrl: 'https://its.txdot.gov/cctv/9002.jpg'
      },
      {
        id: 9003,
        name: 'I-35E Stemmons at Market Center Blvd',
        lat: 32.7980,
        lng: -96.8220,
        corridor: 'I-35E (Stemmons Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://its.txdot.gov/cctv/9003.jpg'
      },
      {
        id: 9004,
        name: 'I-635 LBJ at US-75 High Five Flyover',
        lat: 32.9245,
        lng: -96.7625,
        corridor: 'I-635 (LBJ Freeway)',
        streamUrl: null,
        snapshotUrl: 'https://its.txdot.gov/cctv/9004.jpg'
      }
    ]
  },

  // 12. WASHINGTON, DC
  {
    id: 'washington_dc',
    name: 'Washington, DC',
    state: 'DC',
    stateName: 'District of Columbia',
    displayName: 'Washington, DC',
    tagline: 'DDOT Capital Region Trafficland System',
    agencyName: 'District Department of Transportation (DDOT) / TrafficLand',
    agencyShort: 'DDOT / TrafficLand',
    center: { lat: 38.9072, lng: -77.0369 },
    defaultZoom: 12,
    corridors: [
      'I-395 (Southwest Freeway / 14th St Bridge)',
      'Constitution Avenue / National Mall',
      'Pennsylvania Avenue NW',
      'I-66 (Theodore Roosevelt Bridge)',
      'I-495 (Capital Beltway)',
      'Connecticut Avenue NW',
      'K Street Business Corridor'
    ],
    plateStyle: {
      state: 'DC',
      stateName: 'WASHINGTON, D.C.',
      motto: 'TAXATION WITHOUT REPRESENTATION',
      bgColorClass: 'from-slate-100 to-slate-200',
      headerTextColor: 'text-red-700',
      mottoColor: 'text-red-700',
      borderStyle: 'border-red-300'
    },
    neighborStates: ['DC', 'MD', 'VA'],
    presets: [
      { label: 'National Mall (Constitution Ave & 14th St)', lat: 38.8920, lng: -77.0320 },
      { label: 'Pennsylvania Ave & 15th St (White House)', lat: 38.8980, lng: -77.0340 },
      { label: 'I-395 at 14th St Bridge Span', lat: 38.8770, lng: -77.0420 },
      { label: 'Dupont Circle (Connecticut Ave)', lat: 38.9097, lng: -77.0435 },
      { label: 'Capitol Hill (Independence Ave & 1st St)', lat: 38.8870, lng: -77.0050 }
    ],
    externalIntelLinks: [
      {
        name: 'DDOT Traffic Cameras / TrafficLand',
        url: 'https://trafficland.com/',
        description: 'District of Columbia and Capital Beltway CCTV surveillance cameras',
        agency: 'DDOT / TrafficLand'
      },
      {
        name: 'District of Columbia DMV Vehicle Plates',
        url: 'https://dmv.dc.gov/service/vehicle-tags',
        description: 'Official District of Columbia standard and specialty registration tags',
        agency: 'DC DMV'
      }
    ],
    cameras: [
      {
        id: 1101,
        name: 'Constitution Ave & 14th St NW',
        lat: 38.8922,
        lng: -77.0325,
        corridor: 'Constitution Avenue / National Mall',
        streamUrl: null,
        snapshotUrl: 'https://trafficland.com/cctv/1101.jpg'
      },
      {
        id: 1102,
        name: 'I-395 at 14th St Bridge River Span',
        lat: 38.8775,
        lng: -77.0425,
        corridor: 'I-395 (Southwest Freeway / 14th St Bridge)',
        streamUrl: null,
        snapshotUrl: 'https://trafficland.com/cctv/1102.jpg'
      },
      {
        id: 1103,
        name: 'Pennsylvania Ave NW at 12th St',
        lat: 38.8950,
        lng: -77.0280,
        corridor: 'Pennsylvania Avenue NW',
        streamUrl: null,
        snapshotUrl: 'https://trafficland.com/cctv/1103.jpg'
      },
      {
        id: 1104,
        name: 'Connecticut Ave NW at Dupont Circle',
        lat: 38.9097,
        lng: -77.0435,
        corridor: 'Connecticut Avenue NW',
        streamUrl: null,
        snapshotUrl: 'https://trafficland.com/cctv/1104.jpg'
      }
    ]
  }
];

// Helper: Find city by ID
export function getCityById(cityId: string): MajorCity {
  return MAJOR_CITIES.find((c) => c.id === cityId) || MAJOR_CITIES[0];
}

// Helper: Calculate distance in meters between two lat/lng coordinates (Haversine formula)
export function calculateGeodesicDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper: Automatically detect the closest major city given coordinates
export function findClosestMajorCity(userLat: number, userLng: number): MajorCity {
  let closestCity = MAJOR_CITIES[0];
  let minDistance = Infinity;

  for (const city of MAJOR_CITIES) {
    const dist = calculateGeodesicDistanceMeters(userLat, userLng, city.center.lat, city.center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return closestCity;
}
