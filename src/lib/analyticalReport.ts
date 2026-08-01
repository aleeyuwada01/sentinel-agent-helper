import { jsPDF } from 'jspdf';
import { toCsv, downloadBlob } from './csv';
import {
  boundaryLabels,
  countryKPI,
  getIncidents,
  getSubRegions,
  allCountryKPIs,
} from '@/data/adminBoundaries';
import { aggregateExposure, exposureFor } from '@/data/exposure';
import type { CountryProfile } from '@/data/westAfrica';
import { countries } from '@/data/westAfrica';

const fmt = (n: number) => n.toLocaleString();

/** Rows used by both the CSV and PDF analytical reports. */
export const analyticalRows = (country: CountryProfile) => {
  const subs = getSubRegions(country.code);
  const kpi = countryKPI(country);
  const exp = aggregateExposure(subs);
  const incidents = getIncidents(country.code);
  const labels = boundaryLabels[country.code];

  const summary: [string, string][] = [
    ['Country', `${country.flag} ${country.name}`],
    ['System', `${country.systemAcronym} — ${country.systemName}`],
    ['Lead agency', country.leadAgency],
    [`${labels.level1} monitored`, fmt(kpi.level1Count)],
    [`${labels.level2} monitored`, fmt(kpi.level2Count)],
    ['Highest risk hazard', `${kpi.highestRiskHazard} (${kpi.highestRiskValue}%)`],
    ['Active incidents', fmt(kpi.activeIncidents)],
    ['Incidents (7d / 30d)', `${kpi.incidents7d} / ${kpi.incidents30d}`],
    ['Households reached', `${fmt(kpi.householdsReached)} / ${fmt(kpi.householdsTargeted)} (${kpi.reachRate}%)`],
    ['People affected', fmt(kpi.peopleAffected)],
    ['Households mapped', fmt(exp.households)],
    ['Building footprints mapped', fmt(exp.buildings)],
    ['Residential / non-residential', `${fmt(exp.residential)} / ${fmt(exp.nonResidential)}`],
    ['Critical facilities', fmt(exp.criticalFacilities)],
    ['Built-up footprint area', `${fmt(exp.footprintHa)} ha`],
    ['Households in hazard extent', fmt(exp.householdsAffected)],
    ['Buildings in hazard extent', `${fmt(exp.buildingsAffected)} (${exp.exposedPercent}%)`],
    ['Report generated', new Date().toUTCString()],
  ];

  return { subs, kpi, exp, incidents, labels, summary };
};

export const downloadAnalyticalCsv = (country: CountryProfile) => {
  const { subs, summary, labels } = analyticalRows(country);

  const headers = [
    'section', labels.level1Singular.toLowerCase(), labels.level2Singular.toLowerCase(),
    'metric', 'value',
  ];
  const rows: (string | number)[][] = summary.map(([k, v]) => ['summary', '', '', k, v]);

  subs.forEach((s) => {
    const e = exposureFor(s);
    rows.push(
      ['boundary', s.parent, s.name, 'dominant_hazard', s.dominantHazard],
      ['boundary', s.parent, s.name, 'risk_percent', s.risk[s.dominantHazard]],
      ['boundary', s.parent, s.name, 'population', s.population],
      ['boundary', s.parent, s.name, 'households', s.households],
      ['boundary', s.parent, s.name, 'households_reached', s.householdsReached],
      ['boundary', s.parent, s.name, 'building_footprints', e.buildings],
      ['boundary', s.parent, s.name, 'buildings_affected', e.buildingsAffected],
      ['boundary', s.parent, s.name, 'households_affected', e.householdsAffected],
      ['boundary', s.parent, s.name, 'footprint_area_ha', e.footprintHa],
      ['boundary', s.parent, s.name, 'critical_facilities', e.criticalFacilities],
      ['boundary', s.parent, s.name, 'focal_person', s.focalPerson.name],
      ['boundary', s.parent, s.name, 'focal_phone', s.focalPerson.phone],
    );
  });

  downloadBlob(
    `${country.code}-analytical-report.csv`,
    'text/csv;charset=utf-8',
    toCsv(headers, rows),
  );
};

export const downloadAnalyticalPdf = (country: CountryProfile) => {
  const { kpi, exp, incidents, labels, summary, subs } = analyticalRows(country);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 44;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let y = margin;

  const nextPage = (needed = 60) => {
    if (y + needed > height - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFillColor(12, 34, 56);
  doc.rect(0, 0, width, 76, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(15);
  doc.text('WAMHEWS — Analytical Report', margin, 34);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  doc.text(`${country.name} · ${country.systemAcronym} · Lead agency ${country.leadAgency}`, margin, 52);
  doc.text(new Date().toUTCString(), margin, 66);
  y = 100;

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text('National summary', margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  summary.forEach(([k, v]) => {
    nextPage(18);
    doc.setTextColor(90, 90, 90);
    doc.text(k, margin, y);
    doc.setTextColor(20, 20, 20);
    doc.text(String(v), margin + 210, y, { maxWidth: width - margin * 2 - 210 });
    y += 14;
  });

  y += 10;
  nextPage(80);
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text(`Top affected ${labels.level2.toLowerCase()}`, margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  kpi.topAffected.forEach((t, i) => {
    nextPage(16);
    doc.text(
      `${i + 1}. ${t.name} (${t.parent}) — risk ${t.risk}% · households ${fmt(t.householdsReached)}/${fmt(t.households)}`,
      margin,
      y,
    );
    y += 13;
  });

  y += 10;
  nextPage(90);
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text('Highest building-footprint exposure', margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  [...subs]
    .map((s) => ({ s, e: exposureFor(s) }))
    .sort((a, b) => b.e.buildingsAffected - a.e.buildingsAffected)
    .slice(0, 10)
    .forEach(({ s, e }, i) => {
      nextPage(16);
      doc.text(
        `${i + 1}. ${s.name} (${s.parent}) — ${fmt(e.buildingsAffected)} of ${fmt(e.buildings)} footprints (${e.exposedPercent}%), ${fmt(e.householdsAffected)} households, ${fmt(e.footprintHa)} ha`,
        margin,
        y,
        { maxWidth: width - margin * 2 },
      );
      y += 13;
    });

  y += 10;
  nextPage(90);
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text('Latest incidents', margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  incidents.slice(0, 12).forEach((inc) => {
    nextPage(30);
    doc.setTextColor(20, 20, 20);
    doc.text(`${inc.title} — ${inc.status.toUpperCase()} (${inc.alertLevel})`, margin, y, {
      maxWidth: width - margin * 2,
    });
    y += 12;
    doc.setTextColor(90, 90, 90);
    doc.text(
      `${inc.level2}, ${inc.level1} · ${inc.parameter} ${inc.reading} / thr ${inc.threshold} · households ${fmt(inc.householdsReached)}/${fmt(inc.householdsTargeted)} · focal ${inc.focalPerson.name}`,
      margin,
      y,
      { maxWidth: width - margin * 2 },
    );
    y += 18;
  });

  doc.save(`${country.code}-analytical-report.pdf`);
};

/** Cross-country comparison export from the West Africa Central Command Center. */
export const downloadRegionalCsv = () => {
  const headers = [
    'country', 'iso3', 'level1_count', 'level2_count', 'highest_risk_hazard', 'highest_risk_value',
    'active_incidents', 'incidents_7d', 'incidents_30d', 'households_reached', 'households_targeted',
    'reach_pct', 'people_affected', 'households_mapped', 'building_footprints',
    'buildings_affected', 'footprint_area_ha',
  ];
  const rows = allCountryKPIs().map((k) => {
    const exp = aggregateExposure(getSubRegions(k.code));
    return [
      k.name, k.code, k.level1Count, k.level2Count, k.highestRiskHazard, k.highestRiskValue,
      k.activeIncidents, k.incidents7d, k.incidents30d, k.householdsReached, k.householdsTargeted,
      k.reachRate, k.peopleAffected, exp.households, exp.buildings, exp.buildingsAffected,
      exp.footprintHa,
    ];
  });
  downloadBlob('wamhews-regional-comparison.csv', 'text/csv;charset=utf-8', toCsv(headers, rows));
};

export const downloadRegionalPdf = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 44;
  const width = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setFillColor(12, 34, 56);
  doc.rect(0, 0, width, 76, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(15);
  doc.text('WAMHEWS — West Africa Command Analytical Report', margin, 38);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  doc.text(new Date().toUTCString(), margin, 58);
  y = 100;

  doc.setTextColor(20, 20, 20);
  allCountryKPIs().forEach((k) => {
    const country = countries.find((c) => c.code === k.code)!;
    const exp = aggregateExposure(getSubRegions(k.code));
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold').setFontSize(11);
    doc.text(`${country.name} — ${country.systemAcronym}`, margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal').setFontSize(9);
    [
      `Highest risk hazard: ${k.highestRiskHazard} (${k.highestRiskValue}%)`,
      `Incidents — active ${k.activeIncidents}, 7d ${k.incidents7d}, 30d ${k.incidents30d}`,
      `Households reached: ${fmt(k.householdsReached)} / ${fmt(k.householdsTargeted)} (${k.reachRate}%)`,
      `Exposure: ${fmt(exp.buildingsAffected)} of ${fmt(exp.buildings)} building footprints, ${fmt(exp.householdsAffected)} households, ${fmt(exp.footprintHa)} ha`,
      `Top affected: ${k.topAffected.map((t) => t.name).join(', ')}`,
    ].forEach((line) => {
      doc.text(line, margin, y, { maxWidth: width - margin * 2 });
      y += 13;
    });
    y += 10;
  });

  doc.save('wamhews-regional-analytical-report.pdf');
};
