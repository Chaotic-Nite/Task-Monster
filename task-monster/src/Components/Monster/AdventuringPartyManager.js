import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const COLORS = [
  '#3B82F6',
  '#2563EB',
  '#1D4ED8',
  '#0891B2',
  '#06B6D4',
  '#10B981',
  '#059669',
  '#16A34A',
  '#65A30D',
  '#84CC16',
  '#F59E0B',
  '#D97706',
  '#F97316',
  '#EA580C',
  '#EF4444',
  '#DC2626',
  '#E11D48',
  '#DB2777',
  '#EC4899',
  '#BE185D',
  '#7C3AED',
  '#6D28D9',
  '#8B5CF6',
  '#4F46E5',
  '#334155',
  '#475569',
  '#6B7280',
  '#111827',
];

export default function AdventuringPartyManager({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  parties = [],
  editingParty = null
}) {
  const [activeEditingParty, setActiveEditingParty] = useState(editingParty);
  const [name, setName] = useState(editingParty?.name || '');
  const [description, setDescription] = useState(editingParty?.description || '');
  const [color, setColor] = useState(editingParty?.color || COLORS[0]);
  const [students, setStudents] = useState(editingParty?.students || []);
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    if (editingParty) {
      setActiveEditingParty(editingParty);
      setName(editingParty.name || '');
      setDescription(editingParty.description || '');
      setColor(editingParty.color || COLORS[0]);
      setStudents(editingParty.students || []);
    }
  }, [editingParty]);

  const resetForm = () => {
    setActiveEditingParty(null);
    setName('');
    setDescription('');
    setColor(COLORS[0]);
    setStudents([]);
    setNewStudentName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const partyData = {
      name: name.trim(),
      description: description.trim(),
      color,
      students
    };

    if (activeEditingParty) {
      onUpdate({ id: activeEditingParty.id, data: partyData });
    } else {
      onCreate(partyData);
    }

    resetForm();
  };

  const addStudent = () => {
    if (!newStudentName.trim()) return;

    const newStudent = {
      name: newStudentName.trim()
    };

    setStudents([...students, newStudent]);
    setNewStudentName('');
  };

  const removeStudent = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleMoveStudent = (student, studentIndex, targetPartyId) => {
    if (!activeEditingParty || !targetPartyId || targetPartyId === activeEditingParty.id) return;

    const sourceParty = parties.find((party) => party.id === activeEditingParty.id);
    const targetParty = parties.find((party) => party.id === targetPartyId);
    if (!sourceParty || !targetParty) return;

    const targetStudents = targetParty.students || [];
    const alreadyInTarget = targetStudents.some((existing) => existing.name === student.name);
    if (alreadyInTarget) return;

    const sourceStudents = sourceParty.students || [];
    const sourceRemovalIndex = sourceStudents.findIndex((existing) => existing.name === student.name);
    if (sourceRemovalIndex === -1) return;

    const nextSourceStudents = sourceStudents.filter((_, i) => i !== sourceRemovalIndex);
    const nextTargetStudents = [...targetStudents, student];

    onUpdate({
      id: sourceParty.id,
      data: {
        name: sourceParty.name,
        description: sourceParty.description || '',
        color: sourceParty.color,
        students: nextSourceStudents,
      },
    });

    onUpdate({
      id: targetParty.id,
      data: {
        name: targetParty.name,
        description: targetParty.description || '',
        color: targetParty.color,
        students: nextTargetStudents,
      },
    });

    // Keep current edit form in sync after moving out the selected student.
    setStudents((prev) => prev.filter((_, i) => i !== studentIndex));
  };

  const startEditing = (party) => {
    setActiveEditingParty(party);
    setName(party.name);
    setDescription(party.description || '');
    setColor(party.color);
    setStudents(party.students || []);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-6 lg:inset-10 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-800">
                    {activeEditingParty ? 'Edit Adventuring Party' : 'Manage Adventuring Parties'}
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex h-full">
                  {/* Party List */}
                  <div className="w-2/5 border-r border-slate-200 p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-700">Your Parties</h3>
                      <Button type="button" size="sm" variant="outline" onClick={resetForm}>New</Button>
                    </div>
                    <div className="space-y-3">
                      {parties.map((party) => (
                        <motion.div
                          key={party.id}
                          className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => startEditing(party)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-800">{party.name}</h4>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: party.color }}
                            />
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {party.students?.length || 0} students
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(party);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(party.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {parties.length === 0 && (
                        <p className="text-slate-500 text-center py-8">
                          No parties yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Party Form */}
                  <div className="flex-1 p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="party-name">Party Name</Label>
                        <Input
                          id="party-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter party name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="party-description">Description (Optional)</Label>
                        <Input
                          id="party-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brief description of the party"
                        />
                      </div>

                      <div>
                        <Label>Party Color</Label>
                        <div className="mt-2 w-full overflow-x-auto">
                          <div className="flex justify-center gap-2 min-w-max mx-auto px-2 py-2">
                            {COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                className={`w-8 h-8 rounded-full shrink-0 border-2 transition-transform hover:scale-105 ${
                                  color === c ? 'border-slate-900 ring-2 ring-offset-1 ring-slate-400' : 'border-slate-300'
                                }`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Adventurers</Label>
                        <div className="space-y-3 mt-2">
                          {students.map((student, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">{student.name}</p>
                              </div>
                              {parties.filter((party) => party.id !== activeEditingParty?.id).length > 0 && (
                                <Select onValueChange={(value) => handleMoveStudent(student, index, value)}>
                                  <SelectTrigger className="w-36 h-8 text-xs">
                                    <SelectValue placeholder="Move to..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {parties
                                      .filter((party) => party.id !== activeEditingParty?.id)
                                      .map((party) => (
                                        <SelectItem key={party.id} value={party.id}>
                                          {party.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          <div className="flex gap-2">
                            <Input
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              placeholder="Adventurer's name"
                              className="flex-1"
                            />
                            <Button type="button" onClick={addStudent}>
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                          {activeEditingParty ? 'Update Party' : 'Create Party'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Reset
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}