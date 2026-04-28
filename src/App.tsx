/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Map as MapIcon, 
  AlertCircle, 
  Users, 
  Flame, 
  ChevronRight,
  ClipboardList,
  ArrowRight,
  Info,
  Clock,
  Zap,
  Activity,
  Baby,
  PersonStanding,
  Accessibility
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// Types for the AI Analysis
interface PotentialCrisis {
  type: string;
  confidence: number;
}

interface VulnerableGroup {
  type: string;
  count: number;
  priority: 'High' | 'Critical';
}

interface PredictiveRisk {
  name: string;
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  level: 'Low' | 'Medium' | 'High';
}

interface CrisisAnalysis {
  crisisType: string;
  location: string;
  secondaryRisks: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryResponse: string;
  supportResponse: string[];
  safeRoute: string;
  instructions: string[];
  vulnerableGroups: VulnerableGroup[];
  specialAssistance: string;
  predictiveRisks: PredictiveRisk[];
  reasoning: string;
}

const CRISIS_THEMES = {
  Fire: {
    primary: '#f97316',
    secondary: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
    glow: 'rgba(249, 115, 22, 0.4)',
    border: 'rgba(249, 115, 22, 0.2)'
  },
  'Medical Emergency': {
    primary: '#10b981',
    secondary: '#14b8a6',
    background: 'rgba(16, 185, 129, 0.1)',
    glow: 'rgba(16, 185, 129, 0.3)',
    border: 'rgba(16, 185, 129, 0.2)'
  },
  'High-Risk Security Threat': {
    primary: '#ef4444',
    secondary: '#a855f7',
    background: 'rgba(239, 68, 68, 0.1)',
    glow: 'rgba(239, 68, 68, 0.4)',
    border: 'rgba(239, 68, 68, 0.2)'
  },
  'Stampede Risk': {
    primary: '#f59e0b',
    secondary: '#f97316',
    background: 'rgba(245, 158, 11, 0.1)',
    glow: 'rgba(245, 158, 11, 0.3)',
    border: 'rgba(245, 158, 11, 0.2)'
  },
  'Gas Leak': {
    primary: '#84cc16',
    secondary: '#22c55e',
    background: 'rgba(132, 204, 22, 0.1)',
    glow: 'rgba(132, 204, 22, 0.4)',
    border: 'rgba(132, 204, 22, 0.2)'
  },
  default: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    background: 'rgba(59, 130, 246, 0.1)',
    glow: 'rgba(59, 130, 246, 0.4)',
    border: 'rgba(59, 130, 246, 0.2)'
  }
} as const;

// Initial Scenario Template
const INITIAL_SCENARIO = "A fire has broken out on the 2nd floor of a shopping mall. Smoke levels are high and temperature is increasing rapidly. Crowd density is very high near Exit A. Exit B is partially blocked. There are two patients and one elderly person present on the same floor.";

// Predefined Scenarios for Simulation Mode
const SCENARIOS = [
  {
    id: 'fire',
    name: 'FIRE',
    icon: <Flame className="w-3.5 h-3.5" />,
    text: "Crisis: Fire. Location: 2nd Floor Shopping Area. Status: High temperature (480°C), dense smoke spread detected in main corridor."
  },
  {
    id: 'medical',
    name: 'MEDICAL EMERGENCY',
    icon: <Activity className="w-3.5 h-3.5" />,
    text: "Crisis: Medical Emergency. Location: Main Lobby. Status: Person unconscious, suspected cardiac arrest. Immediate ACLS required."
  },
  {
    id: 'security-high',
    name: 'HIGH-RISK SECURITY THREAT',
    icon: <Shield className="w-3.5 h-3.5 text-red-500" />,
    text: "Crisis: Security Threat. Location: South Entrance. Status: Suspicious ballistic discharge, panic movement detected."
  },
  {
    id: 'stampede',
    name: 'CROWD RISK',
    icon: <Users className="w-3.5 h-3.5" />,
    text: "Crisis: Crowd Risk. Location: Entrance Gate. Status: Extreme density (>7 ppl/sqm), flow stagnation at Portal 4."
  },
  {
    id: 'gas-leak',
    name: 'GAS LEAK',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    text: "Crisis: Gas Leak. Location: Storage Wing D. Status: High concentration of toxic ammonia detected. AHU failure reported."
  }
];

// Demo Data for Offline/Safe Mode
const DEMO_DATA: Record<string, { potentials: PotentialCrisis[], analysis: CrisisAnalysis }> = {
  'fire': {
    potentials: [{ type: "Fire", confidence: 98 }],
    analysis: {
      crisisType: "Fire",
      location: "2nd Floor Shopping Area",
      secondaryRisks: ["Smoke Inhalation", "Structural Weakness", "Asphyxiation"],
      severity: "Critical",
      primaryResponse: "Fire Brigade",
      supportResponse: ["Ambulance", "Police", "Evacuation Team"],
      safeRoute: "Exit B North Stairwell (Clear Path)",
      instructions: ["Stay below smoke level", "Avoid structural pillars in Sector B", "Evacuate using North Stairwell"],
      vulnerableGroups: [{ type: "Elderly", count: 3, priority: "Critical" }],
      specialAssistance: "Manual extraction required for 2nd Floor Sector B2.",
      predictiveRisks: [
        { name: "Flashover Risk", trend: "Increasing", level: "High" },
        { name: "Visibility Loss", trend: "Increasing", level: "High" }
      ],
      reasoning: "Thermal sensors confirmed rapid rise to 480°C. Crowd behavioral patterns suggest high panic at Exit A."
    }
  },
  'medical': {
    potentials: [{ type: "Medical Emergency", confidence: 99 }],
    analysis: {
      crisisType: "Medical Emergency",
      location: "Main Lobby",
      secondaryRisks: ["Crowd Congestion", "Stress Response"],
      severity: "High",
      primaryResponse: "Ambulance",
      supportResponse: ["Hospital Staff", "Security"],
      safeRoute: "Clearance of Central Lobby Path",
      instructions: ["Initiate CPR immediately", "Clear 5-meter radius around patient", "Secure elevator access for EMTs"],
      vulnerableGroups: [{ type: "Patient", count: 1, priority: "Critical" }],
      specialAssistance: "ACLS support required. Defibrillator (AED-04) located at Information Desk.",
      predictiveRisks: [
        { name: "Patient Vitals", trend: "Stable", level: "Medium" },
        { name: "Lobby Saturation", trend: "Stable", level: "Low" }
      ],
      reasoning: "Visual AI confirmed collapse pattern. Wearable telemetry from patient triggered critical alert."
    }
  },
  'security-high': {
    potentials: [{ type: "High-Risk Security Threat", confidence: 95 }],
    analysis: {
      crisisType: "High-Risk Security Threat",
      location: "South Entrance",
      secondaryRisks: ["Mass Panic", "Exit Congestion", "Hazardous Asset"],
      severity: "Critical",
      primaryResponse: "Police / Special Forces",
      supportResponse: ["Bomb Squad", "Ambulance", "Surveillance Team"],
      safeRoute: "Shelter in Sector G Secure Safe-Rooms",
      instructions: ["Move to high-security zones", "Follow SILENT protocols", "Building lockdown active"],
      vulnerableGroups: [{ type: "Children", count: 12, priority: "High" }],
      specialAssistance: "Secure Sector G safe rooms. Surveillance focus on Perimeter South.",
      predictiveRisks: [
        { name: "Threat Movement", trend: "Increasing", level: "High" },
        { name: "Containment Gap", trend: "Decreasing", level: "Medium" }
      ],
      reasoning: "Acoustic profiling matches ballistic discharge. Facial recognition tracking armed individual."
    }
  },
  'stampede': {
    potentials: [{ type: "Stampede Risk", confidence: 97 }],
    analysis: {
      crisisType: "Stampede Risk",
      location: "Entrance Gate",
      secondaryRisks: ["Chest Compression", "Exit Block", "Trauma Fall"],
      severity: "High",
      primaryResponse: "Crowd Control",
      supportResponse: ["Police", "Medical"],
      safeRoute: "Alternate Exit C Path via Perimeter 4",
      instructions: ["Do not reverse against flow", "Hold diagonal pattern to reach exits", "Keep arms at chest level"],
      vulnerableGroups: [{ type: "Seniors", count: 5, priority: "High" }],
      specialAssistance: "Deploy tactile markers at Perimeter 4. Redirect crowd using Portal 6.",
      predictiveRisks: [
        { name: "Flow Saturation", trend: "Increasing", level: "High" },
        { name: "Panic Factor", trend: "Increasing", level: "Medium" }
      ],
      reasoning: "Visual AI measures density > 7.0 ppl/sqm. Flow turbulence detected at main entrance bottleneck."
    }
  },
  'gas-leak': {
    potentials: [{ type: "Gas Leak", confidence: 94 }],
    analysis: {
      crisisType: "Gas Leak",
      location: "Storage Wing D",
      secondaryRisks: ["Toxic Plume", "Hypoxia", "Explosion Risk"],
      severity: "Critical",
      primaryResponse: "Hazard Response Team",
      supportResponse: ["Fire Brigade", "Medical", "Evacuation Team"],
      safeRoute: "Cross-wind extraction to Wing A (Secure Flow)",
      instructions: ["Seal vents in Sector D", "Evacuate Wing D immediately", "Move cross-wind towards Wing A"],
      vulnerableGroups: [{ type: "Staff", count: 12, priority: "Critical" }],
      specialAssistance: "Breathing apparatus needed for rescue. AHU shutdown engaged for Sector D.",
      predictiveRisks: [
        { name: "Plume Dispersion", trend: "Increasing", level: "High" },
        { name: "Oxygen Depletion", trend: "Decreasing", level: "High" }
      ],
      reasoning: "Ammonia sensors reporting 280ppm in Storage Wing D. AHU 09 reporting mechanical failure."
    }
  }
};

export default function App() {
  const [scenario, setScenario] = useState(SCENARIOS[0].text);
  const [activeScenarioId, setActiveScenarioId] = useState(SCENARIOS[0].id);
  const [analysis, setAnalysis] = useState<CrisisAnalysis | null>(null);
  const [potentialCrises, setPotentialCrises] = useState<PotentialCrisis[] | null>(null);
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'detecting' | 'confirming' | 'finalizing' | 'completed'>('idle');
  const [confirmedType, setConfirmedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditingScenario, setIsEditingScenario] = useState(false);
  const [dispatchedTeams, setDispatchedTeams] = useState<string[]>([]);
  const [selectedMapFeature, setSelectedMapFeature] = useState<{
    type: 'danger' | 'route' | 'blocked' | 'rescue';
    label: string;
    details: string;
    status: string;
    alternatives?: string[];
  } | null>(null);

  // Sensor simulation state
  const [sensorTelemetry, setSensorTelemetry] = useState<{
    hazardRadius: number;
    hazardPos: { x: number; y: number };
    smokeDensity: number;
    logs: string[];
  }>({
    hazardRadius: 40,
    hazardPos: { x: 100, y: 50 },
    smokeDensity: 0.4,
    logs: ['[SYS] Neural link established', '[DATA] Thermal sensors online']
  });
  
  // Timing state
  const [incidentTime, setIncidentTime] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (incidentTime) {
        setElapsedSeconds(Math.floor((new Date().getTime() - incidentTime.getTime()) / 1000));
      }

      // Simulate real-time sensor flux
      if (analysis) {
        setSensorTelemetry(prev => {
          const newLogs = [...prev.logs];
          if (Math.random() > 0.8) {
            const events = [
              `[SENSOR] Thermal spike in Sector ${Math.floor(Math.random() * 5) + 1}`,
              `[AI] Recalculating pathing latency: ${Math.floor(Math.random() * 10) + 1}ms`,
              `[DATA] Exit ${Math.random() > 0.5 ? 'A' : 'C'} crowd flux detected`,
              `[SYS] Air quality @ 2nd floor medical: ${Math.floor(Math.random() * 20) + 80}%`,
              `[PREDICT] Hazard expansion rate: +${(Math.random() * 0.5).toFixed(2)}m/s`
            ];
            newLogs.push(events[Math.floor(Math.random() * events.length)]);
            if (newLogs.length > 5) newLogs.shift();
          }

          return {
            ...prev,
            hazardRadius: prev.hazardRadius + (Math.random() - 0.5) * 2, // Slight jitter
            smokeDensity: Math.min(0.8, Math.max(0.2, prev.smokeDensity + (Math.random() - 0.5) * 0.05)),
            logs: newLogs
          };
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [incidentTime, analysis]);

  const startAnalysis = async (confirmedChoice?: string, overrideScenarioText?: string, isAutoRun: boolean = true) => {
    console.log("Analysis started for demo simulation");
    const currentScenarioText = overrideScenarioText || scenario;
    
    setLoading(true);
    setDispatchedTeams([]); // Clear dispatch on new analysis
    if (!incidentTime) setIncidentTime(new Date());

    // DEMO-ONLY LOGIC: Find the active scenario ID to use preloaded data
    const matchedScenario = SCENARIOS.find(s => s.text === currentScenarioText) || SCENARIOS.find(s => s.id === activeScenarioId);
    const demoData = matchedScenario ? DEMO_DATA[matchedScenario.id] : null;
    
    try {
      if (!confirmedChoice) {
        // STEP 1: Detection Phase
        setAnalysis(null);
        setConfirmedType(null);
        setPotentialCrises(null);
        setWorkflowStep('detecting');

        // Fast simulation for demo (1.2s detection)
        await new Promise(resolve => setTimeout(resolve, 1200));

        if (demoData) {
          setPotentialCrises(demoData.potentials);
          
          if (isAutoRun) {
            const topChoice = demoData.potentials[0].type;
            setWorkflowStep('finalizing');
            setConfirmedType(topChoice);
            
            // Fast finalization delay (0.8s)
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setAnalysis(demoData.analysis);
            setWorkflowStep('completed');
            if (!responseTime) setResponseTime(new Date());
          } else {
            setWorkflowStep('confirming');
          }
        } else {
          // Fallback if no specific demo data
          setPotentialCrises([{ type: "Incident Detected", confidence: 95 }]);
          setWorkflowStep('confirming');
        }
      } else {
        // STEP 2: Finalization
        setWorkflowStep('finalizing');
        setConfirmedType(confirmedChoice);
        await new Promise(resolve => setTimeout(resolve, 600));

        if (demoData) {
          setAnalysis(demoData.analysis);
          setWorkflowStep('completed');
          if (!responseTime) setResponseTime(new Date());
        } else {
          setAnalysis({
            crisisType: confirmedChoice,
            secondaryRisks: ["General Hazard"],
            severity: "High",
            primaryResponse: "Emergency Response Hub",
            supportResponse: ["Local Security", "Medical Backup"],
            safeRoute: "Egress following primary markers",
            instructions: ["Stay calm", "Move to designated safe zone"],
            vulnerableGroups: [],
            specialAssistance: "None identified.",
            predictiveRisks: [],
            reasoning: "System fallback logic engaged."
          });
          setWorkflowStep('completed');
          if (!responseTime) setResponseTime(new Date());
        }
      }
    } catch (error) {
      console.warn("Simulation error, engaging fallback:", error);
      setWorkflowStep('completed');
    } finally {
      setLoading(false);
    }
  };

  // Force auto-launch on initial mount with full automation
  useEffect(() => {
    console.log("Auto-start triggered on app mount");
    startAnalysis(undefined, undefined, true);
  }, []);

  const currentTheme = analysis?.crisisType && analysis.crisisType in CRISIS_THEMES 
    ? CRISIS_THEMES[analysis.crisisType as keyof typeof CRISIS_THEMES] 
    : CRISIS_THEMES.default;

  return (
    <motion.div 
      initial={false}
      animate={{
        // @ts-ignore - CSS variables are supported by motion
        '--theme-primary': currentTheme.primary,
        '--theme-secondary': currentTheme.secondary,
        '--theme-glow': currentTheme.glow,
        '--theme-border': currentTheme.border,
        '--theme-bg': currentTheme.background,
      }}
      className="min-h-screen bg-midnight text-slate-100 font-sans p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Immersive Background Effects */}
      <AnimatePresence>
        {analysis?.crisisType === 'Fire' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(249, 115, 22, 0.05) 100%)' }}
          >
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" 
            />
          </motion.div>
        )}
        {analysis?.crisisType === 'Gas Leak' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(132, 204, 22, 0.05) 100%)' }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 mix-blend-overlay" />
          </motion.div>
        )}
        {analysis?.crisisType === 'High-Risk Security Threat' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: [0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="fixed inset-0 pointer-events-none z-0 bg-red-900/10 shadow-[inner_0_0_100px_rgba(239,68,68,0.2)]"
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="flex justify-between items-center bg-navy-dark/60 backdrop-blur-xl border border-[var(--theme-border)] p-4 rounded-2xl shadow-2xl relative overflow-hidden z-10 transition-colors duration-500">
        <motion.div 
          animate={{ background: `linear-gradient(to right, ${currentTheme.primary}1A, transparent)` }}
          className="absolute inset-0 pointer-events-none" 
        />
        <div className="flex items-center gap-4 relative z-10">
          <motion.div 
            animate={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 20px ${currentTheme.glow}` }}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
          >
            <Zap className="h-7 w-7 text-white animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">RapidMind <motion.span animate={{ color: currentTheme.primary }}>AI</motion.span></h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Adaptive Crisis Intelligence // V6.0-PREMIUM</p>
              <motion.span 
                animate={{ backgroundColor: `${currentTheme.primary}1A`, borderColor: `${currentTheme.primary}33`, color: `${currentTheme.primary}99` }}
                className="text-[8px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest transition-colors duration-500"
              >
                AI Simulation Mode Active
              </motion.span>
            </div>
          </div>
        </div>

        {/* Time Tracking System */}
        <div className="hidden lg:flex gap-8 items-center font-mono text-[10px]">
          <div className="space-y-1">
            <div className="text-slate-500 uppercase flex items-center gap-1.5"><Clock className="w-3 h-3" style={{ color: currentTheme.primary }} /> Incident Detect</div>
            <div className="text-slate-100">{incidentTime ? incidentTime.toLocaleTimeString() : '--:--:--'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500 uppercase flex items-center gap-1.5"><Zap className="w-3 h-3" style={{ color: currentTheme.primary }} /> Response Init</div>
            <div className="text-slate-100">{responseTime ? responseTime.toLocaleTimeString() : '--:--:--'}</div>
          </div>
          <motion.div 
            animate={{ backgroundColor: `${currentTheme.primary}1A`, borderColor: `${currentTheme.primary}33` }}
            className="border px-4 py-2 rounded-lg transition-colors duration-500"
          >
            <motion.div animate={{ color: currentTheme.primary }} className="uppercase text-[8px] font-bold">Elapsed Response</motion.div>
            <motion.div animate={{ color: currentTheme.primary }} className="text-xl font-black tabular-nums transition-colors duration-500">
              {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
            </motion.div>
          </motion.div>
          <div className="text-right">
            <div className="text-slate-500 uppercase">{currentTime.toLocaleDateString()}</div>
            <div className="text-slate-100 text-lg">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </header>

      {/* Main Bento Grid */}
      {/* Simulation Command Center */}
      <section className="bg-navy-dark/40 backdrop-blur-md border border-glass-border px-4 py-3 rounded-2xl flex flex-wrap items-center gap-4 shadow-lg z-20">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center gap-2 pr-4 border-r border-glass-border">
          <Zap className="w-3 h-3" style={{ color: currentTheme.primary }} />
          Simulation Command
        </label>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
              <button
              key={s.id}
              onClick={() => {
                setScenario(s.text);
                setActiveScenarioId(s.id);
                setWorkflowStep('idle');
                setAnalysis(null);
                setPotentialCrises(null);
                setConfirmedType(null);
                
                // Clear state and trigger immediately with full automation
                startAnalysis(undefined, s.text, true);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all flex items-center gap-2 border ${
                activeScenarioId === s.id
                  ? 'text-white shadow-lg'
                  : 'bg-midnight border-glass-border text-slate-500 hover:text-slate-300'
              }`}
              style={activeScenarioId === s.id ? { 
                backgroundColor: currentTheme.primary, 
                borderColor: currentTheme.primary,
                boxShadow: `0 0 15px ${currentTheme.glow}`
              } : {}}
            >
              {s.icon}
              {s.name}
            </button>
          ))}
          <button 
            onClick={() => {
              setWorkflowStep('idle');
              setAnalysis(null);
              setPotentialCrises(null);
              setConfirmedType(null);
              setIncidentTime(null);
              setResponseTime(null);
              setElapsedSeconds(0);
            }}
            className="ml-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase hover:bg-red-500/20 transition-all"
          >
            Reset System
          </button>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div> SYSTEM READY</div>
          <div>LATENCY: 12ms</div>
        </div>
      </section>

      <main className="grid grid-cols-12 auto-rows-min gap-4 flex-1">
               {/* Scenario Input Card (REPLACEMENT: LIVE INCIDENT STREAM) */}
        <section className="col-span-12 lg:col-span-4 bg-navy-dark border border-glass-border rounded-3xl p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden group">
          <motion.div 
            animate={{ backgroundColor: `${currentTheme.primary}1A` }}
            className="absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-colors"
          />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <motion.div animate={{ backgroundColor: currentTheme.primary }} className="w-2 h-2 rounded-full animate-ping" />
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                <ClipboardList className="w-3 h-3" style={{ color: currentTheme.primary }} />
                Tactical AI Command Feed
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 animate-pulse">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
                LIVE
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px] flex flex-col">
            {/* AI Directive Banner */}
            <div className="mb-4 p-3 bg-slate-900 border border-glass-border rounded-xl shadow-lg flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-white" />
               </div>
               <div className="flex-1">
                  <div className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Current AI Directive</div>
                  <div className="text-[11px] font-black text-slate-100 uppercase italic leading-tight">
                    {analysis ? (
                      analysis.crisisType.includes('Fire') ? 'Evacuate via Exit B immediately. Avoid central corridor.' :
                      analysis.crisisType.includes('Medical') ? 'Clear 10m radius. Dispatch ACLS to Lobby A1.' :
                      analysis.crisisType.includes('Security') ? 'Initiate Lockdown Sector Alpha. Shelter in place.' :
                      analysis.crisisType.includes('Gas') ? 'Evacuate cross-wind to Section C. Seal vents.' :
                      'Maintain egress flow. Priority extraction for elderly.'
                    ) : 'Awaiting sensor sync...'}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
               {sensorTelemetry.logs.map((log, idx) => {
                 const isCrit = log.includes('[SENSOR]') || log.includes('spike') || log.includes('failure');
                 const isWarn = log.includes('[PREDICT]') || log.includes('Expansion');
                 const isData = log.includes('[DATA]');
                 
                 return (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`flex gap-3 text-[10px] font-mono p-2 rounded-lg border leading-none transition-all ${
                       isCrit ? 'bg-red-500/5 border-red-500/10 text-red-400' :
                       isWarn ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
                       isData ? 'bg-blue-500/5 border-blue-500/10 text-blue-400' :
                       'bg-slate-900/50 border-glass-border text-slate-500'
                     }`}
                   >
                     <span className="opacity-40 shrink-0">[{currentTime.toLocaleTimeString([], { hour12: false })}]</span>
                     <span className="flex-1">{log}</span>
                   </motion.div>
                 );
               })}
               {analysis && (
                 <>
                   <div className="flex gap-3 text-[10px] font-mono p-2 rounded-lg border bg-emerald-500/5 border-emerald-500/10 text-emerald-400">
                     <span className="opacity-40 shrink-0">[{currentTime.toLocaleTimeString([], { hour12: false })}]</span>
                     <span className="flex-1">[ANALYZE] {analysis.crisisType} confirmed at {analysis.location}</span>
                   </div>
                   <div className="flex gap-3 text-[10px] font-mono p-2 rounded-lg border bg-emerald-500/5 border-emerald-500/10 text-emerald-400">
                     <span className="opacity-40 shrink-0">[{currentTime.toLocaleTimeString([], { hour12: false })}]</span>
                     <span className="flex-1">[PREDICT] {analysis.predictiveRisks[0]?.name || 'Escalation'} increasing</span>
                   </div>
                 </>
               )}
            </div>

            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setIsEditingScenario(!isEditingScenario)}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-midnight border-glass-border text-slate-400 hover:bg-navy-dark hover:text-slate-100"
              >
                {isEditingScenario ? (
                  <><Shield className="w-3 h-3" /> Secure Feed</>
                ) : (
                  <><Zap className="w-3 h-3" /> System Override</>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Crisis Primary Info Card (COMMAND CENTER LEVEL) */}
        <section className="col-span-12 md:col-span-6 lg:col-span-4 bg-navy-dark border border-glass-border rounded-3xl p-0 flex flex-col shadow-xl min-h-[300px] relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div 
                key="analysis-head"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                {/* Layered Header */}
                <div className="relative p-6 pb-4">
                  <motion.div 
                    animate={{ background: `linear-gradient(135deg, ${currentTheme.primary}22, transparent)` }}
                    className="absolute inset-0 pointer-events-none" 
                  />
                  
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <motion.div 
                          animate={{ 
                            backgroundColor: currentTheme.primary,
                            boxShadow: [
                              `0 0 10px ${currentTheme.glow}`,
                              `0 0 20px ${currentTheme.glow}`,
                              `0 0 10px ${currentTheme.glow}`
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-2 h-2 rounded-full" 
                        />
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Neural Alert Active</label>
                      </div>
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-tighter">Loc: {analysis.location} // {elapsedSeconds}s since detection</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] font-black text-emerald-500 font-mono">CONFIDENCE: 92%</div>
                      <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.h2 
                    animate={{ textShadow: [
                      `0 0 0px transparent`,
                      `0 0 20px ${currentTheme.glow}`,
                      `0 0 0px transparent`
                    ]}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-4xl font-black text-slate-100 uppercase leading-[0.9] tracking-tighter mb-4 italic"
                  >
                    {analysis.crisisType.includes('Fire') ? '🔥 ' : 
                     analysis.crisisType.includes('Medical') ? '🏥 ' : 
                     analysis.crisisType.includes('Security') ? '🚨 ' : 
                     analysis.crisisType.includes('Gas') ? '☣️ ' : 
                     analysis.crisisType.includes('Stampede') ? '👣 ' : '⚡ '}
                    {analysis.crisisType}
                  </motion.h2>

                  {/* Dynamic Status Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Status: {analysis.severity === 'Critical' ? 'Spreading Fast' : 'Monitoring Flow'}</span>
                      <span>{analysis.severity === 'Critical' ? '92%' : '40%'} Escalation</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-glass-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: analysis.severity === 'Critical' ? '92%' : '40%',
                          backgroundColor: analysis.severity === 'Critical' ? '#ef4444' : currentTheme.primary
                        }}
                        className="h-full relative overflow-hidden"
                      >
                        <motion.div 
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Metrics Overlay (SCENARIO SPECIFIC) */}
                <div className="grid grid-cols-3 border-y border-glass-border bg-slate-900/40">
                  {(() => {
                    const type = analysis.crisisType;
                    let indicators = [
                      { label: 'Heat ↑', icon: <Flame className="w-4 h-4 text-orange-500" /> },
                      { label: 'Smoke ↑', icon: <AlertCircle className="w-4 h-4 text-slate-400" /> },
                      { label: 'Crowd ↑', icon: <Users className="w-4 h-4 text-amber-500" /> }
                    ];

                    if (type.includes('Fire')) {
                      indicators = [
                        { label: 'Heat ↑', icon: <Flame className="w-4 h-4 text-orange-500" /> },
                        { label: 'Smoke ↑', icon: <AlertCircle className="w-4 h-4 text-slate-400" /> },
                        { label: 'Spread ↑', icon: <Zap className="w-4 h-4 text-red-500" /> }
                      ];
                    } else if (type.includes('Medical')) {
                      indicators = [
                        { label: 'HR ↓', icon: <Activity className="w-4 h-4 text-red-500" /> },
                        { label: 'O2 ↓', icon: <Zap className="w-4 h-4 text-blue-500" /> },
                        { label: 'Resp ↑', icon: <Clock className="w-4 h-4 text-emerald-500" /> }
                      ];
                    } else if (type.includes('Gas')) {
                      indicators = [
                        { label: 'Toxic ↑', icon: <AlertTriangle className="w-4 h-4 text-purple-500" /> },
                        { label: 'Air ↓', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
                        { label: 'Risk ↑', icon: <AlertCircle className="w-4 h-4 text-amber-500" /> }
                      ];
                    } else if (type.includes('Stampede') || type.includes('Crowd')) {
                      indicators = [
                        { label: 'Density ↑', icon: <Users className="w-4 h-4 text-amber-500" /> },
                        { label: 'Speed ↓', icon: <Activity className="w-4 h-4 text-red-500" /> },
                        { label: 'Panic ↑', icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> }
                      ];
                    } else if (type.includes('Security')) {
                      indicators = [
                        { label: 'Threat ↑', icon: <Shield className="w-4 h-4 text-red-600" /> },
                        { label: 'Suspicious ↑', icon: <AlertCircle className="w-4 h-4 text-amber-600" /> },
                        { label: 'Breach ↑', icon: <Zap className="w-4 h-4 text-emerald-600" /> }
                      ];
                    }

                    return indicators.map((ind, i) => (
                      <div key={i} className={`p-4 ${i < 2 ? 'border-r border-glass-border' : ''} flex flex-col gap-1 items-center justify-center`}>
                        {ind.icon}
                        <div className="text-[10px] font-black text-slate-100 uppercase">{ind.label}</div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Severity Pulse Badge */}
                <div className="p-6 mt-auto">
                   <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xl tracking-tighter uppercase transition-all ${
                    analysis.severity === 'Critical' ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]' :
                    analysis.severity === 'High' ? 'bg-amber-600 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${analysis.severity === 'Critical' ? 'animate-bounce' : ''}`} />
                    {analysis.severity} SEVERITY LEVEL
                    {analysis.severity === 'Critical' && (
                      <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-white ml-2" 
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ) : workflowStep === 'confirming' ? (

              <motion.div 
                key="confirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col gap-4"
              >
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1 block">Step 2: AI Detection Review</label>
                  <h3 className="text-xl font-black text-white uppercase italic">Confirm Crisis Type:</h3>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {potentialCrises?.map((p, idx) => (
                      <button 
                        key={idx}
                        onClick={() => startAnalysis(p.type)}
                        className="w-full bg-midnight border border-glass-border p-3 rounded-xl flex justify-between items-center transition-all group overflow-hidden"
                        style={{ hoverBorderColor: currentTheme.primary }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg bg-navy-dark flex items-center justify-center transition-colors group-hover:bg-theme-p"
                            style={{ '--theme-p': currentTheme.primary } as any}
                          >
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-tight">{p.type}</span>
                        </div>
                        <div className="text-right">
                          <motion.div animate={{ color: currentTheme.primary }} className="text-[10px] font-mono font-bold">{p.confidence}%</motion.div>
                          <div className="text-[8px] text-slate-500 uppercase font-black">Confidence</div>
                        </div>
                      </button>
                  ))}
                  <button 
                    onClick={() => startAnalysis("Other")}
                    className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-center text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase"
                  >
                    Not Listed / Other
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                {workflowStep === 'idle' ? (
                   <>
                    <Activity className="w-10 h-10 text-slate-800" />
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="italic text-slate-700 text-xs tracking-widest uppercase">Ready for neural analysis...</div>
                      <div className="text-[7px] text-emerald-500 font-black uppercase tracking-[0.3em] flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                        Auto-start enabled
                      </div>
                      <span className="text-[8px] text-slate-900 mt-2 block uppercase tracking-widest font-mono">Step 1: AI Detection Scan</span>
                    </div>
                   </>
                ) : (
                   <>
                    <motion.div 
                      animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                      transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1 } }}
                    >
                      <Zap className="w-10 h-10" style={{ color: currentTheme.primary }} />
                    </motion.div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="italic text-xs tracking-[0.2em] font-black uppercase flex items-center gap-2" style={{ color: currentTheme.primary }}>
                        <span className="relative flex h-2 w-2">
                          <motion.span animate={{ backgroundColor: currentTheme.primary }} className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></motion.span>
                          <motion.span animate={{ backgroundColor: currentTheme.primary }} className="relative inline-flex rounded-full h-2 w-2"></motion.span>
                        </span>
                        AI Detecting...
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono animate-pulse uppercase">Scanning Environmental Buffers</div>
                    </div>
                   </>
                )}
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Dispatch Matrix Card */}
        <section className="col-span-12 md:col-span-6 lg:col-span-4 bg-navy-dark border border-glass-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <motion.div animate={{ backgroundColor: `${currentTheme.primary}05` }} className="absolute top-0 right-0 w-24 h-24 blur-2xl" />
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 block border-b border-glass-border pb-2 flex justify-between items-center">
            Resource Dispatch Matrix
            <span className="text-[8px] opacity-60">Multi-Agency Sync</span>
          </label>
          <div className="space-y-4">
            {analysis ? (
              <>
                <div>
                  <label className="text-[8px] uppercase tracking-[0.2em] text-slate-600 block mb-2 font-black">Primary Response (Auto-Dispatched)</label>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    animate={{ borderColor: currentTheme.primary, backgroundColor: `${currentTheme.primary}0D` }}
                    className="flex items-center gap-4 p-4 rounded-2xl border shadow-lg relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-navy-dark flex items-center justify-center text-2xl shadow-inner border border-glass-border">
                      {analysis.primaryResponse.toLowerCase().includes('fire') ? '🚒' : 
                       analysis.primaryResponse.toLowerCase().includes('amb') ? '🚑' : 
                       analysis.primaryResponse.toLowerCase().includes('pol') ? '🚓' : 
                       analysis.primaryResponse.toLowerCase().includes('haz') ? '☣️' : '🔥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-slate-100 leading-tight uppercase tracking-tight">{analysis.primaryResponse}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-emerald-500 font-bold uppercase text-[9px]">En Route // ETA 180s</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-[0.2em] text-slate-600 block mb-2 font-black">Recommended Alerts (Support)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.supportResponse.map((alert, idx) => {
                      const isDispatched = dispatchedTeams.includes(alert);
                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0, 
                            borderColor: isDispatched ? `${currentTheme.primary}CC` : `${currentTheme.primary}1A`,
                            backgroundColor: isDispatched ? `${currentTheme.primary}1A` : 'rgba(0,0,0,0.2)',
                            boxShadow: isDispatched ? `0 0 15px ${currentTheme.glow}` : 'none'
                          }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 p-2.5 rounded-xl border group hover:border-slate-700 transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="w-8 h-8 rounded-lg bg-navy-dark flex items-center justify-center text-sm border border-glass-border">
                            {alert.toLowerCase().includes('fire') ? '👨‍🚒' : 
                             alert.toLowerCase().includes('amb') || alert.toLowerCase().includes('med') ? '🧑‍⚕️' : 
                             alert.toLowerCase().includes('pol') ? '👮' : 
                             alert.toLowerCase().includes('evac') ? '🏃' : '🛡️'}
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-200 transition-colors">
                              {alert}
                            </div>
                            <div className={`text-[8px] font-mono font-bold ${isDispatched ? 'text-emerald-500' : 'text-slate-600'}`}>
                              {isDispatched ? 'DEPLOYED / EN ROUTE // ETA: 2m' : 'Standby Queue // Ready'}
                            </div>
                          </div>
                          <button 
                            onClick={() => !isDispatched && setDispatchedTeams([...dispatchedTeams, alert])}
                            disabled={isDispatched}
                            className={`text-[9px] font-black px-2 py-1 rounded border transition-all ${
                              isDispatched 
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 cursor-default' 
                                : 'bg-navy-dark border-glass-border text-slate-500 hover:text-white hover:border-slate-500'
                            }`}
                          >
                            {isDispatched ? 'DISPATCHED' : 'DISPATCH'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                  {dispatchedTeams.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-2xl bg-slate-900/50 border border-glass-border flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-navy-dark flex items-center justify-center">
                        <Zap className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-relaxed">
                        AI recommends <span className="text-amber-500">additional support</span> based on risk escalation.
                      </p>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-800 py-16 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-800 animate-spin" />
                Awaiting Resource Assignment...
              </div>
            )}
          </div>
        </section>

        {/* People-Aware Intelligence Layer (HUMAN DATA UPGRADE) */}
        <section className="col-span-12 lg:col-span-3 bg-navy-dark border border-glass-border rounded-3xl p-6 flex flex-col shadow-xl">
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black mb-6 block flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: currentTheme.primary }} />
            Human Rescue Matrix
          </label>
          <div className="space-y-4 flex-1">
            {analysis?.vulnerableGroups?.map((group, idx) => {
               const isCritical = group.priority === 'Critical';
               return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    borderColor: isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'
                  }}
                  className="bg-midnight/60 border p-4 rounded-3xl relative overflow-hidden group hover:bg-slate-900 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isCritical ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {group.type.toLowerCase().includes('child') ? <Baby className="w-5 h-5" /> : 
                         group.type.toLowerCase().includes('elder') ? <PersonStanding className="w-5 h-5" /> : 
                         <Accessibility className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-slate-100">{group.type} ({group.count})</div>
                        <div className="text-[8px] font-mono text-slate-500 mt-0.5">Sector B2 // Flow Alpha</div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      isCritical ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {group.priority}
                    </div>
                  </div>
                </motion.div>
               )
            }) || <div className="text-slate-800 text-[10px] font-bold uppercase tracking-widest text-center py-8">Scanning for Egress Paths...</div>}
            
            {analysis && (
              <div className="mt-auto p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Rescue AI Strategy</span>
                </div>
                <p className="text-[10px] text-slate-300 italic font-bold">
                  “Prioritize elderly extraction via Portal 4. Direct youth groups toward East Stairwell A.”
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Tactical Map Section */}
        <section className="col-span-12 lg:col-span-6 bg-navy-dark border border-glass-border rounded-[2.5rem] relative overflow-hidden flex flex-col p-8 min-h-[450px] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
          <div className="relative flex justify-between items-start mb-8 z-10">
            <div>
               <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <MapIcon className="w-3 h-3" style={{ color: currentTheme.primary }} />
                 Tactical Evacuation Overlay // Floor 02
               </div>
               <motion.div animate={{ color: `${currentTheme.primary}80` }} className="text-[8px] font-mono mt-1 uppercase">Dynamic Pathfinding Active</motion.div>
             </div>
             <div className="flex gap-2">
                <div className="hidden sm:flex flex-col items-end gap-1 px-3 py-1 bg-midnight border border-glass-border rounded-lg">
                   <div className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Sensor Telemetry Log</div>
                   <div className="flex flex-col gap-0.5 items-end">
                      {sensorTelemetry.logs.slice(-2).map((log, i) => (
                        <div key={i} className="text-[8px] font-mono text-emerald-500/80 truncate max-w-[150px] leading-none">{log}</div>
                      ))}
                   </div>
                </div>
                <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black rounded-lg uppercase tracking-tighter shadow-[0_0_10px_rgba(239,68,68,0.1)]">Live Hazard Tracking</div>
             </div>
          </div>
          
          <div className="relative flex-1 bg-midnight border border-glass-border rounded-3xl p-6 z-10 flex flex-col items-center justify-center shadow-inner">
            {/* Live Data Feed Overlay Labels */}
            <div className="absolute top-4 left-6 z-20 pointer-events-none space-y-1">
               {analysis?.crisisType === 'Fire' && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                     <span className="text-[8px] font-mono text-red-400 uppercase">Thermal Origin: {(300 + Math.random() * 50).toFixed(1)}°C</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-neon-blue rounded-full" />
                     <span className="text-[8px] font-mono text-neon-blue uppercase">O2 Sat: {Math.floor(95 + Math.random() * 4)}%</span>
                   </div>
                 </>
               )}
               {analysis?.crisisType === 'Medical Emergency' && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[8px] font-mono text-emerald-400 uppercase">Patient HR: {Math.floor(110 + Math.random() * 20)} BPM</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-neon-blue rounded-full" />
                     <span className="text-[8px] font-mono text-neon-blue uppercase">SpO2: {Math.floor(88 + Math.random() * 5)}%</span>
                   </div>
                 </>
               )}
               {analysis?.crisisType === 'High-Risk Security Threat' && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-red-600 rounded-full animate-ping" />
                     <span className="text-[8px] font-mono text-red-500 uppercase">Threat Delta: HIGH</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                     <span className="text-[8px] font-mono text-amber-400 uppercase">Acoustic Activity: 85dB</span>
                   </div>
                 </>
               )}
               {analysis?.crisisType === 'Stampede Risk' && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                     <span className="text-[8px] font-mono text-amber-400 uppercase">Density: 6.2 ppl/m²</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                     <span className="text-[8px] font-mono text-emerald-400 uppercase">Flow Rate: 45 ppl/min</span>
                   </div>
                 </>
               )}
               {analysis?.crisisType === 'Gas Leak' && (
                 <>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-emerald-600 rounded-full animate-pulse" />
                     <span className="text-[8px] font-mono text-emerald-400 uppercase">Toxicity: 240 PPM</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-glass-border">
                     <div className="w-1 h-1 bg-white rounded-full animate-spin" />
                     <span className="text-[8px] font-mono text-white uppercase">Wind: 14km/h NW</span>
                   </div>
                 </>
               )}
            </div>

            <AnimatePresence>
              {selectedMapFeature && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  className="absolute inset-0 z-30 flex items-center justify-center p-4"
                  onClick={() => setSelectedMapFeature(null)}
                >
                    <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-navy-dark border border-neon-blue/30 p-6 rounded-[2rem] shadow-2xl max-w-sm w-full relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setSelectedMapFeature(null)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-white"
                    >
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-2xl ${
                        selectedMapFeature.type === 'danger' ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                        selectedMapFeature.type === 'route' ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                        selectedMapFeature.type === 'blocked' ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                        'bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      }`}>
                        {selectedMapFeature.type === 'danger' ? <Flame className="w-6 h-6" /> :
                         selectedMapFeature.type === 'route' ? <MapIcon className="w-6 h-6" /> :
                         selectedMapFeature.type === 'blocked' ? <AlertTriangle className="w-6 h-6" /> :
                         <Users className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase text-slate-100 leading-none">{selectedMapFeature.label}</h3>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{selectedMapFeature.status}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                      {selectedMapFeature.details}
                    </p>

                    {selectedMapFeature.alternatives && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-600 mb-3 tracking-widest">Contingency Pathways</h4>
                        <div className="space-y-2">
                          {selectedMapFeature.alternatives.map((alt, i) => (
                            <div key={i} className="flex items-center gap-3 bg-midnight p-3 rounded-xl border border-glass-border text-[11px] font-bold text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {alt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setSelectedMapFeature(null)}
                      className="w-full mt-6 bg-neon-blue hover:bg-neon-blue/80 text-white py-3 rounded-xl font-bold uppercase text-xs transition-colors shadow-lg"
                    >
                      Acknowledge & Close
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`w-full h-full max-w-[500px] relative transition-all duration-500 ${selectedMapFeature ? 'blur-md scale-95 opacity-50' : ''}`}>
               {/* Tactical Legend Layer (NEW) */}
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-glass-border rounded-xl shadow-2xl">
                 <div className="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Tactical Legend</div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Danger Zone</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]" />
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Safe Path</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-sm bg-red-600 flex items-center justify-center">
                     <span className="text-[6px] text-white font-black">X</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Blocked</span>
                 </div>
               </div>

               <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,1)]">
                  {/* Grid System (Layer 0) */}
                  <defs>
                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1" strokeOpacity="0.05" />
                    </pattern>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <rect width="200" height="150" fill="url(#smallGrid)" />
                  <rect x="10" y="10" width="180" height="130" rx="4" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
                  
                  {/* Zone Labels (Reflecting A1, B2 etc) */}
                  <g className="opacity-10 pointer-events-none" fill="white" fontSize="4" fontStyle="italic">
                    <text x="15" y="20">A1</text><text x="65" y="20">A2</text><text x="115" y="20">A3</text><text x="175" y="20">A4</text>
                    <text x="15" y="70">B1</text><text x="65" y="70">B2</text><text x="115" y="70">B3</text><text x="175" y="70">B4</text>
                    <text x="15" y="120">C1</text><text x="65" y="120">C2</text><text x="115" y="120">C3</text><text x="175" y="120">C4</text>
                  </g>

                  {/* Obstacles / Walls Layer */}
                  <g opacity="0.15">
                    <rect x="40" y="40" width="2" height="40" fill="white" />
                    <rect x="140" y="20" width="2" height="60" fill="white" />
                    <rect x="70" y="100" width="60" height="2" fill="white" />
                  </g>

                  {/* User Position (Layer 1) - Blinking Dot with Label & Direction */}
                  <g transform="translate(30, 130)">
                    <circle r="6" fill="#3b82f6" fillOpacity="0.1">
                      <animate attributeName="r" values="5;8;5" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="2.5" fill="#3b82f6" filter="url(#glow)">
                      <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                    {/* Direction Arrow */}
                    <path d="M 0 -4 L 2 -2 L -2 -2 Z" fill="#3b82f6" transform="rotate(-45)" />

                    <text x="5" y="-5" fill="white" fontSize="5" className="font-black drop-shadow-md italic">YOU</text>
                    <text x="5" y="2" fill="#3b82f6" fontSize="3" className="font-black">12m to EXIT</text>
                  </g>

                  {/* Floating AI Text */}
                  <g transform="translate(10, 145)">
                    <text fill="#10b981" fontSize="3.5" className="font-mono uppercase opacity-60 italic">AI recalculating safest route...</text>
                  </g>

                  <AnimatePresence mode="wait">
                    {analysis?.crisisType === 'Fire' && (
                      <motion.g key="fire-complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <defs>
                          <radialGradient id="heatMap" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="60%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                          </radialGradient>
                          <radialGradient id="fireCore" cx="50%" cy="50%" r="50%">
                            <stop offset="10%" stopColor="#fef08a" stopOpacity={1} />
                            <stop offset="50%" stopColor="#fde047" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                          </radialGradient>
                        </defs>
                        
                        {/* Hazard Layer: Pulse, Heat & Ripples */}
                        <circle cx="60" cy="40" r="45" fill="url(#heatMap)">
                          <animate attributeName="r" values="38;48;38" dur="4s" repeatCount="indefinite" />
                        </circle>
                        
                        {/* Ripple Waves */}
                        {[...Array(3)].map((_, i) => (
                          <circle key={i} cx="60" cy="40" r="10" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.6">
                            <animate attributeName="r" from="10" to="40" dur={`${2 + i}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.6" to="0" dur={`${2 + i}s`} repeatCount="indefinite" />
                          </circle>
                        ))}

                        <circle cx="60" cy="40" r="8" fill="url(#fireCore)" filter="url(#glow)">
                           <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                        </circle>

                        {/* Floating Hazard Icon */}
                        <g transform="translate(60, 28)">
                           <motion.text 
                             animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
                             transition={{ repeat: Infinity, duration: 1.5 }}
                             fontSize="8" 
                             textAnchor="middle"
                           >
                             🔥
                           </motion.text>
                        </g>

                        {/* Smoke Flow Particles Upwards */}
                        {[...Array(8)].map((_, i) => (
                           <motion.circle 
                             key={i} r="1.2" fill="white" opacity="0.2"
                             initial={{ cx: 60, cy: 40 }}
                             animate={{ 
                               cx: [60, 60 + (i - 4) * 8], 
                               cy: [40, -10],
                               opacity: [0, 0.4, 0],
                               r: [1.2, 5, 8]
                             }}
                             transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                           />
                        ))}



                        {/* Blocked Path Marker */}
                        <g transform="translate(100, 30)">
                           <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="#ef4444" strokeWidth="2.5" />
                           <text y="10" fill="#ef4444" fontSize="4" textAnchor="middle" className="font-black uppercase">BLOCKED</text>
                        </g>

                        {/* Primary Path Engine - Thicker & Animated */}
                        <motion.path 
                          d="M 30 130 Q 80 130, 80 100 Q 80 60, 150 60 Q 185 60, 185 120" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6"
                          animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          filter="url(#glow)"
                        />
                        
                        {/* Secondary Alternative Path */}
                        <motion.path 
                          d="M 30 130 Q 20 50, 80 40 Q 150 40, 185 120" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4"
                          animate={{ strokeDashoffset: [0, -50] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        />

                        <g transform="translate(185, 125)">
                           <rect x="-38" y="-12" width="38" height="12" rx="4" fill="#059669" filter="url(#glow)" stroke="white" strokeWidth="0.5" />
                           {/* Door Icon (rect based) */}
                           <rect x="-34" y="-9" width="3" height="6" fill="white" />
                           <text x="-16" y="-3" fill="white" fontSize="5" textAnchor="middle" className="font-black drop-shadow-sm uppercase italic">EXIT</text>
                        </g>
                      </motion.g>
                    )}

                    {analysis?.crisisType === 'Medical Emergency' && (
                      <motion.g key="med-complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Patient Marker Enhancement */}
                        <circle cx="100" cy="75" r="50" fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4 4" />
                        <g transform="translate(100, 75)">
                          <circle r="12" fill="#10b981" fillOpacity="0.2">
                            <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle r="4" fill="#059669" className="animate-pulse" filter="url(#glow)" />
                          
                          {/* Label Badge (UPGRADED) */}
                          <g transform="translate(0, -35)">
                            <rect x="-35" y="-10" width="70" height="15" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" filter="url(#glow)" />
                            <text y="0" fill="#10b981" fontSize="6.5" textAnchor="middle" className="font-black uppercase tracking-tighter shadow-lg">CASUALTY ZONE</text>
                            <circle cx="-35" cy="-10" r="1" fill="#10b981" />
                            <circle cx="35" cy="-10" r="1" fill="#10b981" />
                          </g>
                        </g>
                        
                        {/* Direct Navigation */}
                        <motion.path 
                          d="M 30 130 L 100 75" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5"
                          animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          filter="url(#glow)"
                        />
                        <text x="50" y="105" x-offset="2" fill="#60a5fa" fontSize="4.5" className="font-black uppercase italic drop-shadow-md">Fastest Response Route</text>
                      </motion.g>
                    )}

                    {analysis?.crisisType === 'High-Risk Security Threat' && (
                      <motion.g key="security-complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <defs>
                          <pattern id="hazardHatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect width="2" height="4" fill="rgba(239, 68, 68, 0.4)" />
                          </pattern>
                        </defs>
                        {/* Restricted Zone Block */}
                        <rect x="80" y="20" width="100" height="50" fill="url(#hazardHatch)" stroke="#ef4444" strokeWidth="1">
                           <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
                        </rect>
                        
                        {/* NO ENTRY Marker */}
                        {/* Threat Label Badge (UPGRADED) */}
                        <g transform="translate(130, 45)">
                          {/* Label Badge */}
                          <g transform="translate(0, -35)">
                            <rect x="-35" y="-10" width="70" height="15" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="1" filter="url(#glow)" />
                            <text y="0" fill="#ef4444" fontSize="6.5" textAnchor="middle" className="font-black uppercase tracking-tighter shadow-lg">THREAT ZONE</text>
                            <circle cx="-35" cy="-10" r="1" fill="#ef4444" />
                            <circle cx="35" cy="-10" r="1" fill="#ef4444" />
                          </g>
                        </g>
                        
                        {/* Safe Zone Mapping */}
                        <rect x="20" y="80" width="60" height="50" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" />
                        <text x="50" y="105" fill="#10b981" fontSize="5" textAnchor="middle" className="font-black uppercase">SAFE HAVEN</text>
                        
                        {/* Evacuation Path Escape */}
                        <motion.path 
                          d="M 30 130 L 50 105" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="6 4"
                          animate={{ strokeDashoffset: [0, -40] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          filter="url(#glow)"
                        />

                        <path d="M10 142 H190" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4" opacity="1" filter="url(#glow)" />
                        <text x="100" y="148" fill="#ef4444" fontSize="4.5" textAnchor="middle" className="font-black uppercase tracking-widest">TOTAL LOCKDOWN // SECTOR ALPHA</text>
                      </motion.g>
                    )}

                    {analysis?.crisisType === 'Stampede Risk' && (
                      <motion.g key="stampede-complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Density Clusters (People) */}
                        <ellipse cx="100" cy="110" rx="70" ry="35" fill="#f59e0b" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 2" />
                        
                        {[...Array(12)].map((_, i) => (
                           <motion.circle 
                             key={i} r="1.5" fill="#f59e0b"
                             initial={{ cx: 100 + (Math.random() - 0.5) * 60, cy: 110 + (Math.random() - 0.5) * 25 }}
                             animate={{ 
                               cx: [null, 100 + (Math.random() - 0.5) * 65], 
                               cy: [null, 110 + (Math.random() - 0.5) * 30] 
                             }}
                             transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, repeatType: "reverse" }}
                           />
                        ))}

                        {/* Congestion Label Badge */}
                        {/* Congestion Label Badge (UPGRADED) */}
                        <g transform="translate(100, 90)">
                          <g transform="translate(0, -35)">
                            <rect x="-42" y="-10" width="84" height="15" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" filter="url(#glow)" />
                            <text y="0" fill="#f59e0b" fontSize="6.5" textAnchor="middle" className="font-black uppercase tracking-tighter shadow-lg">CONGESTION HUB</text>
                            <circle cx="-42" cy="-10" r="1" fill="#f59e0b" />
                            <circle cx="42" cy="-10" r="1" fill="#f59e0b" />
                          </g>
                        </g>
                        
                        {/* Flow Arrows Layer */}
                        {[...Array(5)].map((_, i) => (
                           <motion.path 
                             key={i} d="M-4 0 L0 -4 L4 0" fill="none" stroke="#10b981" strokeWidth="2"
                             transform={`translate(${70 + i * 15}, 130) rotate(90)`}
                             animate={{ x: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
                             transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                           />
                        ))}

                        <rect x="170" y="100" width="12" height="25" rx="1.5" fill="#ef4444" filter="url(#glow)" />
                        <text x="176" y="123" fill="white" fontSize="4.5" textAnchor="middle" transform="rotate(-90 176 123)" className="font-black">BLOCKED</text>
                        
                        {/* Redirection Path */}
                        <motion.path 
                          d="M 30 130 Q 30 50, 110 50 Q 180 50, 185 130" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 4"
                          animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          filter="url(#glow)"
                        />
                      </motion.g>
                    )}

                    {analysis?.crisisType === 'Gas Leak' && (
                      <motion.g key="gas-complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <defs>
                           <linearGradient id="gasLeakPlume" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#d9f99d" stopOpacity={0.8} />
                             <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        
                        {/* Expanding Plume Visuals */}
                        <path d="M40 40 Q 90 50, 160 110 L 100 130 Q 50 60, 40 40" fill="url(#gasLeakPlume)">
                          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
                        </path>

                        {/* Toxic Zone Hazard Badge */}
                        {/* Toxic Zone Hazard Badge (UPGRADED) */}
                        <g transform="translate(60, 35)">
                          <g transform="translate(0, -35)">
                            <rect x="-35" y="-10" width="70" height="15" rx="3" fill="#0f172a" stroke="#84cc16" strokeWidth="1" filter="url(#glow)" />
                            <text y="0" fill="#84cc16" fontSize="6.5" textAnchor="middle" className="font-black uppercase tracking-tighter shadow-lg">TOXIC ZONE</text>
                            <circle cx="-35" cy="-10" r="1" fill="#84cc16" />
                            <circle cx="35" cy="-10" r="1" fill="#84cc16" />
                          </g>
                        </g>
                        
                        <rect x="35" y="35" width="30" height="30" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
                        
                        {/* Avoidance Navigation Path */}
                        <motion.path 
                          d="M 30 130 L 20 120 Q 10 20, 180 20 L 185 130" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="8 6"
                          animate={{ strokeDashoffset: [0, -200] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          filter="url(#glow)"
                        />
                        <text x="182" y="10" fill="#10b981" fontSize="5" textAnchor="end" className="font-black uppercase tracking-tighter italic">Safe Corridor: Cross-Wind Redirection</text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </svg>
               
               {/* Map Controls Floating */}
               <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
                 <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-white/5 py-1 px-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-[8px] font-mono text-slate-300 uppercase">Interactive Elements Active</span>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Predictive Risk Analytics (DECISION TOOL) */}
        <section className="col-span-12 lg:col-span-3 bg-navy-dark border border-glass-border rounded-3xl p-6 flex flex-col shadow-xl relative overflow-hidden group">
          <motion.div animate={{ background: `linear-gradient(to bottom, ${currentTheme.primary}08, transparent)` }} className="absolute inset-0 pointer-events-none" />
          
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-6 block flex items-center gap-2 relative z-10">
            <ArrowRight className="w-4 h-4" style={{ color: currentTheme.primary }} />
            Predictive Risk Engine
          </label>

          <div className="space-y-6 flex-1 relative z-10">
            {analysis?.predictiveRisks?.map((risk, idx) => {
              const riskColor = risk.level === 'High' ? '#ef4444' : risk.level === 'Medium' ? '#f59e0b' : '#10b981';
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-midnight/60 border border-white/5 p-4 rounded-3xl group/risk hover:bg-slate-900 transition-all border-l-4"
                  style={{ borderLeftColor: riskColor }}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div>
                       <div className="text-[11px] font-black uppercase text-slate-100 tracking-tight">{risk.name}</div>
                       <div className="text-[8px] text-slate-500 font-mono uppercase mt-0.5">Critical in ~2.5 min</div>
                     </div>
                     <div className={`text-[8px] font-black uppercase px-2 py-1 rounded shadow-lg ${
                       risk.level === 'High' ? 'bg-red-500 text-white' : 
                       risk.level === 'Medium' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                     }`}>
                       {risk.level}
                     </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1.5">
                          {risk.trend === 'Increasing' ? <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity }}><ArrowRight className="w-3 h-3 text-red-500 -rotate-45" /></motion.div> : 
                           <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity }}><ArrowRight className="w-3 h-3 text-emerald-500 rotate-45" /></motion.div>}
                          <span className={`text-[9px] font-black uppercase ${
                            risk.trend === 'Increasing' ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {risk.trend} Trend
                          </span>
                       </div>
                    </div>
                    
                    {/* Visual Mini Graph Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                       {[...Array(10)].map((_, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0 }}
                           animate={{ 
                             opacity: 1,
                             backgroundColor: i < (risk.level === 'High' ? 8 : risk.level === 'Medium' ? 5 : 2) ? riskColor : '#1e293b'
                           }}
                           transition={{ delay: i * 0.05 }}
                           className="flex-1 rounded-sm"
                         />
                       ))}
                    </div>
                  </div>
                </motion.div>
              );
            }) || <div className="text-slate-800 text-[10px] font-bold uppercase tracking-widest text-center py-8">Simulating Future States...</div>}
          </div>
          
          <div className="mt-4 pt-4 border-t border-glass-border">
             <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-100 font-black italic">60s Forecast</label>
                <div className="flex items-center gap-2">
                   <Clock className="w-3 h-3 text-red-500" />
                   <span className="text-[10px] font-black text-red-500 uppercase">Critical @ 1m 24s</span>
                </div>
             </div>
             
             <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                   <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500">
                      <span>{analysis?.crisisType === 'Fire' ? 'Thermal Spread' : 'Response Delay'}</span>
                      <span className="text-red-400">Increasing ↑</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div animate={{ width: '85%' }} className="h-full bg-red-500" />
                   </div>
                </div>
                <div className="flex flex-col gap-1.5">
                   <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Visibility Loss</span>
                      <span className="text-red-400">CRITICAL</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div animate={{ width: '92%' }} className="h-full bg-red-600" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* AI Tactical Guidance Panel */}
        <section className="col-span-12 lg:col-span-6 bg-navy-dark border border-glass-border rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative overflow-hidden group">
          <motion.div 
            animate={{ color: `${currentTheme.primary}1A` }}
            className="absolute top-0 right-0 p-12 transition-colors pointer-events-none"
          >
            <Zap className="w-48 h-48" />
          </motion.div>
          <div className="flex justify-between items-center mb-6">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: currentTheme.primary }} />
              Real-Time AI Strategic Directives
            </label>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-mono text-slate-500 italic">CALM MODE ACTIVE</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {analysis?.instructions?.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, borderColor: `${currentTheme.primary}1A` }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 items-start p-4 bg-midnight/40 backdrop-blur-xl border rounded-[1.5rem] hover:bg-midnight/60 transition-all shadow-sm"
              >
                <motion.span 
                  animate={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 15px ${currentTheme.glow}` }}
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center text-lg font-black shrink-0 transition-colors duration-500"
                >
                  {idx + 1}
                </motion.span>
                <p className="text-sm md:text-base leading-relaxed text-slate-100 font-bold">{step}</p>
              </motion.div>
            )) || <div className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center py-12">Synthesizing Adaptive Strategy...</div>}
          </div>
        </section>

        {/* Vulnerable Assist Panel (ACTIONABLE) */}
        <section className="col-span-12 lg:col-span-6 bg-navy-dark border border-glass-border rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
          <motion.div animate={{ background: `linear-gradient(to bottom right, ${currentTheme.primary}0D, transparent)` }} className="absolute inset-0 pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: currentTheme.primary }} />
              Rescue Assistance Panel
            </label>
            <div className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 italic">7 SEC TO NEXT SYNC</div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 h-full relative z-10">
             <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                   <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Active Search Zones</span>
                   <span className="text-[8px] text-slate-600 uppercase font-mono">3 Zones Secured</span>
                </div>
                
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[180px] custom-scrollbar">
                  {analysis?.vulnerableGroups?.map((group, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="bg-midnight border border-glass-border p-3 rounded-2xl flex items-center justify-between shadow-sm group/card"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          group.priority === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {group.type.toLowerCase().includes('child') ? <Baby className="w-4 h-4" /> : 
                           group.type.toLowerCase().includes('elder') ? <PersonStanding className="w-4 h-4" /> : 
                           <Accessibility className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-200 uppercase">{group.type} ({group.count})</div>
                          <div className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">Location: Sector {String.fromCharCode(65 + idx)}{idx + 1}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${group.priority === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
                    </motion.div>
                  )) || (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-900 rounded-3xl p-8 opacity-20">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Scanning Signal</span>
                    </div>
                  )}
                </div>

                {analysis && (
                  <div className="bg-emerald-600 p-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-auto border border-white/20">
                    <Shield className="w-4 h-4 text-white" />
                    <div className="text-white text-[10px] font-black uppercase leading-tight italic">
                      Action Hint: Evacuate Sector {analysis.location.split(' ')[0]} First
                    </div>
                  </div>
                )}
             </div>

             <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-slate-600 font-black mb-3 block flex items-center gap-2">
                  <Info className="w-3 h-3 text-slate-500" />
                  Neural Protocol reasoning
                </label>
                <div className="flex-1 bg-midnight border border-glass-border rounded-3xl p-6 text-[10px] font-mono text-slate-400 leading-relaxed overflow-y-auto shadow-inner h-[240px]">
                  <div className="mb-3 p-2.5 bg-black/40 rounded-xl border border-glass-border">
                    <span className="text-emerald-500 font-black block mb-1 uppercase tracking-tight text-[8px]">Current AI Directive:</span>
                    <span className="text-slate-300 italic text-[9px] leading-tight block">"Prioritize egress via Portal 02. Crowd density at Portal 01 exceeds safe threshold for vulnerable groups."</span>
                  </div>
                  <span className="text-slate-100 font-black block mb-2 uppercase tracking-tighter border-b border-glass-border pb-1">Calculation Logic:</span>
                  {analysis?.reasoning?.split('.').map((s, i) => s.trim() && <div key={i} className="mb-2 flex gap-2 items-start opacity-70"><div className="w-1 h-1 bg-slate-700 rounded-full mt-1.5 shrink-0" /> {s}.</div>) || "SYSTEM IDLE"}
                </div>
             </div>
          </div>
        </section>

      </main>

      {/* Footer Scroller */}
      <footer 
        className="fixed bottom-0 left-0 right-0 h-6 bg-navy-dark border-t flex items-center overflow-hidden z-50 transition-colors duration-500"
        style={{ borderColor: `${currentTheme.primary}40` }}
      >
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {Array(10).fill(null).map((_, i) => (
            <motion.span 
              key={i} 
              animate={{ color: `${currentTheme.primary}CC` }}
              className="text-[10px] font-mono font-bold uppercase px-12 flex items-center gap-2 transition-colors duration-500"
            >
              <Shield className="w-3 h-3" />
              PRIORITY DATA SYNC ACTIVE
              <span className="opacity-30"> // </span>
              SMART CITY NODE: CONNECTED
            </motion.span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  );
}
