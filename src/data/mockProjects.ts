import { Project, ActivityUpdate } from '@/types/project';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-101',
    name: 'National Highway-48 Smart Corridor Expansion',
    code: 'NH-48-EXP',
    wbsCode: 'WBS-1.2.04-HWY',
    department: 'Ministry of Road Transport & Highways',
    category: 'Transportation',
    location: 'Maharashtra - Gujarat Border, India',
    description: 'Upgradation of existing 4-lane section to 8-lane smart highway with automated tolling, sensor-based pavement monitoring, and green corridor tree belts.',
    baselineStartDate: '2024-03-01',
    baselineEndDate: '2026-11-30',
    currentProgress: 68,
    plannedProgress: 72,
    status: 'ON_TRACK',
    budget: '₹4,850 Cr',
    spent: '₹3,210 Cr',
    supervisor: 'Col. Rajesh Verma (Retd.)',
    contractor: 'L&T Infrastructure Engineering',
    timelineData: [
      { date: 'Mar 24', plannedProgress: 5, actualProgress: 5, milestone: 'Land Acquisition & Site Survey' },
      { date: 'Jun 24', plannedProgress: 18, actualProgress: 16 },
      { date: 'Sep 24', plannedProgress: 32, actualProgress: 30, milestone: 'Subgrade & Earthworks Complete' },
      { date: 'Dec 24', plannedProgress: 46, actualProgress: 44 },
      { date: 'Mar 25', plannedProgress: 58, actualProgress: 56, milestone: 'Pavement Layer Phase 1' },
      { date: 'Jun 25', plannedProgress: 65, actualProgress: 63 },
      { date: 'Sep 25', plannedProgress: 72, actualProgress: 68, milestone: 'Interchange Viaduct Construction' },
      { date: 'Dec 25', plannedProgress: 82, actualProgress: 76 },
      { date: 'Mar 26', plannedProgress: 90, actualProgress: 86 },
      { date: 'Jun 26', plannedProgress: 96, actualProgress: 93 },
      { date: 'Nov 26', plannedProgress: 100, actualProgress: 100, milestone: 'Commercial Operations' },
    ],
    recentUpdates: [
      {
        id: 'ACT-901',
        timestamp: '2026-03-08 17:45',
        author: 'R. Verma',
        role: 'Chief Project Engineer',
        channel: 'VOICE',
        notes: 'Voice memo transcribed: Segment 4A asphalt layering completed ahead of rain alert. 1.2km paved today. Quality inspection passed for core density.',
        progressDelta: 0.8,
        tags: ['#AsphaltLayer', '#InspectionPassed', '#WeatherSafe'],
      },
      {
        id: 'ACT-902',
        timestamp: '2026-03-06 14:20',
        author: 'S. Kulkarni',
        role: 'Site Surveyor',
        channel: 'EXCEL',
        notes: 'Imported weekly structural ledger: Girder launcher installed on Ch. 44+200 bridge span. Verified 34 precast segments placed.',
        progressDelta: 1.5,
        tags: ['#BridgeSpans', '#GirderPlacement', '#WBSImport'],
      },
      {
        id: 'ACT-903',
        timestamp: '2026-03-03 09:15',
        author: 'A. Gupta',
        role: 'Safety & Compliance Lead',
        channel: 'TEXT',
        notes: 'Monthly safety audit completed with zero LTI. Traffic diversion on bypass sector 2 commissioned seamlessly.',
        progressDelta: 0.4,
        tags: ['#SafetyAudit', '#TrafficDiversion'],
      },
    ],
  },
  {
    id: 'PRJ-102',
    name: 'Bhadla Ultra-Mega Solar Energy Grid Phase IV',
    code: 'SOL-BHD-IV',
    wbsCode: 'WBS-2.1.09-SOL',
    department: 'Ministry of New and Renewable Energy',
    category: 'Energy',
    location: 'Phalodi, Jodhpur District, Rajasthan',
    description: '1,200 MW bifacial solar PV installation with central 400kV gas-insulated substation and integrated 200MWh battery energy storage facility.',
    baselineStartDate: '2024-06-15',
    baselineEndDate: '2026-08-31',
    currentProgress: 82,
    plannedProgress: 79,
    status: 'ON_TRACK',
    budget: '₹6,200 Cr',
    spent: '₹5,140 Cr',
    supervisor: 'Dr. Sunita Deshmukh',
    contractor: 'Tata Power Solar Systems',
    timelineData: [
      { date: 'Jun 24', plannedProgress: 8, actualProgress: 10, milestone: 'Grid Interconnection Clearance' },
      { date: 'Sep 24', plannedProgress: 24, actualProgress: 26 },
      { date: 'Dec 24', plannedProgress: 42, actualProgress: 45, milestone: 'Piling & Tracker Installation' },
      { date: 'Mar 25', plannedProgress: 56, actualProgress: 59 },
      { date: 'Jun 25', plannedProgress: 68, actualProgress: 71, milestone: 'Substation Transformer Erected' },
      { date: 'Sep 25', plannedProgress: 79, actualProgress: 82 },
      { date: 'Dec 25', plannedProgress: 88, actualProgress: 89 },
      { date: 'Apr 26', plannedProgress: 95, actualProgress: 95, milestone: 'Sync with National Grid' },
      { date: 'Aug 26', plannedProgress: 100, actualProgress: 100 },
    ],
    recentUpdates: [
      {
        id: 'ACT-904',
        timestamp: '2026-03-07 16:30',
        author: 'S. Deshmukh',
        role: 'Project Director',
        channel: 'TEXT',
        notes: 'Synchronized String Inverter Block 12 to the 33kV internal ring bus. Generating 65MW in test phase.',
        progressDelta: 1.2,
        tags: ['#InverterSync', '#TestGen', '#SolarPV'],
      },
      {
        id: 'ACT-905',
        timestamp: '2026-03-02 11:10',
        author: 'M. Qureshi',
        role: 'Electrical Supervisor',
        channel: 'VOICE',
        notes: 'Voice note: DC cable trenching in Sector 4 is 100% completed. Commenced robotic module cleaning installation.',
        progressDelta: 0.9,
        tags: ['#DCWiring', '#RoboticCleaning'],
      },
    ],
  },
  {
    id: 'PRJ-103',
    name: 'Metropolitan High-Speed Elevated Metro Viaduct',
    code: 'MET-DEL-E6',
    wbsCode: 'WBS-3.4.18-MET',
    department: 'Ministry of Housing and Urban Affairs',
    category: 'Urban Transit',
    location: 'Bengaluru Outer Ring Road, Karnataka',
    description: 'Construction of 28.5 km double-track elevated viaduct with 14 integrated multi-modal interchange stations and CBTC signaling system.',
    baselineStartDate: '2023-11-01',
    baselineEndDate: '2026-12-15',
    currentProgress: 49,
    plannedProgress: 65,
    status: 'DELAYED',
    budget: '₹8,920 Cr',
    spent: '₹4,750 Cr',
    supervisor: 'Er. Anand Swaminathan',
    contractor: 'HCC-URC Joint Venture',
    timelineData: [
      { date: 'Nov 23', plannedProgress: 6, actualProgress: 5 },
      { date: 'Feb 24', plannedProgress: 15, actualProgress: 13, milestone: 'Geotechnical Soil Investigation' },
      { date: 'May 24', plannedProgress: 25, actualProgress: 21 },
      { date: 'Aug 24', plannedProgress: 36, actualProgress: 29 },
      { date: 'Nov 24', plannedProgress: 48, actualProgress: 38, milestone: 'Pier Casting Sector A' },
      { date: 'Feb 25', plannedProgress: 57, actualProgress: 44 },
      { date: 'Jun 25', plannedProgress: 65, actualProgress: 49, milestone: 'Underground Utility Shifting Lag' },
      { date: 'Oct 25', plannedProgress: 75, actualProgress: 58 },
      { date: 'Feb 26', plannedProgress: 86, actualProgress: 70 },
      { date: 'Jul 26', plannedProgress: 94, actualProgress: 85 },
      { date: 'Dec 26', plannedProgress: 100, actualProgress: 95 },
    ],
    recentUpdates: [
      {
        id: 'ACT-906',
        timestamp: '2026-03-08 19:10',
        author: 'A. Swaminathan',
        role: 'Chief Engineer',
        channel: 'TEXT',
        notes: 'Water supply line relocation at Station 7 completed after coordination with BWSSB. Night-time girder lifting commenced.',
        progressDelta: 0.6,
        tags: ['#UtilityRelocation', '#NightShift', '#PierCap'],
      },
      {
        id: 'ACT-907',
        timestamp: '2026-03-04 18:00',
        author: 'K. Raman',
        role: 'WBS Manager',
        channel: 'EXCEL',
        notes: 'Uploaded revised recovery schedule (WBS v4.1). Added secondary precast yard in Hoskote to accelerate U-girder delivery.',
        progressDelta: 0.3,
        tags: ['#RecoverySchedule', '#PrecastYard'],
      },
    ],
  },
  {
    id: 'PRJ-104',
    name: 'Smart Deep-Sea Container Transshipment Port',
    code: 'PRT-KOC-02',
    wbsCode: 'WBS-4.1.02-MAR',
    department: 'Ministry of Ports, Shipping and Waterways',
    category: 'Maritime',
    location: 'Vizhinjam / Kochi Coastline, Kerala',
    description: 'Deep-draft all-weather automated container transshipment terminal with 3.1 km breakwater, automated quay cranes, and direct railway siding.',
    baselineStartDate: '2024-01-10',
    baselineEndDate: '2026-10-31',
    currentProgress: 61,
    plannedProgress: 67,
    status: 'AT_RISK',
    budget: '₹7,400 Cr',
    spent: '₹4,680 Cr',
    supervisor: 'Capt. Harish Menon',
    contractor: 'Adani Ports & SEZ Infrastructure',
    timelineData: [
      { date: 'Jan 24', plannedProgress: 7, actualProgress: 6 },
      { date: 'Apr 24', plannedProgress: 18, actualProgress: 17, milestone: 'Breakwater Core Dredging' },
      { date: 'Jul 24', plannedProgress: 28, actualProgress: 24, milestone: 'Monsoon Sea Surge Pause' },
      { date: 'Oct 24', plannedProgress: 40, actualProgress: 35 },
      { date: 'Jan 25', plannedProgress: 52, actualProgress: 46, milestone: 'Accropode Armoring Phase 1' },
      { date: 'May 25', plannedProgress: 62, actualProgress: 55 },
      { date: 'Aug 25', plannedProgress: 67, actualProgress: 61, milestone: 'Quay Berth Piling 70%' },
      { date: 'Dec 25', plannedProgress: 78, actualProgress: 73 },
      { date: 'Apr 26', plannedProgress: 88, actualProgress: 84 },
      { date: 'Aug 26', plannedProgress: 96, actualProgress: 92 },
      { date: 'Oct 26', plannedProgress: 100, actualProgress: 100, milestone: 'Trial Vessel Berthing' },
    ],
    recentUpdates: [
      {
        id: 'ACT-908',
        timestamp: '2026-03-08 12:40',
        author: 'H. Menon',
        role: 'Port Operations Lead',
        channel: 'VOICE',
        notes: 'Voice recording: 400 metric tons of quarry rock dumped into seawall chainage 2200. Wave dampener blocks showing steady settlement within tolerance limits.',
        progressDelta: 0.5,
        tags: ['#Breakwater', '#QuarryRock', '#SeaWall'],
      },
      {
        id: 'ACT-909',
        timestamp: '2026-03-01 10:20',
        author: 'P. Nair',
        role: 'Logistics Supervisor',
        channel: 'TEXT',
        notes: 'Customs clearance received for 4 Super Post-Panamax STS cranes arriving from Shanghai. Delivery slated for next month.',
        progressDelta: 0.7,
        tags: ['#CranesArrival', '#PortEquip'],
      },
    ],
  },
  {
    id: 'PRJ-105',
    name: 'National River Basin Clean Waterway & Treatment Hub',
    code: 'WAT-GAN-09',
    wbsCode: 'WBS-5.3.11-ENV',
    department: 'Ministry of Jal Shakti',
    category: 'Water & Environment',
    location: 'Varanasi - Prayagraj Sector, Uttar Pradesh',
    description: '350 MLD advanced sewage treatment network with SCADA-controlled telemetry, bio-gas cogeneration units, and automated effluent discharge monitoring.',
    baselineStartDate: '2023-09-01',
    baselineEndDate: '2025-12-31',
    currentProgress: 96,
    plannedProgress: 95,
    status: 'COMPLETED',
    budget: '₹2,340 Cr',
    spent: '₹2,280 Cr',
    supervisor: 'Smt. Prerna Tripathi',
    contractor: 'VA Tech WABAG Ltd',
    timelineData: [
      { date: 'Sep 23', plannedProgress: 8, actualProgress: 9 },
      { date: 'Dec 23', plannedProgress: 22, actualProgress: 24, milestone: 'Trunk Interceptor Pipe Laying' },
      { date: 'Mar 24', plannedProgress: 40, actualProgress: 42 },
      { date: 'Jun 24', plannedProgress: 56, actualProgress: 58, milestone: 'Clarifier & Bioreactor Basins' },
      { date: 'Sep 24', plannedProgress: 70, actualProgress: 72 },
      { date: 'Dec 24', plannedProgress: 82, actualProgress: 84, milestone: 'SCADA Telemetry Network Online' },
      { date: 'Apr 25', plannedProgress: 90, actualProgress: 92 },
      { date: 'Aug 25', plannedProgress: 95, actualProgress: 96, milestone: 'Full Commissioning & Handover' },
    ],
    recentUpdates: [
      {
        id: 'ACT-910',
        timestamp: '2026-02-28 15:00',
        author: 'P. Tripathi',
        role: 'Chief Environmental Officer',
        channel: 'TEXT',
        notes: 'Final CPCB compliance certificate received. BOD level under 5 mg/L, exceeding national effluent quality standards.',
        progressDelta: 0.5,
        tags: ['#CPCBCertified', '#WaterQuality', '#Commissioned'],
      },
    ],
  },
];

// Helper functions that allow client-side state updates during the session
let projectsStore: Project[] = [...INITIAL_PROJECTS];

export function getProjects(): Project[] {
  return projectsStore;
}

export function getProjectById(id: string): Project | undefined {
  return projectsStore.find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase());
}

export function createProject(newProj: Partial<Project>): Project {
  const id = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
  const code = (newProj.name || 'PRJ')
    .split(' ')
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') + '-' + Math.floor(10 + Math.random() * 90);

  const created: Project = {
    id,
    name: newProj.name || 'Untitled Infrastructure Project',
    code: newProj.code || code,
    wbsCode: newProj.wbsCode || `WBS-1.0.${Math.floor(10 + Math.random() * 90)}`,
    department: newProj.department || 'Ministry of Infrastructure',
    category: newProj.category || 'General Infrastructure',
    location: newProj.location || 'India',
    description: newProj.description || 'Infrastructure development project.',
    baselineStartDate: newProj.baselineStartDate || new Date().toISOString().split('T')[0],
    baselineEndDate: newProj.baselineEndDate || '2027-12-31',
    currentProgress: Number(newProj.currentProgress) || 0,
    plannedProgress: Number(newProj.plannedProgress) || 5,
    status: newProj.status || 'ON_TRACK',
    budget: newProj.budget || '₹1,000 Cr',
    spent: newProj.spent || '₹50 Cr',
    supervisor: newProj.supervisor || 'Site In-Charge',
    contractor: newProj.contractor || 'National EPC Contractors Ltd',
    timelineData: [
      { date: 'M1', plannedProgress: 5, actualProgress: 0, milestone: 'Project Kickoff' },
      { date: 'M6', plannedProgress: 25, actualProgress: 10 },
      { date: 'M12', plannedProgress: 50, actualProgress: 25 },
      { date: 'M18', plannedProgress: 75, actualProgress: 50 },
      { date: 'M24', plannedProgress: 100, actualProgress: 100, milestone: 'Handover' },
    ],
    recentUpdates: [
      {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'Project Admin',
        role: 'Lead Administrator',
        channel: 'TEXT',
        notes: 'Project baseline initialized in system with WBS breakdown.',
        progressDelta: 0,
        tags: ['#BaselineCreated', '#Initialized'],
      },
    ],
  };

  projectsStore = [created, ...projectsStore];
  return created;
}

export function addProjectUpdate(
  projectId: string,
  update: {
    channel: 'EXCEL' | 'TEXT' | 'VOICE';
    notes: string;
    progressDelta: number;
    author?: string;
    tags?: string[];
  }
): Project | undefined {
  const project = projectsStore.find((p) => p.id === projectId);
  if (!project) return undefined;

  const newProgress = Math.min(100, Math.max(0, project.currentProgress + (update.progressDelta || 0)));
  const newActivity: ActivityUpdate = {
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    author: update.author || 'Site Supervisor',
    role: 'Field Supervisor',
    channel: update.channel,
    notes: update.notes,
    progressDelta: update.progressDelta,
    tags: update.tags || ['#DailyLog'],
  };

  project.currentProgress = Math.round(newProgress * 10) / 10;
  project.recentUpdates = [newActivity, ...project.recentUpdates];

  // Update latest timeline point actual progress as well
  if (project.timelineData.length > 0) {
    const lastPoint = project.timelineData[Math.min(project.timelineData.length - 1, 5)];
    if (lastPoint) {
      lastPoint.actualProgress = project.currentProgress;
    }
  }

  return { ...project };
}
