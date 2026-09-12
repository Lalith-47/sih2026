/**
 * InfraTrack 2026 - Central Knowledge Base Provider (Frontend Client)
 * Synchronized with backend knowledge base for instant offline prompts and voice status.
 */

export interface ProjectKnowledge {
  id: string;
  code: string;
  name: string;
  department: string;
  category: string;
  location: string;
  budgetCr: number;
  spentCr: number;
  currentProgressPct: number;
  plannedProgressPct: number;
  variancePct: number;
  status: "ON_TRACK" | "AT_RISK" | "COMPLETED" | "DELAYED";
  contractor: string;
  supervisor: string;
  keyBottlenecks?: string;
  activeSensors: string;
  highlights: string;
}

export const INFRATRACK_KNOWLEDGE_BASE = {
  system: {
    name: "InfraTrack 2026",
    title: "National Digital Twin & SCADA Monitoring Platform",
    initiative: "Smart India Hackathon 2026 (SIH 2026)",
    stakeholder: "Ministry of Statistics and Programme Implementation (MoSPI) & PM Gati Shakti National Master Plan",
    liveUrl: "https://sih2026-beige.vercel.app",
    backendUrl: "https://infratrack-backend-l1d3.onrender.com",
    database: "Neon Serverless PostgreSQL",
    totalPortfolioAllocationCr: 39193,
  },

  corridors: [
    {
      id: "proj-hsr-01",
      code: "DV-HSR-01",
      name: "Delhi-Varanasi High-Speed Rail Corridor",
      department: "National High Speed Rail Corporation Limited (NHSRCL)",
      category: "High-Speed Rail / Bullet Train",
      location: "New Delhi to Varanasi, Uttar Pradesh (865 km)",
      budgetCr: 12000,
      spentCr: 2140,
      currentProgressPct: 18.5,
      plannedProgressPct: 22.0,
      variancePct: -3.5,
      status: "AT_RISK",
      contractor: "Afcons - Larsen & Toubro Consortium",
      supervisor: "Er. Vikramaditya Singh",
      keyBottlenecks: "Deep pier foundation piling challenges in Yamuna river floodplains and 132kV power line relocations near Kanpur South.",
      activeSensors: "48 Tiltmeters, 120 Piezometers, 16 Seismographs active along civil packages 1 to 4.",
      highlights: "High-speed rail corridor engineered for 350 km/h design speed.",
    },
    {
      id: "proj-nh48-02",
      code: "NH-48-EXP",
      name: "National Highway-48 Smart Expressway Corridor",
      department: "Ministry of Road Transport & Highways (MoRTH) / NHAI",
      category: "Smart Expressway & Heavy Freight Corridor",
      location: "Delhi - Gurugram - Jaipur Section (242 km)",
      budgetCr: 4850,
      spentCr: 3210,
      currentProgressPct: 69.3,
      plannedProgressPct: 72.0,
      variancePct: -2.7,
      status: "ON_TRACK",
      contractor: "L&T Infrastructure Engineering",
      supervisor: "Er. Rajesh Verma",
      keyBottlenecks: "Minor drainage culvert reinforcement delays near Bilaspur junction.",
      activeSensors: "Fiber-optic Weigh-in-Motion (WIM) sensors, dynamic automated crack monitoring cameras.",
      highlights: "Dense Bituminous Macadam (DBM) layer laid on 168 km.",
    },
    {
      id: "proj-mthl-03",
      code: "MTHL-PKG-3",
      name: "Mumbai Trans-Harbour Link (MTHL) Package 3",
      department: "Mumbai Metropolitan Region Development Authority (MMRDA)",
      category: "Marine Sea Link & Orthotropic Steel Deck Bridge",
      location: "Sewri (Mumbai) to Chirle (Navi Mumbai) (21.8 km)",
      budgetCr: 17843,
      spentCr: 16500,
      currentProgressPct: 94.0,
      plannedProgressPct: 95.0,
      variancePct: -1.0,
      status: "ON_TRACK",
      contractor: "Daewoo - Tata Projects Joint Venture",
      supervisor: "Dr. Sneha Kulkarni",
      keyBottlenecks: "Final weather-proof expansion joint sealants awaiting monsoon clearance.",
      activeSensors: "Structural health acoustic sensors, strain gauges on orthotropic steel decks.",
      highlights: "Longest sea bridge in India. Load deflection tests completed successfully.",
    },
    {
      id: "proj-rewa-04",
      code: "RUMSP-SOLAR",
      name: "Rewa Ultra Mega Solar Grid Complex",
      department: "Madhya Pradesh Urja Vikas Nigam Limited (MPUVNL) / SECI",
      category: "Renewable Clean Energy & Mega Grid Storage",
      location: "Gurh Tehsil, Rewa District, Madhya Pradesh (1,590 hectares)",
      budgetCr: 4500,
      spentCr: 2300,
      currentProgressPct: 52.0,
      plannedProgressPct: 50.0,
      variancePct: +2.0,
      status: "COMPLETED",
      contractor: "Sterling & Wilson Renewable Energy",
      supervisor: "Er. Ananya Sharma",
      keyBottlenecks: "Inverter station 4 cooling subsystem scheduled for maintenance.",
      activeSensors: "Solar pyranometers, inverter string telemetry, drone thermal surveillance.",
      highlights: "750 MW active commercial generation. Supplies 24% of power to Delhi Metro Rail Corporation.",
    },
  ] as ProjectKnowledge[],
};

/**
 * Clean string for smooth Text-to-Speech (removes markdown symbols, URLs, asterisks)
 */
export function sanitizeForSpeech(text: string): string {
  return text
    .replace(/###\s+/g, "")
    .replace(/##\s+/g, "")
    .replace(/#\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/🎯|⚠️|💰|🛣️|🌉|🚄|☀️|📊|🏗️|✅|🔍|🎙️|🔊/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}
