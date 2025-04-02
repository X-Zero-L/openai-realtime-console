import { useState, useEffect } from "react";
import { Settings, Sliders, X, Save, Trash2, Edit2, Plus } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";

// 默认的预设人格
const DEFAULT_PRESETS = [
  { id: "friendly", name: "友好", instructions: "请用友好、热情的语气与用户交流，加入适当的幽默感，营造轻松的对话氛围。", isDefault: true },
  { id: "professional", name: "专业", instructions: "请保持专业、简洁的回答风格，提供准确而有深度的信息，避免过多的闲聊。", isDefault: true },
  { id: "creative", name: "创意", instructions: "请发挥创意和想象力，用生动的描述和比喻来表达想法，鼓励创新思维。", isDefault: true },
  { id: "empathetic", name: "共情", instructions: "请保持高度共情能力，理解并承认用户的情感，提供支持和鼓励。", isDefault: true }
];

export default function SessionSettings({ onSettingsChange, initialSettings = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    voice: initialSettings.voice || "shimmer",
    instructions: initialSettings.instructions || "",
    temperature: initialSettings.temperature || 0.8,
    ...initialSettings
  });

  // 可用的语音选项
  const voices = [
    { id: "alloy", name: "Alloy" },
    { id: "ash", name: "Ash" },
    { id: "ballad", name: "Ballad" },
    { id: "coral", name: "Coral" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "sage", name: "Sage" },
    { id: "shimmer", name: "Shimmer" },
    { id: "verse", name: "Verse" }
  ];

  // 用户自定义预设和当前选择的预设
  const [personalityPresets, setPersonalityPresets] = useState([...DEFAULT_PRESETS]);
  const [selectedPresetId, setSelectedPresetId] = useState("friendly");
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  // 从localStorage加载用户保存的预设
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem("personalityPresets");
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets);
        // 合并默认预设和用户预设，确保默认预设始终存在
        const mergedPresets = [
          ...DEFAULT_PRESETS,
          ...parsedPresets.filter(preset => !DEFAULT_PRESETS.some(dp => dp.id === preset.id))
        ];
        setPersonalityPresets(mergedPresets);
      }

      // 加载最后选择的预设
      const lastSelectedPreset = localStorage.getItem("lastSelectedPreset");
      if (lastSelectedPreset) {
        setSelectedPresetId(lastSelectedPreset);
        const preset = [...DEFAULT_PRESETS, ...(JSON.parse(savedPresets) || [])].find(p => p.id === lastSelectedPreset);
        if (preset) {
          handleChange("instructions", preset.instructions);
        }
      }
    } catch (e) {
      console.error("加载预设失败:", e);
    }
  }, []);

  // 处理设置变更
  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  // 处理预设选择
  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = personalityPresets.find(p => p.id === presetId);
    if (preset) {
      handleChange("instructions", preset.instructions);
      localStorage.setItem("lastSelectedPreset", presetId);
    }
  };

  // 保存新预设
  const saveNewPreset = () => {
    if (!newPresetName.trim()) return;

    const newPresetId = `custom_${Date.now()}`;
    const newPreset = {
      id: newPresetId,
      name: newPresetName,
      instructions: settings.instructions,
      isDefault: false
    };

    const updatedPresets = [...personalityPresets, newPreset];
    setPersonalityPresets(updatedPresets);
    setSelectedPresetId(newPresetId);
    localStorage.setItem("personalityPresets", JSON.stringify(updatedPresets));
    localStorage.setItem("lastSelectedPreset", newPresetId);
    
    setNewPresetName("");
    setIsCreatingPreset(false);
  };

  // 更新现有预设
  const updatePreset = () => {
    const currentPreset = personalityPresets.find(p => p.id === selectedPresetId);
    if (!currentPreset || currentPreset.isDefault) return;

    const updatedPresets = personalityPresets.map(preset => 
      preset.id === selectedPresetId 
        ? { ...preset, name: newPresetName || preset.name, instructions: settings.instructions }
        : preset
    );

    setPersonalityPresets(updatedPresets);
    localStorage.setItem("personalityPresets", JSON.stringify(updatedPresets));
    setIsEditingPreset(false);
    setNewPresetName("");
  };

  // 删除预设
  const deletePreset = (presetId) => {
    const presetToDelete = personalityPresets.find(p => p.id === presetId);
    if (!presetToDelete || presetToDelete.isDefault) return;

    const updatedPresets = personalityPresets.filter(preset => preset.id !== presetId);
    setPersonalityPresets(updatedPresets);
    
    // 如果删除的是当前选中的预设，切换到默认预设
    if (selectedPresetId === presetId) {
      setSelectedPresetId("friendly");
      const defaultPreset = personalityPresets.find(p => p.id === "friendly");
      if (defaultPreset) {
        handleChange("instructions", defaultPreset.instructions);
      }
      localStorage.setItem("lastSelectedPreset", "friendly");
    }
    
    localStorage.setItem("personalityPresets", JSON.stringify(updatedPresets));
  };

  // 开始编辑现有预设
  const startEditingPreset = () => {
    const currentPreset = personalityPresets.find(p => p.id === selectedPresetId);
    if (!currentPreset || currentPreset.isDefault) return;
    
    setNewPresetName(currentPreset.name);
    setIsEditingPreset(true);
  };

  // ESC键关闭模态框
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // 点击外部关闭模态框
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-1 text-sm text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors w-full max-w-sm mx-auto"
      >
        <Settings size={16} />
        <span>会话设置</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleOutsideClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 relative max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Sliders size={18} className="mr-2" />
                  会话设置
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">语音</label>
                  <select
                    value={settings.voice}
                    onChange={(e) => handleChange("voice", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">温度 ({settings.temperature})</label>
                  <input
                    type="range"
                    min="0.6"
                    max="1.2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.6 (精确)</span>
                    <span>1.2 (创意)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">人格预设</label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsCreatingPreset(true);
                        setIsEditingPreset(false);
                        setNewPresetName("");
                      }}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={14} className="mr-1" />
                      新建预设
                    </motion.button>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {personalityPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name} {preset.isDefault ? '(默认)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end space-x-2">
                      {!personalityPresets.find(p => p.id === selectedPresetId)?.isDefault && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startEditingPreset}
                            className="flex items-center text-xs text-yellow-600 hover:text-yellow-800 p-1"
                            title="编辑预设"
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deletePreset(selectedPresetId)}
                            className="flex items-center text-xs text-red-600 hover:text-red-800 p-1"
                            title="删除预设"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 创建或编辑预设 */}
                  <AnimatePresence>
                    {(isCreatingPreset || isEditingPreset) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200"
                      >
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {isCreatingPreset ? "新预设名称" : "编辑预设名称"}
                          </label>
                          <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="输入预设名称..."
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setIsCreatingPreset(false);
                              setIsEditingPreset(false);
                              setNewPresetName("");
                            }}
                            className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100"
                          >
                            取消
                          </button>
                          <button
                            onClick={isCreatingPreset ? saveNewPreset : updatePreset}
                            disabled={!newPresetName.trim()}
                            className={`text-xs text-white rounded px-2 py-1 flex items-center ${
                              newPresetName.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Save size={12} className="mr-1" />
                            保存
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">指令/人格设置</label>
                  <textarea
                    value={settings.instructions}
                    onChange={(e) => handleChange("instructions", e.target.value)}
                    placeholder="输入详细的指令，指导AI的回复风格和行为..."
                    className="w-full border border-gray-300 rounded p-2 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 