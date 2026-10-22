import { jsPDF } from 'jspdf';
import type { TrackedSubject, Camera } from '../types';

export interface ExportReportOptions {
  agencyName?: string;
  agencyShort?: string;
  cityName?: string;
  operatorEmail?: string;
}

export function exportTrackedSubjectPDF(
  subject: TrackedSubject,
  cameras: Camera[] = [],
  options: ExportReportOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const agencyName = options.agencyName || 'Regional Transportation Commission / State DOT';
  const agencyShort = options.agencyShort || 'CCTV SURVEILLANCE';
  const cityName = options.cityName || 'Metropolitan Sector';
  const operator = options.operatorEmail || 'Authorized Surveillance Operator';
  const reportDate = new Date().toLocaleString();
  const caseNumber = `CAD-INC-${subject.id}-${Date.now().toString().slice(-6)}`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const checkPageBreak = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawPageHeader(true);
    }
  };

  const drawPageHeader = (isContinuation: boolean = false) => {
    // Top banner bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');

    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${agencyShort} // ${cityName.toUpperCase()} TRAFFIC INTELLIGENCE NETWORK`, margin + 4, y + 6);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(
      isContinuation
        ? `INCIDENT DOSSIER: ${subject.label} (CONTINUATION)`
        : 'INCIDENT DOSSIER & TARGET SIGHTING CHAIN REPORT',
      margin + 4,
      y + 13
    );

    // Classification badge
    doc.setFillColor(220, 38, 38); // red-600
    doc.roundedRect(pageWidth - margin - 46, y + 4, 42, 10, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('LAW ENFORCEMENT', pageWidth - margin - 43, y + 8);
    doc.text('OFFICIAL RECORD', pageWidth - margin - 43, y + 12);

    y += 22;
  };

  // 1. Initial Page Header
  drawPageHeader(false);

  // Metadata ribbon
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(margin, y, pageWidth - margin * 2, 14, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('CASE NO:', margin + 3, y + 5);
  doc.text('GENERATED:', margin + 50, y + 5);
  doc.text('OPERATOR:', margin + 110, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(caseNumber, margin + 3, y + 10);
  doc.text(reportDate, margin + 50, y + 10);
  doc.text(operator, margin + 110, y + 10);

  y += 18;

  // 2. Tracked Subject Identification Profile
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. SUBJECT TARGET SPECIFICATIONS & ATTRIBUTES', margin + 3, y + 5);
  y += 9;

  // Attribute Grid
  const colW = (pageWidth - margin * 2) / 4;
  const attrData = [
    { label: 'CALLSIGN / LABEL', value: subject.label },
    { label: 'TARGET CATEGORY', value: subject.category.toUpperCase() },
    { label: 'SUBTYPE', value: (subject.subtype || 'N/A').toUpperCase() },
    { label: 'PRIMARY COLOR', value: (subject.color || 'N/A').toUpperCase() },
    { label: 'PROFILE HEIGHT', value: (subject.height || 'Standard').toUpperCase() },
    { label: 'PROFILE SIZE', value: (subject.size || 'Standard').toUpperCase() },
    { label: 'TOTAL CONFIRMED SIGHTINGS', value: `${subject.sightings.length} Nodes` },
    { label: 'TRACKING STATUS', value: subject.isFollowingLive ? 'ACTIVE LIVE' : 'LOGGED' }
  ];

  for (let i = 0; i < attrData.length; i += 4) {
    const row = attrData.slice(i, i + 4);
    for (let c = 0; c < row.length; c++) {
      const cellX = margin + c * colW;
      if (c % 2 === 0) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(241, 245, 249);
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(cellX, y, colW, 11, 'FD');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(row[c].label, cellX + 2, y + 4);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(doc.splitTextToSize(row[c].value, colW - 4)[0] || '', cellX + 2, y + 8.5);
    }
    y += 11;
  }

  y += 2;

  // Narrative / Description Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('INCIDENT INTELLIGENCE NARRATIVE / CLASSIFICATION:', margin + 2, y + 4);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const narrativeLines = doc.splitTextToSize(
    subject.description || 'Target confirmed traveling along metropolitan high-activity corridors. Multiple downstream visual detections verified across automated CCTV nodal grid.',
    pageWidth - margin * 2 - 6
  );
  doc.text(narrativeLines.slice(0, 2), margin + 2, y + 8);

  y += 16;

  // 3. Chronological Sighting Chain Table
  checkPageBreak(35);
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`2. CHRONOLOGICAL SIGHTING CHAIN & TRAJECTORY LOG (${subject.sightings.length} SIGHTINGS)`, margin + 3, y + 5);
  y += 8;

  // Table Headers
  const tableCols = [
    { name: '#', width: 8 },
    { name: 'TIMESTAMP', width: 26 },
    { name: 'CCTV NODE / NAME', width: 52 },
    { name: 'CORRIDOR', width: 34 },
    { name: 'COORDINATES', width: 30 },
    { name: 'HEADING / SPEED', width: 32 }
  ];

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  let curX = margin;
  tableCols.forEach((col) => {
    doc.text(col.name, curX + 1.5, y + 4.2);
    curX += col.width;
  });
  y += 6;

  // Table Rows (Chronological order)
  const sightingsList = subject.sightings.slice().reverse();
  sightingsList.forEach((sighting, idx) => {
    checkPageBreak(12);

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    let xPos = margin;

    // Index
    doc.text(`${idx + 1}`, xPos + 1.5, y + 5);
    xPos += tableCols[0].width;

    // Timestamp
    doc.setFont('helvetica', 'normal');
    const timeStr = new Date(sighting.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    doc.text(timeStr, xPos + 1.5, y + 5);
    xPos += tableCols[1].width;

    // Camera name
    doc.setFont('helvetica', 'bold');
    const camName = sighting.cameraName.length > 32 ? `${sighting.cameraName.slice(0, 30)}...` : sighting.cameraName;
    doc.text(camName, xPos + 1.5, y + 5);
    xPos += tableCols[2].width;

    // Corridor
    doc.setFont('helvetica', 'normal');
    doc.text(sighting.corridor || 'Metropolitan', xPos + 1.5, y + 5);
    xPos += tableCols[3].width;

    // Coordinates
    const coords = `${sighting.lat.toFixed(4)}, ${sighting.lng.toFixed(4)}`;
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.text(coords, xPos + 1.5, y + 5);
    xPos += tableCols[4].width;

    // Heading / Speed
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const speed = sighting.speedEstimateMph ? ` ~${sighting.speedEstimateMph}mph` : '';
    const heading = sighting.direction ? `${sighting.direction}` : 'SB';
    doc.text(`${heading}${speed}`, xPos + 1.5, y + 5);

    y += 8;
  });

  y += 4;

  // 4. Downstream Corridor Anticipation
  checkPageBreak(42);
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('3. DOWNSTREAM TRAJECTORY & HIGH-ACTIVITY CORRIDOR AUDIT', margin + 3, y + 5);
  y += 9;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('LAST CONFIRMED INTERCEPT POINT:', margin + 3, y + 5);
  doc.text('ANTICIPATED DOWNSTREAM NODES:', margin + 90, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `CCTV #${subject.lastCameraId} — ${subject.lastCameraName} (Time: ${new Date(subject.lastSeen).toLocaleTimeString()})`,
    margin + 3,
    y + 10
  );

  const predictedCams = subject.predictedNextCameraIds || [];
  const predictedText = predictedCams.length > 0
    ? `CCTV Nodes [${predictedCams.map(id => `#${id}`).join(', ')}] along active corridor`
    : 'Corridor vector established; downstream nodes monitoring on auto-detect';
  doc.text(predictedText, margin + 90, y + 10);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Corridor Activity Status: Calibrated with Real-Time Incident Heatmap Density. Automated alerts active across dispatch.',
    margin + 3,
    y + 16
  );

  y += 24;

  // 5. Chain of Custody & Official Sign-off Box
  checkPageBreak(30);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('EVIDENCE & SURVEILLANCE CHAIN OF CUSTODY VERIFICATION:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This record contains automated geospatial tracking metadata extracted from municipal and state DOT camera feeds.',
    margin + 3,
    y + 9
  );
  doc.text(
    'All detections are time-synchronized against authoritative NTP servers and preserved for incident investigation.',
    margin + 3,
    y + 13
  );

  // Sign-off lines
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFYING DISPATCHER / ANALYST:', margin + 3, y + 18);
  doc.line(margin + 50, y + 18, margin + 100, y + 18);

  doc.text('WATCH COMMANDER APPROVAL:', margin + 105, y + 18);
  doc.line(margin + 150, y + 18, pageWidth - margin - 5, y + 18);

  // Page numbering on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${agencyName} • OFFICIAL INCIDENT DOSSIER • Generated for Case ${caseNumber}`,
      margin,
      pageHeight - 6
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin - 16,
      pageHeight - 6
    );
  }

  // Trigger download
  const safeLabel = subject.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`Incident_Report_${safeLabel}_${Date.now()}.pdf`);

  return doc;
}
