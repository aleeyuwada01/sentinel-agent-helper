export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type DispatchChannel = 'sms' | 'ussd' | 'whatsapp';
export type AlertLanguage = 'en' | 'ha' | 'ig' | 'yo';

export const languageLabels: Record<AlertLanguage, string> = {
  en: 'English',
  ha: 'Hausa',
  ig: 'Igbo',
  yo: 'Yoruba',
};

export const channelLabels: Record<DispatchChannel, string> = {
  sms: 'SMS',
  ussd: 'USSD',
  whatsapp: 'WhatsApp',
};

export interface AlertDispatch {
  channel: DispatchChannel;
  language: AlertLanguage;
  recipientCount: number;
  sentAt: string;
  deliveredCount: number;
  failedCount: number;
  status: 'sent' | 'delivering' | 'failed';
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  hazardType: 'flood' | 'drought' | 'epidemic' | 'heatwave';
  agency: string;
  state: string;
  lga: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  dispatches: AlertDispatch[];
}

export const alertTemplates: Record<AlertLanguage, Record<string, string>> = {
  en: {
    flood: 'FLOOD WARNING: Rising water levels detected in {state}. Move to higher ground immediately. Contact your focal person for assistance.',
    drought: 'DROUGHT ADVISORY: Water shortage expected in {state}. Conserve water and report to your focal person.',
    epidemic: 'HEALTH ALERT: Disease outbreak reported in {state}. Follow hygiene protocols. Seek medical attention if symptomatic.',
    heatwave: 'HEATWAVE ALERT: Extreme temperatures in {state}. Stay indoors, stay hydrated. Check on vulnerable neighbors.',
  },
  ha: {
    flood: 'GARGADI AMBALIYA: An gano hauhawar ruwa a {state}. Ku matsa zuwa wuraren da suka fi tsayi nan da nan.',
    drought: 'GARGADI FARI: Ana sa ran karancin ruwa a {state}. Ku kiyaye ruwa kuma ku ba da rahoto.',
    epidemic: 'FAƊAKARWA KAN LAFIYA: An samu barkewar cuta a {state}. Ku bi ka\'idojin tsafta.',
    heatwave: 'GARGADI ZAFI: Yanayin zafi sosai a {state}. Ku zauna a cikin gida, ku sha ruwa.',
  },
  ig: {
    flood: 'ỌKWA IDEMMIRI: A chọpụtala mmiri na-arịgo n\'{state}. Gbalaga ngwa ngwa gaa ebe dị elu.',
    drought: 'ỌKWA OKỤ ALA: A na-atụ anya ụkọ mmiri na {state}. Chekwaa mmiri.',
    epidemic: 'ỌKWA AHỤ IKE: E kwuputara ọrịa na {state}. Soro iwu ịdị ọcha.',
    heatwave: 'ỌKWA OKỤ MMIRI: Okpomọkụ kachasị na {state}. Nọrọ n\'ụlọ, ṅụọ mmiri.',
  },
  yo: {
    flood: 'ÌKÌLỌ̀ ÌKÚN OMI: Omi ti ń ga ní {state}. Sá lọ sí ibi gíga lẹ́sẹ̀kẹsẹ̀.',
    drought: 'ÌKÌLỌ̀ ÒGBẸLẸ̀: Àìtó omi ní {state}. Ṣọ́ra pẹ̀lú omi.',
    epidemic: 'ÌKÌLỌ̀ ÌLERA: Àrùn ti ṣẹlẹ̀ ní {state}. Tẹ̀lé ìlànà ìmọ́tótó.',
    heatwave: 'ÌKÌLỌ̀ ÌGBÓNÁlẸ̀: Ooru tó pọ̀ jù ní {state}. Máa dúró sínú ilé, máa mu omi.',
  },
};

export const alertHistory: Alert[] = [
  {
    id: 'ALT-001', title: 'River Niger exceeding warning level at Lokoja', description: 'River level at 8.4m approaching 85% of max capacity. Downstream communities at risk.', severity: 'critical', status: 'active', hazardType: 'flood', agency: 'NIHSA', state: 'Kogi', lga: 'Lokoja', createdAt: '2024-03-24T14:30:00', updatedAt: '2024-03-24T14:30:00',
    dispatches: [
      { channel: 'sms', language: 'en', recipientCount: 1240, sentAt: '2024-03-24T14:31:00', deliveredCount: 1198, failedCount: 42, status: 'sent' },
      { channel: 'whatsapp', language: 'en', recipientCount: 890, sentAt: '2024-03-24T14:31:30', deliveredCount: 885, failedCount: 5, status: 'sent' },
      { channel: 'sms', language: 'ha', recipientCount: 620, sentAt: '2024-03-24T14:32:00', deliveredCount: 610, failedCount: 10, status: 'sent' },
    ],
  },
  {
    id: 'ALT-002', title: 'Extreme heat advisory — Sokoto', description: 'Temperature exceeding 44°C with heat index of 48°C. Vulnerable populations at risk.', severity: 'critical', status: 'active', hazardType: 'heatwave', agency: 'NIMET', state: 'Sokoto', lga: 'Sokoto South', createdAt: '2024-03-24T13:00:00', updatedAt: '2024-03-24T14:15:00',
    dispatches: [
      { channel: 'sms', language: 'ha', recipientCount: 890, sentAt: '2024-03-24T13:01:00', deliveredCount: 878, failedCount: 12, status: 'sent' },
      { channel: 'ussd', language: 'ha', recipientCount: 450, sentAt: '2024-03-24T13:02:00', deliveredCount: 430, failedCount: 20, status: 'sent' },
    ],
  },
  {
    id: 'ALT-003', title: 'Flash flood warning — Benue basin', description: 'Heavy rainfall upstream combined with rising river levels. Flash flooding expected within 6 hours.', severity: 'high', status: 'acknowledged', hazardType: 'flood', agency: 'NIHSA', state: 'Benue', lga: 'Makurdi', createdAt: '2024-03-24T10:00:00', updatedAt: '2024-03-24T11:30:00', acknowledgedBy: 'SEMA Benue',
    dispatches: [
      { channel: 'sms', language: 'en', recipientCount: 560, sentAt: '2024-03-24T10:01:00', deliveredCount: 548, failedCount: 12, status: 'sent' },
      { channel: 'whatsapp', language: 'ig', recipientCount: 320, sentAt: '2024-03-24T10:02:00', deliveredCount: 315, failedCount: 5, status: 'sent' },
    ],
  },
  {
    id: 'ALT-004', title: 'Cholera outbreak monitoring — Adamawa', description: 'Increased cases reported in flood-affected LGAs. Surveillance intensified.', severity: 'medium', status: 'active', hazardType: 'epidemic', agency: 'NCDC', state: 'Adamawa', lga: 'Yola North', createdAt: '2024-03-23T18:00:00', updatedAt: '2024-03-24T09:00:00',
    dispatches: [
      { channel: 'sms', language: 'en', recipientCount: 340, sentAt: '2024-03-23T18:01:00', deliveredCount: 330, failedCount: 10, status: 'sent' },
    ],
  },
  {
    id: 'ALT-005', title: 'Drought conditions worsening — Borno', description: 'Below-average rainfall for 8 consecutive weeks. Crop failure risk elevated.', severity: 'high', status: 'active', hazardType: 'drought', agency: 'NIMET', state: 'Borno', lga: 'Maiduguri', createdAt: '2024-03-22T08:00:00', updatedAt: '2024-03-24T08:00:00',
    dispatches: [
      { channel: 'sms', language: 'ha', recipientCount: 200, sentAt: '2024-03-22T08:01:00', deliveredCount: 195, failedCount: 5, status: 'sent' },
      { channel: 'ussd', language: 'ha', recipientCount: 150, sentAt: '2024-03-22T08:02:00', deliveredCount: 140, failedCount: 10, status: 'sent' },
    ],
  },
  {
    id: 'ALT-006', title: 'Water quality alert — Onitsha', description: 'Turbidity levels exceeding safe limits at 52 NTU. Treatment advisory issued.', severity: 'medium', status: 'acknowledged', hazardType: 'flood', agency: 'NIHSA', state: 'Anambra', lga: 'Onitsha North', createdAt: '2024-03-23T14:00:00', updatedAt: '2024-03-23T16:00:00', acknowledgedBy: 'SEMA Anambra',
    dispatches: [
      { channel: 'whatsapp', language: 'ig', recipientCount: 280, sentAt: '2024-03-23T14:01:00', deliveredCount: 275, failedCount: 5, status: 'sent' },
    ],
  },
  {
    id: 'ALT-007', title: 'Heat stress alert resolved — Kano', description: 'Temperature dropped below 38°C. Advisory lifted.', severity: 'low', status: 'resolved', hazardType: 'heatwave', agency: 'NIMET', state: 'Kano', lga: 'Kano Municipal', createdAt: '2024-03-21T12:00:00', updatedAt: '2024-03-22T18:00:00', acknowledgedBy: 'NEMA Kano',
    dispatches: [],
  },
  {
    id: 'ALT-008', title: 'Flood waters receding — Kwara', description: 'River levels falling at Jebba station. Recovery operations underway.', severity: 'low', status: 'resolved', hazardType: 'flood', agency: 'NIHSA', state: 'Kwara', lga: 'Moro', createdAt: '2024-03-20T09:00:00', updatedAt: '2024-03-23T12:00:00', acknowledgedBy: 'SEMA Kwara',
    dispatches: [],
  },
];

export const trendData = {
  riverLevels: [
    { date: 'Jan', lokoja: 5.2, makurdi: 6.1, jebba: 4.8, onitsha: 4.2 },
    { date: 'Feb', lokoja: 5.8, makurdi: 6.5, jebba: 5.1, onitsha: 4.5 },
    { date: 'Mar', lokoja: 6.4, makurdi: 7.2, jebba: 5.6, onitsha: 5.0 },
    { date: 'Apr', lokoja: 6.9, makurdi: 7.8, jebba: 6.0, onitsha: 5.4 },
    { date: 'May', lokoja: 7.2, makurdi: 8.1, jebba: 6.3, onitsha: 5.8 },
    { date: 'Jun', lokoja: 7.6, makurdi: 8.5, jebba: 6.6, onitsha: 6.1 },
    { date: 'Jul', lokoja: 8.0, makurdi: 8.8, jebba: 6.9, onitsha: 6.4 },
    { date: 'Aug', lokoja: 8.4, makurdi: 9.1, jebba: 7.2, onitsha: 6.8 },
    { date: 'Sep', lokoja: 8.8, makurdi: 8.6, jebba: 7.6, onitsha: 7.0 },
    { date: 'Oct', lokoja: 8.4, makurdi: 9.1, jebba: 7.2, onitsha: 6.8 },
    { date: 'Nov', lokoja: 7.2, makurdi: 7.5, jebba: 6.5, onitsha: 5.9 },
    { date: 'Dec', lokoja: 6.0, makurdi: 6.2, jebba: 5.4, onitsha: 4.8 },
  ],
  temperatures: [
    { date: 'Jan', sokoto: 32, maiduguri: 30, kano: 28, abuja: 30, lagos: 31 },
    { date: 'Feb', sokoto: 35, maiduguri: 33, kano: 31, abuja: 32, lagos: 32 },
    { date: 'Mar', sokoto: 39, maiduguri: 37, kano: 35, abuja: 34, lagos: 32 },
    { date: 'Apr', sokoto: 42, maiduguri: 40, kano: 38, abuja: 35, lagos: 32 },
    { date: 'May', sokoto: 44, maiduguri: 42, kano: 41, abuja: 36, lagos: 33 },
    { date: 'Jun', sokoto: 41, maiduguri: 39, kano: 37, abuja: 34, lagos: 31 },
    { date: 'Jul', sokoto: 36, maiduguri: 34, kano: 32, abuja: 30, lagos: 29 },
    { date: 'Aug', sokoto: 34, maiduguri: 32, kano: 30, abuja: 29, lagos: 28 },
    { date: 'Sep', sokoto: 33, maiduguri: 32, kano: 30, abuja: 29, lagos: 28 },
    { date: 'Oct', sokoto: 38, maiduguri: 36, kano: 34, abuja: 32, lagos: 30 },
    { date: 'Nov', sokoto: 36, maiduguri: 33, kano: 30, abuja: 32, lagos: 31 },
    { date: 'Dec', sokoto: 33, maiduguri: 30, kano: 28, abuja: 31, lagos: 30 },
  ],
  hazardEvents: [
    { month: 'Jan', flood: 2, drought: 5, epidemic: 1, heatwave: 3 },
    { month: 'Feb', flood: 1, drought: 6, epidemic: 1, heatwave: 5 },
    { month: 'Mar', flood: 3, drought: 4, epidemic: 2, heatwave: 8 },
    { month: 'Apr', flood: 5, drought: 3, epidemic: 2, heatwave: 12 },
    { month: 'May', flood: 8, drought: 2, epidemic: 3, heatwave: 10 },
    { month: 'Jun', flood: 14, drought: 1, epidemic: 4, heatwave: 6 },
    { month: 'Jul', flood: 22, drought: 0, epidemic: 6, heatwave: 3 },
    { month: 'Aug', flood: 28, drought: 0, epidemic: 8, heatwave: 2 },
    { month: 'Sep', flood: 25, drought: 0, epidemic: 5, heatwave: 0 },
    { month: 'Oct', flood: 18, drought: 1, epidemic: 3, heatwave: 2 },
    { month: 'Nov', flood: 8, drought: 3, epidemic: 2, heatwave: 4 },
    { month: 'Dec', flood: 3, drought: 4, epidemic: 1, heatwave: 3 },
  ],
};

export interface FeedbackReport {
  id: string;
  focalPersonId: string;
  focalPersonName: string;
  state: string;
  lga: string;
  ward: string;
  type: 'situation_report' | 'feedback' | 'media';
  severity: 'low' | 'moderate' | 'severe' | 'critical';
  hazardType: 'flood' | 'drought' | 'epidemic' | 'heatwave';
  title: string;
  description: string;
  householdsAffected: number;
  mediaUrl?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'actioned';
}

export const feedbackReports: FeedbackReport[] = [
  { id: 'FB-001', focalPersonId: 'FP002', focalPersonName: 'Fatima Yusuf', state: 'FCT', lga: 'Gwagwalada', ward: 'Gwagwalada Central', type: 'situation_report', severity: 'severe', hazardType: 'flood', title: 'Flooding in Gwagwalada Central Ward', description: 'Heavy rains caused flooding in low-lying areas. Access roads submerged. Approximately 45 households displaced.', householdsAffected: 45, createdAt: '2024-03-24T13:45:00', status: 'actioned' },
  { id: 'FB-002', focalPersonId: 'FP004', focalPersonName: 'Musa Bello', state: 'Adamawa', lga: 'Yola North', ward: 'Jimeta Ward', type: 'situation_report', severity: 'critical', hazardType: 'heatwave', title: 'Heat-related illness surge in Jimeta', description: 'Multiple cases of heat exhaustion reported at local health center. Elderly and children most affected.', householdsAffected: 120, createdAt: '2024-03-24T11:20:00', status: 'reviewed' },
  { id: 'FB-003', focalPersonId: 'FP006', focalPersonName: 'Emeka Nwosu', state: 'Imo', lga: 'Owerri Municipal', ward: 'Owerri Municipal', type: 'feedback', severity: 'moderate', hazardType: 'flood', title: 'Community requests more drainage infrastructure', description: 'Community leaders identified key drainage points that need clearing. Willing to provide labor if materials supplied.', householdsAffected: 200, createdAt: '2024-03-24T09:30:00', status: 'pending' },
  { id: 'FB-004', focalPersonId: 'FP007', focalPersonName: 'Hadiza Mohammed', state: 'Borno', lga: 'Maiduguri', ward: 'Maiduguri Metro', type: 'situation_report', severity: 'severe', hazardType: 'drought', title: 'Water source dried up in Maiduguri Metro', description: 'Primary borehole serving 80 households has run dry. Women and children walking 3km for water.', householdsAffected: 80, createdAt: '2024-03-23T16:00:00', status: 'actioned' },
  { id: 'FB-005', focalPersonId: 'FP003', focalPersonName: 'Chinedu Okafor', state: 'Anambra', lga: 'Onitsha North', ward: 'Onitsha North', type: 'media', severity: 'moderate', hazardType: 'flood', title: 'Photos of flooded market area', description: 'Main market access road flooded. Traders unable to reach shops.', householdsAffected: 150, mediaUrl: '/placeholder.svg', createdAt: '2024-03-23T14:15:00', status: 'reviewed' },
  { id: 'FB-006', focalPersonId: 'FP008', focalPersonName: 'Tunde Adeyemi', state: 'Oyo', lga: 'Ibadan North', ward: 'Ibadan North', type: 'feedback', severity: 'low', hazardType: 'epidemic', title: 'Community sensitization completed successfully', description: 'Conducted door-to-door cholera prevention awareness in 200 households. Distributed ORS packets and hygiene kits.', householdsAffected: 455, createdAt: '2024-03-23T10:00:00', status: 'reviewed' },
];
