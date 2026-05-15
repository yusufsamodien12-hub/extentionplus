import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import confetti from 'canvas-confetti';

// Create a custom confetti instance that doesn't use workers
// This avoids CSP issues in Chrome Extensions and fixes the getBoundingClientRect error
const fireConfetti = confetti.create(undefined, {
  resize: true,
  useWorker: false,
});
import { 
  CheckCircle2, 
  Circle, 
  ClipboardCheck, 
  RotateCcw, 
  ChevronDown, 
  Trophy,
  Download,
  Settings,
  Plus,
  Trash2,
  X,
  MessageSquare,
  Search,
  History,
  Sparkles,
  Copy,
  Check,
  Zap,
  FileText,
  UserCheck,
  GripVertical,
  Star,
  Target,
  BarChart3,
  Calendar,
  Heart,
  Database,
  Flag,
  StickyNote,
  Info,
  Layout,
  MoreVertical,
  CheckSquare,
  PieChart,
  ArrowRight,
  Sun,
  Moon,
  Save,
  Clock
} from 'lucide-react';
import { INITIAL_CHECKLIST } from './constants';
import { ChecklistSection, AssessmentSession } from './types';

export default function App() {
  const [sections, setSections] = useState<ChecklistSection[]>(() => {
    const saved = localStorage.getItem('call-quality-pro-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure points exist for legacy data
      return parsed.map((s: ChecklistSection) => ({
        ...s,
        items: s.items.map(i => ({ ...i, points: i.points ?? 1 }))
      }));
    }
    return INITIAL_CHECKLIST;
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(s => initial[s.id] = true);
    return initial;
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('call-quality-pro-theme') === 'dark';
  });
  const [history, setHistory] = useState<AssessmentSession[]>(() => {
    const saved = localStorage.getItem('call-quality-pro-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist state
  useEffect(() => {
    localStorage.setItem('call-quality-pro-state', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('call-quality-pro-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('call-quality-pro-history', JSON.stringify(history));
  }, [history]);

  // Calculate scores (Weighted)
  const stats = useMemo(() => {
    let totalPoints = 0;
    let earnedPoints = 0;
    let totalItems = 0;
    let completedItems = 0;
    
    sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        totalPoints += item.points;
        if (item.completed) {
          completedItems++;
          earnedPoints += item.points;
        }
      });
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return { totalItems, completedItems, totalPoints, earnedPoints, percentage };
  }, [sections]);

  // Confetti effect on 100%
  useEffect(() => {
    if (stats.percentage === 100 && stats.totalPoints > 0) {
      fireConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });
    }
  }, [stats.percentage, stats.totalPoints]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sections, searchQuery]);

  const toggleItem = (sectionId: string, itemId: string) => {
    if (isEditMode) return;
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, completed: !item.completed };
        })
      };
    }));
  };

  const passAllInSection = (sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map(item => ({ ...item, completed: true }))
      };
    }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetChecklist = () => {
    setSections(INITIAL_CHECKLIST.map(s => ({
      ...s,
      items: s.items.map(i => ({ ...i, completed: false }))
    })));
    setShowResetConfirm(false);
  };

  const copySummary = () => {
    const summary = sections.map(s => {
      const earned = s.items.filter(i => i.completed).reduce((acc, i) => acc + i.points, 0);
      const total = s.items.reduce((acc, i) => acc + i.points, 0);
      return `${s.title}: ${earned}/${total} pts\n` + 
             s.items.map(i => `[${i.completed ? 'X' : ' '}] (${i.points}pt) ${i.label}`).join('\n');
    }).join('\n\n') + `\n\nOverall Score: ${stats.percentage}% (${stats.earnedPoints}/${stats.totalPoints} pts)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Edit Mode Functions
  const addSection = () => {
    const newId = `section-${Date.now()}`;
    setSections(prev => [...prev, {
      id: newId,
      title: 'New Section',
      items: []
    }]);
    setExpandedSections(prev => ({ ...prev, [newId]: true }));
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  const addItem = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: [...s.items, { id: `item-${Date.now()}`, label: 'New Question', completed: false, points: 1 }]
      };
    }));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.filter(i => i.id !== itemId)
      };
    }));
  };

  const updateItemLabel = (sectionId: string, itemId: string, label: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, label } : i)
      };
    }));
  };

  const updateItemPoints = (sectionId: string, itemId: string, points: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, points: Math.max(0, points) } : i)
      };
    }));
  };

  const updateItemNotes = (sectionId: string, itemId: string, notes: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, notes } : i)
      };
    }));
  };

  const updateSectionIcon = (id: string, icon: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, icon } : s));
  };

  const handleReorderSections = (newSections: ChecklistSection[]) => {
    setSections(newSections);
  };

  const handleReorderItems = (sectionId: string, newItems: any[]) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: newItems } : s));
  };

const IconMap: Record<string, any> = {
  MessageSquare,
  Zap,
  Heart,
  Database,
  Flag,
  Star,
  Target,
  BarChart3,
  ClipboardCheck,
  Info
};

const SectionIcon = ({ name, className }: { name?: string, className?: string }) => {
  const Icon = name && IconMap[name] ? IconMap[name] : ClipboardCheck;
  return <Icon className={className} />;
};

  const exportResults = () => {
    const results = {
      date: new Date().toLocaleString(),
      score: `${stats.percentage}%`,
      points: `${stats.earnedPoints}/${stats.totalPoints}`,
      details: sections.map(s => ({
        section: s.title,
        items: s.items.map(i => ({ 
          label: i.label, 
          points: i.points, 
          status: i.completed ? 'Pass' : 'Fail',
          notes: i.notes || ''
        }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QA_Assessment_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSession = () => {
    const newSession: AssessmentSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleString(),
      score: stats.percentage,
      points: `${stats.earnedPoints}/${stats.totalPoints}`,
      sections: JSON.parse(JSON.stringify(sections))
    };
    setHistory(prev => [newSession, ...prev].slice(0, 20)); // Keep last 20
    fireConfetti({
      particleCount: 50,
      spread: 30,
      origin: { y: 0.9 }
    });
  };

  const loadSession = (session: AssessmentSession) => {
    setSections(session.sections);
    setShowHistoryModal(false);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden antialiased transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Main Content Area (Sidebar Style) */}
      <div className={`flex-1 flex flex-col relative overflow-hidden border-r transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-2xl'}`}>
        {/* Header */}
        <header className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              <ClipboardCheck className="w-4 h-4 text-white" />
            </motion.div>
            <span className={`font-bold text-sm tracking-tight transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Call Quality Pro</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-2 rounded-lg transition-all ${isEditMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              title="Edit Checklist"
            >
              <Settings className={`w-4 h-4 ${isEditMode ? 'animate-spin-slow' : ''}`} />
            </button>
          </div>
        </header>

        {/* Search/Filter Bar */}
        <div className={`px-4 py-2 border-b flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'}`}>
          <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search criteria..." 
              className={`bg-transparent text-xs outline-none w-full font-medium ${isDarkMode ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800'}`} 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3 text-slate-300 hover:text-slate-500" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
            title="Assessment History"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 custom-scrollbar scroll-smooth"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className={`text-3xl font-black tracking-tight leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hi,</h1>
            <p className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Ready for a new assessment?
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600'}`}>
                <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString()}
              </div>
              <button className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                <FileText className="w-3 h-3" /> Full Report
              </button>
            </div>
          </motion.div>

          {/* Checklist Sections */}
          <div className="space-y-4">
            <Reorder.Group axis="y" values={sections} onReorder={handleReorderSections} className="space-y-4">
              {filteredSections.map((section, idx) => (
                <Reorder.Item 
                  key={section.id} 
                  value={section}
                  dragListener={isEditMode}
                  id={`section-${section.id}`}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isEditMode 
                      ? 'border-indigo-300 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-lg cursor-grab active:cursor-grabbing' 
                      : isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 px-4 py-3.5">
                    {isEditMode && (
                      <div className="text-slate-300 dark:text-slate-600">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className="flex-1 flex items-center gap-3 text-left group"
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        section.items.length > 0 && section.items.every(i => i.completed) 
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : section.items.some(i => i.completed) 
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                            : isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <SectionIcon name={section.icon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditMode ? (
                          <div className="flex flex-col gap-1">
                            <input 
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={`font-bold text-sm bg-transparent outline-none border-b-2 transition-colors ${isDarkMode ? 'text-slate-100 border-slate-700 focus:border-indigo-500' : 'text-slate-800 border-indigo-100 focus:border-indigo-500'} w-full`}
                            />
                            <div className="flex gap-1 mt-1">
                              {Object.keys(IconMap).slice(0, 8).map(iconName => (
                                <button
                                  key={iconName}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSectionIcon(section.id, iconName);
                                  }}
                                  className={`p-1 rounded ${section.icon === iconName ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                  <SectionIcon name={iconName} className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            <h2 className={`font-bold text-sm transition-colors truncate ${isDarkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>{section.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(section.items.filter(i => i.completed).length / (section.items.length || 1)) * 100}%` }}
                                  className="h-full bg-indigo-500"
                                />
                              </div>
                              <span className="text-[9px] font-black text-slate-400 tabular-nums">
                                {Math.round((section.items.filter(i => i.completed).length / (section.items.length || 1)) * 100)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {isEditMode ? (
                      <button 
                        onClick={() => removeSection(section.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            passAllInSection(section.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                          title="Pass All"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-colors ${isDarkMode ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                          {section.items.filter(i => i.completed).reduce((acc, i) => acc + i.points, 0)}/{section.items.reduce((acc, i) => acc + i.points, 0)} pts
                        </span>
                        <motion.div animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}>
                          <ChevronDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </motion.div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 pt-1 space-y-2">
                          <Reorder.Group axis="y" values={section.items} onReorder={(newItems) => handleReorderItems(section.id, newItems)} className="space-y-2">
                            {section.items.map((item) => (
                              <Reorder.Item 
                                key={item.id} 
                                value={item}
                                dragListener={isEditMode}
                                className="flex items-center gap-2 group/item"
                              >
                                {isEditMode && (
                                  <div className="text-slate-200 group-hover/item:text-slate-400 transition-colors">
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div
                                  onClick={() => toggleItem(section.id, item.id)}
                                  className={`flex-1 flex items-start gap-3.5 p-3 rounded-xl transition-all text-left border-2 ${
                                    item.completed 
                                      ? isDarkMode ? 'bg-indigo-500/10 text-indigo-100 border-indigo-500/20 shadow-sm' : 'bg-indigo-50/40 text-indigo-900 border-indigo-100/50 shadow-sm' 
                                      : isDarkMode ? 'bg-slate-800/30 hover:bg-slate-800/50 text-slate-400 border-transparent' : 'bg-slate-50/30 hover:bg-slate-50 text-slate-600 border-transparent'
                                  } ${isEditMode ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {item.completed ? (
                                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                      </motion.div>
                                    ) : (
                                      <Circle className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-700 group-hover/item:text-slate-600' : 'text-slate-200 group-hover/item:text-slate-300'}`} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    {isEditMode ? (
                                      <textarea 
                                        value={item.label}
                                        onChange={(e) => updateItemLabel(section.id, item.id, e.target.value)}
                                        className={`text-xs font-semibold leading-relaxed bg-transparent outline-none w-full resize-none border-b transition-colors ${isDarkMode ? 'text-slate-200 border-slate-700 focus:border-indigo-500' : 'text-slate-800 border-indigo-100 focus:border-indigo-400'} py-0.5`}
                                        rows={1}
                                      />
                                    ) : (
                                      <div className="flex flex-col gap-1">
                                        <span className={`text-xs font-semibold leading-relaxed transition-colors ${item.completed ? (isDarkMode ? 'text-indigo-100' : 'text-indigo-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                                          {item.label}
                                        </span>
                                        {item.notes && (
                                          <div className={`flex items-start gap-1.5 text-[10px] p-1.5 rounded-lg border transition-colors ${isDarkMode ? 'text-slate-500 bg-slate-900/50 border-slate-800' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                            <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                                            <p className="italic">{item.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {!isEditMode && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveNoteId(activeNoteId === item.id ? null : item.id);
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${item.notes ? (isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50') : (isDarkMode ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100')}`}
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {isEditMode ? (
                                      <div className={`flex items-center gap-1 border rounded-lg px-1.5 py-0.5 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <Target className="w-3 h-3 text-slate-400" />
                                        <input 
                                          type="number"
                                          value={item.points}
                                          onChange={(e) => updateItemPoints(section.id, item.id, parseInt(e.target.value) || 0)}
                                          className={`w-8 text-[10px] font-black outline-none bg-transparent text-center transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                                        />
                                      </div>
                                    ) : (
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${item.completed ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400')}`}>
                                        {item.points}pt
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isEditMode && (
                                  <button 
                                    onClick={() => removeItem(section.id, item.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                {activeNoteId === item.id && !isEditMode && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full mt-2 p-3 bg-white border border-indigo-100 rounded-xl shadow-inner"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Observations / Notes</span>
                                      <button onClick={() => setActiveNoteId(null)} className="text-slate-300 hover:text-slate-500">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <textarea 
                                      value={item.notes || ''}
                                      onChange={(e) => updateItemNotes(section.id, item.id, e.target.value)}
                                      placeholder="Add feedback for this criteria..."
                                      className="w-full text-xs bg-transparent outline-none resize-none min-h-[60px] font-medium text-slate-600"
                                    />
                                  </motion.div>
                                )}
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                          {isEditMode && (
                            <motion.button 
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => addItem(section.id)}
                              className="w-full py-3 border-2 border-dashed border-indigo-100 rounded-xl text-indigo-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                            >
                              <Plus className="w-4 h-4" /> Add Question
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {isEditMode && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={addSection}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add New Section
              </motion.button>
            )}
          </div>

          {!isEditMode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-12 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-colors ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}
            >
              <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Assessment Result
                  </h3>
                  <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-400'}`}>{stats.percentage}%</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`rounded-2xl p-4 border transition-colors ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-[10px] uppercase font-black text-white/60 mb-1">Points Earned</div>
                    <div className="text-xl font-black">{stats.earnedPoints}/{stats.totalPoints}</div>
                  </div>
                  <div className={`rounded-2xl p-4 border transition-colors ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-[10px] uppercase font-black text-white/60 mb-1">Rating</div>
                    <div className={`text-xl font-black ${stats.percentage >= 90 ? 'text-emerald-400' : stats.percentage >= 75 ? 'text-amber-400' : 'text-white'}`}>
                      {stats.percentage >= 90 ? 'Elite' : stats.percentage >= 75 ? 'Strong' : 'Developing'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={copySummary}
                    className={`flex-1 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${isDarkMode ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Summary'}
                  </button>
                  <button 
                    onClick={exportResults}
                    className={`p-3.5 rounded-2xl transition-all active:scale-95 ${isDarkMode ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    title="Export JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* Floating Action Bar */}
        <div className="absolute bottom-6 left-4 right-4 z-40">
          <motion.div 
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className={`backdrop-blur-xl border rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-3.5 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className={isDarkMode ? 'text-slate-800' : 'text-slate-100'} />
                  <motion.circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={113.04}
                    initial={{ strokeDashoffset: 113.04 }}
                    animate={{ strokeDashoffset: 113.04 - (113.04 * stats.percentage) / 100 }}
                    className="text-indigo-600"
                  />
                </svg>
                <span className={`absolute text-[10px] font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stats.percentage}%</span>
              </div>
              <div>
                <div className={`text-[11px] font-black leading-none mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Weighted Score</div>
                <div className="text-[10px] text-slate-400 font-bold leading-none">{stats.earnedPoints} of {stats.totalPoints} points earned</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={saveSession}
                className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="Save Session"
              >
                <Save className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                title="Reset All"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Sidebar Icon Strip */}
      <div className={`w-14 border-l flex flex-col items-center py-6 gap-6 z-40 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar px-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative shrink-0 ${
                section.items.every(i => i.completed) && section.items.length > 0
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : section.items.some(i => i.completed)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : isDarkMode ? 'hover:bg-slate-800 text-slate-600' : 'hover:bg-slate-50 text-slate-400'
              }`}
              title={section.title}
            >
              <SectionIcon name={section.icon} className="w-4 h-4" />
              <div className="absolute right-full mr-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {section.title}
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={() => setShowStatsModal(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}
            title="Analytics"
          >
            <PieChart className="w-4 h-4" />
          </button>
          <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isEditMode ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-24 pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-indigo-500/5 to-transparent' : 'bg-gradient-to-b from-indigo-50 to-transparent'}`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Performance Analytics</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Breakdown</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStatsModal(false)} className={`p-2 rounded-xl text-slate-400 transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {sections.map(section => {
                    const earned = section.items.filter(i => i.completed).reduce((acc, i) => acc + i.points, 0);
                    const total = section.items.reduce((acc, i) => acc + i.points, 0);
                    const perc = total > 0 ? Math.round((earned / total) * 100) : 0;
                    
                    return (
                      <div key={section.id} className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <SectionIcon name={section.icon} className="w-3.5 h-3.5 text-indigo-500" />
                            <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{section.title}</span>
                          </div>
                          <span className={`text-xs font-black ${perc >= 90 ? 'text-emerald-500' : perc >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {perc}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${perc}%` }}
                            className={`h-full ${perc >= 90 ? 'bg-emerald-500' : perc >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold text-slate-400">{section.items.filter(i => i.completed).length} of {section.items.length} criteria met</span>
                          <span className={`text-[10px] font-black transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{earned}/{total} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Quality</div>
                    <div className={`text-3xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.percentage}%</div>
                  </div>
                  <button 
                    onClick={() => setShowStatsModal(false)}
                    className={`px-6 py-3 rounded-2xl text-xs font-black shadow-xl transition-all flex items-center gap-2 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                  >
                    Close <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Assessment History</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Sessions</p>
                    </div>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className={`p-2 rounded-xl text-slate-400 transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                      <p className="text-sm text-slate-400 font-medium">No saved assessments yet.</p>
                    </div>
                  ) : (
                    history.map(session => (
                      <div key={session.id} className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadSession(session)}>
                          <div className={`text-xs font-black mb-1 transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                            {session.date}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                            <span className={`px-2 py-0.5 rounded-full ${session.score >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                              {session.score}%
                            </span>
                            <span>{session.points} pts</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteHistoryItem(session.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setShowHistoryModal(false)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Close History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-[2rem] p-8 max-w-xs w-full shadow-2xl border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 mx-auto">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-black mb-2 text-center transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reset Progress?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center leading-relaxed">This will clear all your assessment data. This action cannot be undone.</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={resetChecklist}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm font-black text-white bg-rose-600 hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100 dark:shadow-none"
                >
                  Confirm Reset
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Keep Working
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />
    </div>
  );
}
