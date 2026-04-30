import React from 'react';
import { motion } from 'framer-motion';
import { Check, Swords, Trash2, Zap, User } from 'lucide-react';
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


export default function TaskItem({ 
  task, 
  onComplete, 
  onDelete,
  onAssign,
  participants = [],
  themeColor = "#6B21A8",
  disabled = false
}) {
  const allMembers = participants;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
        task.completed 
          ? "bg-slate-50 border-slate-200" 
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
      )}
    >
      {/* Points Badge */}
      <div 
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors",
          task.completed ? "bg-slate-200 text-slate-500" : "text-white"
        )}
        style={{ backgroundColor: task.completed ? undefined : themeColor }}
      >
        <Zap className="w-3.5 h-3.5" />
        {task.points}
      </div>
      
      {/* Task Title */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "font-medium transition-all block",
          task.completed 
            ? "text-slate-400 line-through" 
            : "text-slate-700"
        )}>
          {task.title}
        </span>
        {task.assigned_to && (
          <div className="flex items-center gap-1 mt-1">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 truncate">
              {task.assigned_to}
            </span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {!task.completed && onAssign && (
          <Select
            value={task.assigned_to || 'unassigned'}
            onValueChange={(value) => onAssign(task, value === 'unassigned' ? null : value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                <span className="text-slate-500">Unassigned</span>
              </SelectItem>
              {allMembers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {!task.completed && (
          <Button
            size="sm"
            onClick={() => onComplete(task)}
            disabled={disabled}
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: themeColor }}
          >
            <Swords className="w-4 h-4" />
            Attack!
          </Button>
        )}
        
        {task.completed && (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Done</span>
          </div>
        )}
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(task)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}