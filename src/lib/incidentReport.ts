
import { toCsv, downloadBlob } from './csv';
import type { Incident } from '@/data/adminBoundaries';
import type { BoundaryLabels } from '@/data/adminBoundaries';

const fmt = (n: number) => n.toLocaleString();
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const reachPct = (i: Incident) =>
  i.householdsTargeted ? Math.round((i.householdsReached / i.householdsTargeted) * 100) : 0;

const fields = (incident: Incident, labels: BoundaryLabels): [string, string][] => [
  ['Incident ID', incident.id],
  ['Title', incident.title],
  ['Status', incident.status],
  ['Alert level', incident.alertLevel.toUpperCase()],
  ['Hazard', incident.hazard],
  ['Occurred at', when(incident.occurredAt)],
  [labels.level1Singular, incident.level1],
  [labels.level2Singular, incident.level2],
  ['Lead agency', incident.agency],
  ['Cause', incident.cause],
  ['Trigger parameter', incident.parameter],
  ['Reading', incident.reading],
  ['Threshold', incident.threshold],
  ['Households targeted', fmt(incident.householdsTargeted)],
  ['Households reached', `${fmt(incident.householdsReached)} (${reachPct(incident)}%)`],
  ['People affected', fmt(incident.peopleAffected)],
  ['Displaced', fmt(incident.displaced)],
  ['Dissemination channels', incident.channels.join(', ') || '—'],
  ['Focal person', incident.focalPerson.name],
  ['Focal role', incident.focalPerson.role],
  ['Focal phone', incident.focalPerson.phone],
  ['Focal agency', incident.focalPerson.agency],
  ['Last report', incident.focalPerson.lastReport],
  ['Response note', incident.responseNote],
];

export const downloadIncidentCsv = (incident: Incident, labels: BoundaryLabels) => {
  const csv = toCsv(['Field', 'Value'], fields(incident, labels).map(([k, v]) => [k, v]));
  downloadBlob(`${incident.id}-report.csv`, 'text/csv;charset=utf-8', csv);
};

/** Multi-incident export for a whole boundary unit. */
export const downloadIncidentsCsv = (incidents: Incident[], filename: string) => {
  const headers = [
    'incident_id', 'country', 'hazard', 'level1', 'level2', 'title', 'cause', 'parameter',
    'reading', 'threshold', 'agency', 'alert_level', 'occurred_at', 'households_targeted',
    'households_reached', 'reach_pct', 'people_affected', 'displaced', 'channels', 'status',
    'focal_name', 'focal_phone', 'response_note',
  ];
  const rows = incidents.map((i) => [
    i.id, i.countryCode, i.hazard, i.level1, i.level2, i.title, i.cause, i.parameter,
    i.reading, i.threshold, i.agency, i.alertLevel, i.occurredAt, i.householdsTargeted,
    i.householdsReached, reachPct(i), i.peopleAffected, i.displaced, i.channels.join('|'), i.status,
    i.focalPerson.name, i.focalPerson.phone, i.responseNote,
  ]);
  downloadBlob(filename, 'text/csv;charset=utf-8', toCsv(headers, rows));
};

export const downloadIncidentPdf = async (incident: Incident, labels: BoundaryLabels, countryName: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setFillColor(12, 34, 56);
  doc.rect(0, 0, width, 78, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(16);
  doc.text('WAMHEWS — Incident Detail Report', margin, 38);
  doc.setFont('helvetica', 'normal').setFontSize(10);
  doc.text(`${countryName} · ${incident.id} · generated ${when(new Date().toISOString())}`, margin, 58);

  y = 110;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold').setFontSize(13);
  doc.text(doc.splitTextToSize(incident.title, width - margin * 2), margin, y);
  y += 24;

  const addRow = (label: string, value: string) => {
    const lines = doc.splitTextToSize(value || '—', width - margin - 190);
    const height = lines.length * 13 + 6;
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(90, 90, 90);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(20, 20, 20);
    doc.text(lines, margin + 150, y);
    y += height;
    doc.setDrawColor(228, 228, 228);
    doc.line(margin, y - 4, width - margin, y - 4);
  };

  fields(incident, labels).slice(2).forEach(([k, v]) => addRow(k, v));

  doc.setFontSize(8).setTextColor(130, 130, 130);
  doc.text(
    'West Africa Multi-Hazard Early Warning System (WAMHEWS) — shareable incident record.',
    margin,
    doc.internal.pageSize.getHeight() - 24,
  );

  doc.save(`${incident.id}-report.pdf`);
};
