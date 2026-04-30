import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, X, Zap, User } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import TaskManager from './TaskManager';
import { apiClient } from '../../api/apiClient';
import { useUser } from '../../contexts/UserContext';

function loadLocalPresets(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AddTaskForm({ onAdd, participants = [], themeColor = "#6B21A8" }) {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(10);
  const [assignedTo, setAssignedTo] = useState('');
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('none');
  const [isOpen, setIsOpen] = useState(false);
  const [isTaskManagerModalOpen, setIsTaskManagerModalOpen] = useState(false);
  
  const allMembers = participants;

  const resetTaskDraft = () => {
    setTitle('');
    setPoints(10);
    setAssignedTo('');
    setSelectedPresetId('none');
  };

  const presetStorageKey = useMemo(() => {
    const userKey = user?.id || user?.username || user?.email || 'anonymous';
    return `taskMonsterTaskPresets:${userKey}`;
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const localPresets = loadLocalPresets(presetStorageKey);
    if (mounted) {
      setPresets(localPresets);
    }

    const loadRemotePresets = async () => {
      try {
        const remotePresets = await apiClient.getTaskPresets();
        if (mounted) {
          setPresets(remotePresets);
        }
      } catch {
        // Keep local presets if backend call fails.
      }
    };

    loadRemotePresets();

    return () => {
      mounted = false;
    };
  }, [isOpen, presetStorageKey, isTaskManagerModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({ 
      title: title.trim(), 
      points,
      assigned_to: assignedTo || null
    });
    resetTaskDraft();
    setIsOpen(false);
  };

  const handleUsePreset = (preset) => {
    setTitle(preset.title);
    setPoints(preset.points);
    setSelectedPresetId(preset.id);
  };

  const handleQuickAddPreset = (preset) => {
    onAdd({
      title: preset.title,
      points: preset.points,
      assigned_to: null,
    });
  };

  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => {
          resetTaskDraft();
          setIsOpen(true);
        }}
        className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus className="w-5 h-5" />
        Add New Task
      </motion.button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="p-5 rounded-xl bg-white border border-slate-200 shadow-lg space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600">Task Preset</label>
        <div className="flex flex-col md:flex-row gap-2">
          <Select
            value={selectedPresetId}
            onValueChange={(value) => {
              setSelectedPresetId(value);
              const preset = presets.find((item) => item.id === value);
              if (preset) {
                handleUsePreset(preset);
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Quick select a saved task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-slate-500">No preset selected</span>
              </SelectItem>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.title} ({preset.points})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!selectedPreset || selectedPresetId === 'none'}
            onClick={() => selectedPreset && handleQuickAddPreset(selectedPreset)}
          >
            <Plus className="w-4 h-4" />
            Quick Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsTaskManagerModalOpen(true)}
        >
          <BookOpen className="w-4 h-4" />
          Manage Task Presets
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What task will you complete?"
        className="text-lg"
        autoFocus
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <User className="w-4 h-4" />
          Assign To
        </label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger>
            <SelectValue placeholder="Anyone can complete" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>
              <span className="text-slate-500">Unassigned</span>
            </SelectItem>
            {allMembers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: themeColor }} />
            Damage Points
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={points}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) setPoints(Math.min(val, 999));
            }}
            className="w-20 text-center text-lg font-bold px-2 py-1 rounded-lg text-white border-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ backgroundColor: themeColor }}
          />
        </div>
        <Slider
          value={[Math.min(points, 100)]}
          onValueChange={([val]) => setPoints(val)}
          min={5}
          max={100}
          step={5}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Easy (5)</span>
          <span>Hard (100)</span>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetTaskDraft();
            setIsOpen(false);
          }}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 gap-2"
          style={{ backgroundColor: themeColor }}
          disabled={!title.trim()}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {isTaskManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Manage Task Presets
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsTaskManagerModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <TaskManager
                onQuickAdd={handleQuickAddPreset}
                onUsePreset={handleUsePreset}
                showTaskActions={false}
                themeColor={themeColor}
                onPresetsChanged={(nextPresets) => {
                  setPresets(nextPresets);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.form>
  );
}