import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { ChevronRight, Sword, Target, Skull, Sparkles, Users } from 'lucide-react';

export default function QuestCard({ quest, tasks }) {
  const participantCount = quest.students?.length || 1 + (quest.participants?.length || 0);
  const totalTaskPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.points, 0);
  const maxHP = quest.monster_hp || totalTaskPoints;
  const currentHP = Math.max(maxHP - completedPoints, 0);
  const remainingPercent = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const isDead = currentHP <= 0 && maxHP > 0;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <Link to={`/quest/${quest.id}`}>
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30"
          style={{ backgroundColor: quest.color || '#6B21A8' }}
        />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-900">
              {quest.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Target className="w-4 h-4" />
              <span>{quest.monster_name || 'Monster'}</span>
            </div>
          </div>

          {isDead ? (
            <div className="p-2 rounded-xl bg-green-100">
              <Skull className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${quest.color || '#6B21A8'}20` }}
            >
              <Sword className="w-6 h-6" style={{ color: quest.color || '#6B21A8' }} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Monster HP</span>
              <span className="font-mono font-medium" style={{ color: quest.color || '#6B21A8' }}>
                {currentHP} / {maxHP}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: isDead ? '#22C55E' : (quest.color || '#6B21A8') }}
                initial={{ width: 0 }}
                animate={{ width: `${remainingPercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">
                <span className="font-semibold text-slate-700">{completedTasks}</span> / {tasks.length} tasks
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="font-semibold text-slate-700">{participantCount}</span>
              </span>
            </div>

            {isDead && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Victory!
              </div>
            )}

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}