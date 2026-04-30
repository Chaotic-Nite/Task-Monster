import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Palette, Users, ChevronDown } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import MonsterPicker from './MonsterPicker';

const COLORS = [
  '#6B21A8', // Purple
  '#DC2626', // Red
  '#059669', // Green
  '#2563EB', // Blue
  '#D97706', // Orange
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
];

export default function CreateGroupModal({ isOpen, onClose, onCreate, adventuringParties = [] }) {
  const [name, setName] = useState('');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [color, setColor] = useState(COLORS[0]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedParty = adventuringParties.find(p => p.id === selectedPartyId);

    onCreate({
      name: name.trim(),
      monster_name: selectedMonster ? selectedMonster.name : 'Monster',
      monster_dnd_index: selectedMonster ? selectedMonster.dnd_index : undefined,
      monster_hp: selectedMonster ? selectedMonster.hp : undefined,
      monster_image: selectedMonster?.image || undefined,
      color,
      adventuring_party_id: selectedPartyId || undefined,
      students: selectedParty ? selectedParty.students : []
    });

    setName('');
    setSelectedMonster(null);
    setColor(COLORS[0]);
    setSelectedPartyId('');
    onClose();
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
            className="fixed inset-0 app-overlay-bg z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
              {/* Header */}
              <div 
                className="p-6 text-white"
                style={{ backgroundColor: color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Swords className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">New Hunt</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Daily Quests"
                    className="text-lg"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Monster</Label>
                  <MonsterPicker
                    selectedMonster={selectedMonster}
                    onSelect={setSelectedMonster}
                    themeColor={color}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Adventuring Party (Optional)
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPartyDropdownOpen(!isPartyDropdownOpen)}
                      className="w-full flex items-center justify-between p-3 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-left">
                        {selectedPartyId
                          ? adventuringParties.find(p => p.id === selectedPartyId)?.name
                          : 'Select a party...'
                        }
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isPartyDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPartyDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPartyId('');
                            setIsPartyDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors text-slate-500"
                        >
                          No party selected
                        </button>
                        {adventuringParties.map((party) => (
                          <button
                            key={party.id}
                            type="button"
                            onClick={() => {
                              setSelectedPartyId(party.id);
                              setIsPartyDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: party.color }}
                            />
                            <span>{party.name}</span>
                            <span className="text-sm text-slate-500">
                              ({party.students?.length || 0} students)
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  {selectedPartyId && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm font-medium text-slate-700 mb-2">Party Members:</p>
                      <div className="flex flex-wrap gap-1">
                        {adventuringParties.find(p => p.id === selectedPartyId)?.students?.map((student, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {student.name}
                          </span>
                        )) || []}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label className="flex items-center justify-center gap-2 text-center">
                    <Palette className="w-4 h-4" />
                    Theme Color
                  </Label>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c, ringColor: c }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    style={{ backgroundColor: color }}
                    disabled={!name.trim()}
                  >
                    <Swords className="w-4 h-4" />
                    Start Hunt
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}