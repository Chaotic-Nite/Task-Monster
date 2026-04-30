import React, { useEffect, useMemo, useState } from 'react';
import { BookmarkPlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { apiClient } from '../../api/apiClient';
import { useUser } from '../../contexts/UserContext';

function loadTaskPresets(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTaskPresets(key, presets) {
  localStorage.setItem(key, JSON.stringify(presets));
}

export default function TaskManager({
  onQuickAdd = () => {},
  onUsePreset = () => {},
  showTaskActions = true,
  themeColor = '#6B21A8',
  onPresetsChanged = () => {}
}) {
  const { user } = useUser();
  const [presets, setPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPoints, setNewPoints] = useState(10);
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoints, setEditPoints] = useState(10);

  const taskPresetsKey = useMemo(() => {
    const userKey = user?.id || user?.username || user?.email || 'anonymous';
    return `taskMonsterTaskPresets:${userKey}`;
  }, [user]);

  const updatePresetsState = (nextPresetsOrUpdater) => {
    setPresets((currentPresets) => {
      const nextPresets = typeof nextPresetsOrUpdater === 'function'
        ? nextPresetsOrUpdater(currentPresets)
        : nextPresetsOrUpdater;
      saveTaskPresets(taskPresetsKey, nextPresets);
      onPresetsChanged(nextPresets);
      return nextPresets;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadPresets = async () => {
      const localPresets = loadTaskPresets(taskPresetsKey);
      if (isMounted) {
        setPresets(localPresets);
      }

      try {
        setIsLoading(true);
        const remotePresets = await apiClient.getTaskPresets();
        if (!isMounted) return;
        setPresets(remotePresets);
        saveTaskPresets(taskPresetsKey, remotePresets);
      } catch (error) {
        // Keep local presets when API is unavailable.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPresets();

    return () => {
      isMounted = false;
    };
  }, [taskPresetsKey]);

  const handleAddPreset = async () => {
    if (!newTitle.trim()) return;

    const normalizedPoints = Math.max(1, Math.min(Number(newPoints) || 10, 999));

    try {
      const createdPreset = await apiClient.createTaskPreset({
        title: newTitle.trim(),
        points: normalizedPoints,
      });
      updatePresetsState((currentPresets) => [createdPreset, ...currentPresets]);
    } catch {
      const localPreset = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        points: normalizedPoints,
      };
      updatePresetsState((currentPresets) => [localPreset, ...currentPresets]);
    }

    setNewTitle('');
    setNewPoints(10);
  };

  const handleStartEdit = (preset) => {
    setEditingPresetId(preset.id);
    setEditTitle(preset.title);
    setEditPoints(preset.points);
  };

  const handleCancelEdit = () => {
    setEditingPresetId(null);
    setEditTitle('');
    setEditPoints(10);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editingPresetId) return;
    const normalizedPoints = Math.max(1, Math.min(Number(editPoints) || 1, 999));

    try {
      const updated = await apiClient.updateTaskPreset(editingPresetId, {
        title: editTitle.trim(),
        points: normalizedPoints,
      });
      updatePresetsState((currentPresets) => currentPresets.map((preset) => (preset.id === editingPresetId ? updated : preset)));
    } catch {
      updatePresetsState((currentPresets) => (
        currentPresets.map((preset) => (
          preset.id === editingPresetId
            ? { ...preset, title: editTitle.trim(), points: normalizedPoints }
            : preset
        ))
      ));
    }

    handleCancelEdit();
  };

  const handleDeletePreset = async (id) => {
    try {
      await apiClient.deleteTaskPreset(id);
    } catch {
      // Still remove locally so the UI remains usable offline.
    }
    updatePresetsState((currentPresets) => currentPresets.filter((preset) => preset.id !== id));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BookmarkPlus className="w-4 h-4" style={{ color: themeColor }} />
        <h4 className="font-semibold text-slate-700">Task Presets</h4>
      </div>

      <div className="space-y-3">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Preset task title"
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddPreset();
            }
          }}
        />

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Damage Points</span>
            <input
              type="number"
              min={1}
              max={999}
              value={newPoints}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) setNewPoints(Math.min(val, 999));
              }}
              className="w-20 text-center text-lg font-bold px-2 py-1 rounded-lg text-white border-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ backgroundColor: themeColor }}
            />
          </div>
          <Slider
            value={[Math.min(newPoints, 100)]}
            onValueChange={([val]) => setNewPoints(val)}
            min={5}
            max={100}
            step={5}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Easy (5)</span>
            <span>Hard (100)</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" className="gap-2" style={{ backgroundColor: themeColor }} onClick={handleAddPreset}>
            <Plus className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {isLoading && <p className="text-sm text-slate-500">Loading presets...</p>}
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            {editingPresetId === preset.id ? (
              <>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={editPoints}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) setEditPoints(Math.min(val, 999));
                  }}
                  className="w-20"
                />
                <Button type="button" size="icon" variant="outline" onClick={handleSaveEdit}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={handleCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{preset.title}</p>
                  <p className="text-xs text-slate-500">{preset.points} damage</p>
                </div>
                {showTaskActions && (
                  <>
                    <Button type="button" size="sm" variant="outline" onClick={() => onUsePreset(preset)}>
                      Use
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: themeColor }}
                      onClick={() => onQuickAdd(preset)}
                    >
                      Quick Add
                    </Button>
                  </>
                )}
                <Button type="button" size="icon" variant="ghost" onClick={() => handleStartEdit(preset)}>
                  <Pencil className="w-4 h-4 text-slate-600" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => handleDeletePreset(preset.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        ))}

        {presets.length === 0 && (
          <p className="text-sm text-slate-500">No presets yet. Save one above to reuse it quickly.</p>
        )}
      </div>
    </div>
  );
}
