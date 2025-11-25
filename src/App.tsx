import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowUpCircle, 
  Library, 
  Layers, 
  BrainCircuit,
  GraduationCap,
  Microscope,
  Users,
  AlertCircle,
  Cpu,
  Quote,
  ArrowRight,
  History,
  MessageSquareWarning,
  PenTool,
  X,
  Settings,
  Key,
  ExternalLink,
  Copy,
  PenLine, 
  Check,
  Plus,
  Save
} from 'lucide-react';

// --- Type Definitions ---

interface Level1Item {
  original: string;
  suggestion: string;
  type: string;
}

interface Level2Data {
  mechanism: string;
  keyLogic: string;
}

interface Level3Data {
  theories: string[];
  academicText: string;
}

interface AnalysisResult {
  level1: Level1Item[];
  level2: Level2Data;
  level3: Level3Data;
}

interface CritiqueResult {
  weaknesses: string[];
  alternativeExplanation: string;
  verdict: string;
}

interface TitlesResult {
  colonStyle: string;
  questionStyle: string;
  declarativeStyle: string;
}

type TaskType = 'elevate' | 'critique' | 'titles';

interface ApiPayload {
  taskType: TaskType;
  text?: string;
  discipline?: string;
  context?: {
    mechanism?: string;
    academicText: string;
  };
}

interface HistoryItem {
  text: string;
  timestamp: number;
  label: string;
}

interface PresetDiscipline {
  id: string;
  name: string;
  iconName: string; // Store icon name string for persistence
}

// --- Configuration & Constants ---

// Mapping string names to actual Icon components
const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  BrainCircuit,
  GraduationCap,
  Layers,
  Microscope,
  BookOpen,
  Sparkles,
  PenLine
};

const DEFAULT_PRESETS: PresetDiscipline[] = [
  { id: 'management', name: '管理学', iconName: 'Users' },
  { id: 'sociology', name: '社会学', iconName: 'Users' },
  { id: 'psychology', name: '心理学', iconName: 'BrainCircuit' },
  { id: 'education', name: '教育学', iconName: 'GraduationCap' },
  { id: 'cs', name: '计算机', iconName: 'Layers' },
  { id: 'general', name: '通用社科', iconName: 'Microscope' },
];

// --- Gemini API Logic ---

const callGeminiAPI = async <T extends AnalysisResult | CritiqueResult | TitlesResult>(
  payloadData: ApiPayload, 
  userApiKey?: string
): Promise<T> => {
  const apiKey = userApiKey || "";
  
  if (!apiKey) {
    throw new Error("请先点击右上角设置您的 Gemini API Key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const { taskType, text, discipline, context } = payloadData;

  let systemPrompt = "";
  let userPrompt = "";
  let responseSchema: any = {};

  if (taskType === 'elevate') {
    systemPrompt = `
      你是 "ConceptForge"，一个专业的学术写作辅助AI。你的任务是将用户的口语化文本转化为高水平的学术表达。
      
      【关键指令】：你必须完全基于【${discipline}】的学科视角、理论框架和术语体系进行分析。
      如果用户选择了特定流派（如“女性主义”或“博弈论”），请严格使用该流派的专门术语。
      
      输出必须是严格的 JSON 格式，包含三个层级：
      1. level1 (术语): 提取3-5个关键口语词汇，并转化为该学科下的专业术语。
      2. level2 (机制): 用该学科的逻辑解释现象背后的因果机制。
      3. level3 (理论): 推荐该学科下的经典理论并重写段落。
    `;
    userPrompt = `请对以下文本进行概念升格：\n"${text}"`;
    responseSchema = {
      type: "OBJECT",
      properties: {
        level1: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              original: { type: "STRING" },
              suggestion: { type: "STRING" },
              type: { type: "STRING" }
            }
          }
        },
        level2: {
          type: "OBJECT",
          properties: {
            mechanism: { type: "STRING" },
            keyLogic: { type: "STRING" }
          }
        },
        level3: {
          type: "OBJECT",
          properties: {
            theories: { type: "ARRAY", items: { type: "STRING" } },
            academicText: { type: "STRING" }
          }
        }
      }
    };
  } else if (taskType === 'critique') {
    systemPrompt = `
      你扮演"Reviewer 2"（挑剔的学术审稿人）。基于用户的学术文本和机制，指出潜在的逻辑漏洞或理论缺陷，并提供一个替代性解释。
      请保持严厉但建设性的语气。
    `;
    userPrompt = `请批判以下学术逻辑：\n机制：${context?.mechanism}\n文本：${context?.academicText}`;
    responseSchema = {
      type: "OBJECT",
      properties: {
        weaknesses: { 
          type: "ARRAY", 
          items: { type: "STRING" },
          description: "2-3个逻辑漏洞或未被解释的变量"
        },
        alternativeExplanation: { 
          type: "STRING",
          description: "一个基于不同视角的替代性解释"
        },
        verdict: {
          type: "STRING",
          description: "一句话总评（如：Major Revision）"
        }
      }
    };
  } else if (taskType === 'titles') {
    systemPrompt = `
      你是一个学术编辑。基于提供的摘要/段落，生成3个不同风格的顶级期刊论文标题。
    `;
    userPrompt = `基于此内容生成标题：\n${context?.academicText}`;
    responseSchema = {
      type: "OBJECT",
      properties: {
        colonStyle: { type: "STRING", description: "冒号式 (Topic: Specific Argument)" },
        questionStyle: { type: "STRING", description: "提问式 (Does X affect Y?)" },
        declarativeStyle: { type: "STRING", description: "陈述式 (Direct finding)" }
      }
    };
  }

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 400) throw new Error("API Key 无效或过期");
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("No data returned");
    return JSON.parse(resultText) as T;
  } catch (error) {
    console.error("Gemini API Call Failed:", error);
    throw error;
  }
};

// --- Components ---

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [key, setKey] = useState(currentKey || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            设置 API Key
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            ConceptForge 需要使用 Google Gemini API 进行分析。为了保护您的隐私并降低成本，请使用您自己的 API Key。您的 Key 仅存储在本地浏览器中。
          </p>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gemini API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="password" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                placeholder="AIzaSy..."
              />
            </div>
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-800">
              没有 Key？您可以
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold ml-1 inline-flex items-center">
                在此免费获取 <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </div>
          </div>

          <button 
            onClick={() => onSave(key)}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

interface DisciplineButtonProps {
  id: string; // id is kept in props interface as it's passed from parent, but handled if unused
  name: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const DisciplineButton: React.FC<DisciplineButtonProps> = ({ name, icon: Icon, isActive, onClick, onDelete }) => (
  <button
    onClick={onClick}
    className={`relative group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
      isActive
        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]'
        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50'
    }`}
  >
    {onDelete && (
      <div 
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 bg-white text-slate-400 hover:text-red-500 rounded-full p-0.5 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title="删除此预设"
      >
        <X className="h-3 w-3" />
      </div>
    )}
    <Icon className={`h-5 w-5 mb-1.5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
    <span className="text-xs font-medium tracking-wide truncate w-full text-center px-1">{name}</span>
    {isActive && (
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></div>
    )}
  </button>
);

const ConceptForge: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  
  // Presets Management
  const [presets, setPresets] = useState<PresetDiscipline[]>(() => {
    const saved = localStorage.getItem('concept_forge_presets');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });

  // Discipline State (Auto-load last used)
  const [discipline, setDiscipline] = useState<string>(() => {
    return localStorage.getItem('concept_forge_last_discipline') || "management";
  });
  
  const [customLens, setCustomLens] = useState<string>("");
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  // API Key Management
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || "");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // States for Tasks
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isCritiquing, setIsCritiquing] = useState<boolean>(false);
  const [critiqueResult, setCritiqueResult] = useState<CritiqueResult | null>(null);
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState<boolean>(false);
  const [titlesResult, setTitlesResult] = useState<TitlesResult | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Persist Presets
  useEffect(() => {
    localStorage.setItem('concept_forge_presets', JSON.stringify(presets));
  }, [presets]);

  // Persist Last Discipline
  useEffect(() => {
    localStorage.setItem('concept_forge_last_discipline', discipline);
  }, [discipline]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowSettings(false);
  };

  const getDisciplineName = (id: string): string => {
    if (id === 'custom') {
      return customLens || '通用学术视角';
    }
    const found = presets.find(p => p.id === id);
    return found ? found.name : '学术通用';
  };

  const handleCustomLensSubmit = () => {
    if (customLens.trim()) {
      setDiscipline('custom');
      setIsEditingCustom(false);
    }
  };

  const handleSaveCustomAsPreset = () => {
    if (!customLens.trim()) return;
    
    const newId = `custom_${Date.now()}`;
    const newPreset: PresetDiscipline = {
      id: newId,
      name: customLens,
      iconName: 'BookOpen' // Default icon for custom presets
    };

    setPresets(prev => [...prev, newPreset]);
    setDiscipline(newId); // Switch to the newly created preset
    setCustomLens(""); // Clear custom input as it's now a preset
    setIsEditingCustom(false);
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Prevent deleting the last remaining preset if needed, or allow empty
    if (presets.length <= 1) return; 
    
    const newPresets = presets.filter(p => p.id !== id);
    setPresets(newPresets);
    
    // If we deleted the active one, switch to the first available
    if (discipline === id) {
      setDiscipline(newPresets[0].id);
    }
  };

  const handleElevate = async () => {
    if (!inputText.trim()) return;
    
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    if (discipline === 'custom' && !customLens.trim()) {
      setIsEditingCustom(true);
      setTimeout(() => customInputRef.current?.focus(), 100);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setCritiqueResult(null);
    setTitlesResult(null);

    try {
      const aiResult = await callGeminiAPI<AnalysisResult>({
        taskType: 'elevate',
        text: inputText,
        discipline: getDisciplineName(discipline)
      }, apiKey);
      setResult(aiResult);
      setHistory(prev => [{ 
        text: inputText, 
        timestamp: Date.now(),
        label: inputText.substring(0, 20) + "..."
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || "AI 服务暂时繁忙，请稍后重试。");
      if (err.message && err.message.includes("Key")) setShowSettings(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCritique = async () => {
    if (!result) return;
    setIsCritiquing(true);
    try {
      const aiResult = await callGeminiAPI<CritiqueResult>({
        taskType: 'critique',
        context: {
          mechanism: result.level2.mechanism,
          academicText: result.level3.academicText
        }
      }, apiKey);
      setCritiqueResult(aiResult);
    } catch (err: any) {
      console.error(err);
      setError("审稿人功能出错: " + err.message);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleGenerateTitles = async () => {
    if (!result) return;
    setIsGeneratingTitles(true);
    try {
      const aiResult = await callGeminiAPI<TitlesResult>({
        taskType: 'titles',
        context: {
          academicText: result.level3.academicText
        }
      }, apiKey);
      setTitlesResult(aiResult);
    } catch (err: any) {
      console.error(err);
      setError("标题生成出错: " + err.message);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      <ApiKeyModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={saveApiKey}
        currentKey={apiKey}
      />

      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#e0e7ff 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }}>
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                ConceptForge <span className="font-normal text-slate-400">Pro</span>
              </h1>
              <p className="text-[10px] text-indigo-600 font-medium tracking-wider uppercase flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Powered by Gemini 2.5
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-medium border border-slate-200">
              <span className={`w-2 h-2 rounded-full mr-2 ${apiKey ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {apiKey ? 'Ready' : 'Setup Required'}
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm cursor-pointer transition-all"
              title="设置 API Key"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Library className="h-3.5 w-3.5" /> 学科透镜 (Lens)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 max-w-[150px] truncate">
                    {getDisciplineName(discipline)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presets.map((preset) => (
                  <DisciplineButton
                    key={preset.id}
                    id={preset.id}
                    name={preset.name}
                    icon={ICON_MAP[preset.iconName] || BookOpen}
                    isActive={discipline === preset.id}
                    onClick={() => setDiscipline(preset.id)}
                    onDelete={presets.length > 1 ? (e) => handleDeletePreset(e, preset.id) : undefined}
                  />
                ))}
              </div>

              {/* 自定义透镜输入区 */}
              <div 
                className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
                  discipline === 'custom' 
                    ? 'bg-indigo-50 border-indigo-400 shadow-md ring-1 ring-indigo-400' 
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                {!isEditingCustom && discipline !== 'custom' ? (
                  <button 
                    onClick={() => {
                      setDiscipline('custom');
                      setIsEditingCustom(true);
                      setTimeout(() => customInputRef.current?.focus(), 100);
                    }}
                    className="w-full p-3 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">新增/自定义透镜</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-indigo-50">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-200 p-1.5 rounded-lg text-indigo-700">
                        <PenLine className="h-4 w-4" />
                      </div>
                      <input
                        ref={customInputRef}
                        type="text"
                        value={customLens}
                        onChange={(e) => setCustomLens(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomLensSubmit()}
                        placeholder="输入学科或理论 (如: 博弈论)..."
                        className="flex-1 bg-transparent border-b border-indigo-300 text-sm font-medium text-indigo-900 placeholder-indigo-400 focus:outline-none focus:border-indigo-600 pb-1"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-indigo-400">按回车确认，或保存为常用</span>
                      <div className="flex gap-2">
                        {/* Save as Preset Button */}
                        {customLens && (
                          <button 
                            onClick={handleSaveCustomAsPreset}
                            className="flex items-center gap-1 px-2 py-1 bg-white text-indigo-600 text-xs rounded border border-indigo-200 hover:bg-indigo-100 shadow-sm transition-colors"
                            title="保存到上方快捷列表"
                          >
                            <Save className="h-3 w-3" />
                            存为预设
                          </button>
                        )}
                        <button 
                          onClick={handleCustomLensSubmit}
                          className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden group ring-1 ring-slate-200 transition-shadow hover:shadow-2xl hover:shadow-slate-200/60">
              {/* ... (输入区域 Input Area 保持不变) ... */}
              <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">原始语料输入</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                </div>
              </div>
              
              <div className="relative flex-1 min-h-[280px]">
                <textarea
                  className="w-full h-full p-5 bg-white text-slate-700 placeholder-slate-300 focus:outline-none resize-none text-sm leading-relaxed font-mono"
                  placeholder={`在此输入您的论文草稿、口语化想法或田野笔记...
                  
示例："在目前的企业管理中，很多员工觉得老板说的话必须听，哪怕是错的。这种现象很普遍..."`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between bg-white/90 backdrop-blur p-2 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] text-slate-400 px-2">
                    {inputText.length} chars
                  </span>
                  <button
                    onClick={handleElevate}
                    disabled={isAnalyzing || !inputText}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition-all duration-300 ${
                      isAnalyzing || !inputText
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></div>
                        思考中...
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="h-4 w-4" />
                        开始升格
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* History section remains same */}
            {history.length > 0 && (
              <div className="bg-white/50 rounded-xl p-4 border border-slate-200/60">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="h-3.5 w-3.5" /> 最近记录
                </h3>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h) => (
                    <div 
                      key={h.timestamp} 
                      onClick={() => setInputText(h.text)}
                      className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:text-indigo-700 cursor-pointer transition-colors truncate"
                    >
                      {h.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-8" ref={resultRef}>
            {/* ... (Error, Loading, Result sections same as before) ... */}
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">分析中断</h4>
                  <p className="text-sm mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!result && !isAnalyzing && !error && (
              <div className="h-[600px] bg-white/60 border-2 border-dashed border-slate-300/60 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <BrainCircuit className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">等待输入</h3>
                <p className="text-sm mt-2 text-center max-w-sm text-slate-500">
                  AI 将基于<span className="text-indigo-600 font-medium mx-1">顶级期刊标准</span>
                  为您重构文本。请输入内容并点击“开始升格”。
                </p>
                {!apiKey && (
                  <button onClick={() => setShowSettings(true)} className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors">
                    配置 API Key 以开始
                  </button>
                )}
              </div>
            )}

            {isAnalyzing && (
              <div className="h-[600px] bg-white rounded-3xl border border-slate-200 shadow-xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent"></div>
                <div className="relative z-10 text-center space-y-6">
                   <div className="mx-auto w-16 h-16 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                   </div>
                   <div>
                     <h3 className="text-lg font-medium text-slate-800">正在运用 {getDisciplineName(discipline)} 视角分析...</h3>
                     <div className="mt-2 flex justify-center gap-1">
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Level 1: Terminology Map */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-800">核心概念映射</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 1: Terminology</span>
                  </div>
                  
                  <div className="p-6 grid gap-4 sm:grid-cols-2">
                    {result.level1.map((item, idx) => (
                      <div key={idx} className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 rounded-xl p-4 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs text-slate-400 mb-1 line-through decoration-slate-300 decoration-2">{item.original}</span>
                            <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{item.suggestion}</span>
                            <span className="text-[10px] text-slate-400 mt-2 bg-white px-2 py-0.5 rounded border border-slate-100 self-start inline-block">
                              {item.type}
                            </span>
                          </div>
                          <button 
                             onClick={() => copyToClipboard(item.suggestion)}
                             className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-100 group-hover:right-14 transition-all duration-300">
                           <ArrowRight className="h-4 w-4 text-blue-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 2: Mechanism Flow */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <Layers className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-800">机制逻辑重构</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 2: Mechanism</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-1 h-8 w-8 text-purple-100 -z-10 rotate-180" />
                      <p className="text-slate-700 leading-relaxed text-sm md:text-base pl-4 border-l-2 border-purple-200">
                        {result.level2.mechanism}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                       <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                         <BrainCircuit className="h-3 w-3" /> Logic Flow
                       </div>
                       <div className="flex items-center gap-2 text-sm font-medium text-purple-900 overflow-x-auto pb-2 scrollbar-hide">
                          {result.level2.keyLogic.split('->').map((step, i, arr) => (
                            <React.Fragment key={i}>
                              <span className="whitespace-nowrap bg-white px-3 py-1.5 rounded shadow-sm border border-slate-100">
                                {step.trim()}
                              </span>
                              {i < arr.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Level 3: Theoretical Integration */}
                <div className="relative bg-white rounded-3xl border border-indigo-100 shadow-2xl shadow-indigo-100/50 overflow-hidden ring-1 ring-indigo-50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
                  
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                         <Microscope className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">理论对话与重写</h3>
                        <div className="flex gap-2 mt-1">
                          {result.level3.theories.map((t, i) => (
                            <span key={i} className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 3: Integration</span>
                  </div>

                  <div className="p-8 bg-[#fafafa]">
                    <div className="prose prose-slate max-w-none">
                      <div className="relative group">
                        <div className="font-serif text-base md:text-lg leading-8 text-slate-800 text-justify">
                          {result.level3.academicText}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(result.level3.academicText)}
                          className="absolute -right-2 -top-2 p-2 bg-white hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-slate-200 hover:border-transparent shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* New Action Buttons Area */}
                    <div className="mt-6 pt-6 border-t border-slate-200/60 flex flex-wrap gap-3 items-center">
                      <span className="text-xs text-slate-400 font-sans mr-auto">AI Tools:</span>
                      
                      <button 
                        onClick={handleGenerateTitles}
                        disabled={isGeneratingTitles}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                      >
                        {isGeneratingTitles ? <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full"/> : <PenTool className="h-3.5 w-3.5" />}
                        标题工坊
                      </button>

                      <button 
                        onClick={handleCritique}
                        disabled={isCritiquing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                      >
                        {isCritiquing ? <div className="animate-spin h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full"/> : <MessageSquareWarning className="h-3.5 w-3.5" />}
                        模拟审稿人 (Reviewer 2)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extra Feature: Titles Output */}
                {titlesResult && (
                  <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> 学术标题建议
                      </h4>
                      <button onClick={() => setTitlesResult(null)} className="text-indigo-300 hover:text-indigo-600"><X className="h-4 w-4"/></button>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(titlesResult).map(([key, value], idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex flex-col">
                          <span className="text-[10px] text-indigo-400 uppercase font-bold mb-1">
                            {key === 'colonStyle' ? '冒号式' : key === 'questionStyle' ? '提问式' : '陈述式'}
                          </span>
                          <span className="font-serif font-medium text-indigo-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Feature: Critique Output */}
                {critiqueResult && (
                  <div className="bg-amber-50/50 rounded-3xl border border-amber-100 p-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-amber-900 flex items-center gap-2">
                        <MessageSquareWarning className="h-4 w-4" /> Reviewer 2 Comments
                      </h4>
                      <button onClick={() => setCritiqueResult(null)} className="text-amber-300 hover:text-amber-600"><X className="h-4 w-4"/></button>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                        <h5 className="text-xs font-bold text-amber-500 uppercase mb-2">Weaknesses identified</h5>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {critiqueResult.weaknesses.map((w, i) => (
                            <li key={i} className="leading-relaxed">{w}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                         <h5 className="text-xs font-bold text-amber-500 uppercase mb-2">Alternative Explanation</h5>
                         <p className="text-sm text-slate-700 leading-relaxed">{critiqueResult.alternativeExplanation}</p>
                      </div>
                      <div className="flex justify-end">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Verdict: {critiqueResult.verdict}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptForge;