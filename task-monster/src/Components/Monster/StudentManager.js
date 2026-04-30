import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, X } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

export default function ParticipantManager({ 
  group, 
  onAddParticipant, 
  onRemoveParticipant,
  themeColor = "#6B21A8" 
}) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const participants = group.participants || [];
  const hasAdventuringParty = group.students && group.students.length > 0;
  const title = hasAdventuringParty ? "Additional Party Members" : "Party Members";

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const trimmedName = name.trim();
    if (participants.includes(trimmedName)) {
      alert('This person is already a participant');
      return;
    }
    
    onAddParticipant(trimmedName);
    setName('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: themeColor }} />
          <h3 className="font-semibold text-slate-700">{title}</h3>
          <Badge variant="secondary">{participants.length}</Badge>
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Add Party Member</h4>
                <p className="text-xs text-slate-500">
                  Enter the name of the adventurer you want to add
                </p>
              </div>
              <Input
                type="text"
                placeholder="Adventurer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button 
                type="submit" 
                className="w-full gap-2"
                style={{ backgroundColor: themeColor }}
                disabled={!name.trim()}
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* Participants */}
        <AnimatePresence>
          {participants.map((participantName) => (
            <motion.div
              key={participantName}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="relative group/member"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold border-2 border-white shadow-md"
              >
                {participantName[0].toUpperCase()}
              </div>
              
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover/member:opacity-100 transition-opacity pointer-events-none z-10">
                {participantName}
              </div>
              
              <button
                onClick={() => onRemoveParticipant(participantName)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-opacity shadow hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {participants.length === 0 && (
          <p className="text-sm text-slate-500 py-2">
            No other members yet
          </p>
        )}
      </div>
    </div>
  );
}