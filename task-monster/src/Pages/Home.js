import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Plus, Swords, Shield, Trophy, Loader2, Users, X } from 'lucide-react';
import { Button } from "../Components/ui/button";
import GroupCard from '../Components/Monster/GroupCard.js';
import CreateGroupModal from '../Components/Monster/CreateGroupModal.js';
import AdventuringPartyManager from '../Components/Monster/AdventuringPartyManager.js';
import TaskManager from '../Components/Monster/TaskManager.js';
import { useUser } from '../contexts/UserContext';
import Login from '../Components/Login';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartyManagerOpen, setIsPartyManagerOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [isOverallProgressOpen, setIsOverallProgressOpen] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups', user?.username],
    queryFn: () => apiClient.getTaskGroups(),
    enabled: !!user?.username,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.username],
    queryFn: () => apiClient.getTasks(),
    enabled: !!user?.username,
    refetchOnMount: 'always',
  });

  const { data: adventuringParties = [], isLoading: partiesLoading } = useQuery({
    queryKey: ['adventuringParties', user?.username],
    queryFn: () => apiClient.getAdventuringParties(),
    enabled: !!user?.username,
  });

  const { data: lifetimeStats } = useQuery({
    queryKey: ['lifetimeStats', user?.username],
    queryFn: () => apiClient.getLifetimeStats(),
    enabled: !!user?.username,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => apiClient.createTaskGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const createPartyMutation = useMutation({
    mutationFn: (data) => apiClient.createAdventuringParty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adventuringParties'] });
    },
  });

  const updatePartyMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.updateAdventuringParty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adventuringParties'] });
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: (id) => apiClient.deleteAdventuringParty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adventuringParties'] });
    },
  });

  if (!user) {
    return <Login />;
  }

  const resolveTaskGroupId = (task) => {
    if (!task?.group_id) return null;
    if (typeof task.group_id === 'string') return task.group_id;
    return task.group_id.id || task.group_id._id || null;
  };

  const getTasksForGroup = (groupId) => {
    return tasks.filter((t) => resolveTaskGroupId(t) === groupId);
  };

  const totalMonsters = groups.length;
  const defeatedMonsters = groups.filter(g => {
    const groupTasks = getTasksForGroup(g.id);
    const totalTaskPoints = groupTasks.reduce((sum, t) => sum + t.points, 0);
    const completedPoints = groupTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    const maxHP = g.monster_hp || totalTaskPoints;
    const currentHP = Math.max(maxHP - completedPoints, 0);
    return maxHP > 0 && currentHP === 0;
  }).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overallMonstersDefeated = lifetimeStats?.monsters_defeated || 0;
  const overallCompletionRate = lifetimeStats?.overall_completion_rate || 0;

  if (groupsLoading || tasksLoading || partiesLoading) {
    return (
      <div className="min-h-screen app-page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-page-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-red-600 text-white px-6 py-3 rounded-2xl shadow-lg mb-6">
            <Swords className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">Hero's Taskforge</h1>
          </div>
          <p className="text-slate-600 text-lg">Complete tasks to defeat monsters and track your progress!</p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center shadow-sm">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-slate-800">{totalMonsters}</p>
            <p className="text-sm text-slate-500">Active Hunts</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center shadow-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-slate-800">{defeatedMonsters}</p>
            <p className="text-sm text-slate-500">Monsters Defeated</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-center shadow-sm">
            <Swords className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
            <p className="text-sm text-slate-500">Tasks Completed</p>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">Overall Progress</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-slate-600"
              onClick={() => setIsOverallProgressOpen((prev) => !prev)}
            >
              {isOverallProgressOpen ? 'Hide' : 'Show'}
              {isOverallProgressOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          {isOverallProgressOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 px-2 py-2 border border-slate-200">
                <p className="text-slate-500">Monsters Defeated (All-Time)</p>
                <p className="text-xl font-bold text-slate-800">{overallMonstersDefeated}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-2 border border-slate-200">
                <p className="text-slate-500">Overall Completion Rate</p>
                <p className="text-xl font-bold text-slate-800">{overallCompletionRate}%</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Groups Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Your Quests</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsTaskManagerOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Manage Tasks
            </Button>
            <Button
              onClick={() => setIsPartyManagerOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Parties
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Quest
            </Button>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Quests yet</h3>
            <p className="text-slate-500 mb-6">Create a new quest to start defeating monsters!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GroupCard 
                  group={group} 
                  tasks={getTasksForGroup(group.id)} 
                />
              </motion.div>
            ))}
          </div>
        )}

        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={createGroupMutation.mutate}
          adventuringParties={adventuringParties}
        />

        <AdventuringPartyManager
          isOpen={isPartyManagerOpen}
          onClose={() => setIsPartyManagerOpen(false)}
          parties={adventuringParties}
          onCreate={createPartyMutation.mutate}
          onUpdate={updatePartyMutation.mutate}
          onDelete={deletePartyMutation.mutate}
        />

        {isTaskManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 app-overlay-bg">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Manage Quest Presets
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsTaskManagerOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                <TaskManager showTaskActions={false} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}