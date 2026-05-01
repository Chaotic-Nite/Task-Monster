import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trash2, Loader2,
  ListTodo, Trophy, RefreshCw, Users
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import MonsterBattle from '../Components/Monster/MonsterBattle.js';
import TaskItem from '../Components/Monster/TaskItem.js';
import AddTaskForm from '../Components/Monster/AddTaskForm.js';
import StudentManager from '../Components/Monster/StudentManager.js';
import { useUser } from '../contexts/UserContext';
import Login from '../Components/Login';

export default function QuestDetail() {
  const { id } = useParams();
  const questId = id;

  const [isAttacking, setIsAttacking] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: quest, isLoading: questLoading } = useQuery({
    queryKey: ['quest', questId],
    queryFn: () => (questId && questId !== 'undefined') ? apiClient.getQuest(questId) : Promise.resolve(null),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', questId],
    queryFn: () => (questId && questId !== 'undefined') ? apiClient.getTasks(questId) : Promise.resolve([]),
  });

  const { data: adventuringParty } = useQuery({
    queryKey: ['adventuringParty', quest?.adventuring_party_id],
    queryFn: () => quest?.adventuring_party_id ? apiClient.getAdventuringParty(quest.adventuring_party_id) : Promise.resolve(null),
    enabled: !!quest?.adventuring_party_id,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => apiClient.createTask({ ...data, quest_id: questId, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', questId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['lifetimeStats'] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (task) => apiClient.updateTask(task.id, {
      completed: true,
      completed_at: new Date().toISOString()
    }),
    onMutate: (task) => {
      const damage = Math.min(task.points, Math.max(currentHP, 0));
      setLastDamage(damage);
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 600);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', questId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['lifetimeStats'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (task) => apiClient.deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', questId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['lifetimeStats'] });
    },
  });

  const deleteQuestMutation = useMutation({
    mutationFn: async () => {
      for (const task of tasks) {
        await apiClient.deleteTask(task.id);
      }
      await apiClient.deleteQuest(questId);
    },
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  const resetTasksMutation = useMutation({
    mutationFn: async () => {
      for (const task of tasks.filter((task) => task.completed)) {
        await apiClient.updateTask(task.id, { completed: false, completed_at: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', questId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['lifetimeStats'] });
    },
  });

  const updateQuestMutation = useMutation({
    mutationFn: (data) => apiClient.updateQuest(questId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest', questId] });
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, assignedTo }) => apiClient.updateTask(taskId, { assigned_to: assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', questId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.username] });
    },
  });

  if (!user) {
    return <Login />;
  }

  const handleAddParticipant = (name) => {
    const currentParticipants = quest.participants || [];

    if (!currentParticipants.includes(name)) {
      updateQuestMutation.mutate({
        participants: [...currentParticipants, name]
      });
    }
  };

  const handleRemoveParticipant = (name) => {
    const currentParticipants = quest.participants || [];
    updateQuestMutation.mutate({
      participants: currentParticipants.filter((participant) => participant !== name)
    });
  };

  const handleAssignTask = (task, assignedTo) => {
    assignTaskMutation.mutate({ taskId: task.id, assignedTo });
  };

  const totalHP = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.points, 0);
  const monsterMaxHP = quest?.monster_hp || totalHP;
  const currentHP = Math.max(monsterMaxHP - completedPoints, 0);
  const isDead = currentHP <= 0 && monsterMaxHP > 0;

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const adventuringPartyStudents = quest?.students || [];
  const legacyParticipants = quest?.participants || [];
  const adventuringPartyNames = adventuringPartyStudents.map((student) => student.name);
  const manageableParticipants = legacyParticipants;
  const allPartyMembers = [...new Set([...adventuringPartyNames, ...legacyParticipants])];

  if (!questId || questId === 'undefined') {
    return (
      <div className="min-h-screen app-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid quest ID</p>
          <Link to={'/'}>
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (questLoading || tasksLoading) {
    return (
      <div className="min-h-screen app-page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen app-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Quest not found</p>
          <Link to={'/'}>
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const themeColor = quest.color || '#6B21A8';

  return (
    <div className="min-h-screen app-page-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to={'/'}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {isDead && (
              <Button variant="outline" className="gap-2" onClick={() => resetTasksMutation.mutate()}>
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            {isDeleteDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 app-overlay-bg">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Quest?</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      This will permanently delete "{quest.name}" and all its tasks. This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                        onClick={() => {
                          deleteQuestMutation.mutate();
                          setIsDeleteDialogOpen(false);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-slate-800">{quest.name}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5" style={{ color: themeColor }} />
                Active Tasks ({pendingTasks.length})
              </h2>

              <div className="space-y-3">
                <AnimatePresence>
                  {pendingTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      themeColor={themeColor}
                      participants={allPartyMembers}
                      onComplete={completeTaskMutation.mutate}
                      onDelete={deleteTaskMutation.mutate}
                      onAssign={handleAssignTask}
                      disabled={isDead}
                    />
                  ))}
                </AnimatePresence>

                <AddTaskForm
                  onAdd={createTaskMutation.mutate}
                  participants={allPartyMembers}
                  themeColor={themeColor}
                />
              </div>
            </div>

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  Completed ({completedTasks.length})
                </h2>

                <div className="space-y-3">
                  <AnimatePresence>
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        themeColor={themeColor}
                        participants={allPartyMembers}
                        onComplete={() => {}}
                        onDelete={deleteTaskMutation.mutate}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6">
            <motion.div
              className="bg-white rounded-[5px] shadow-lg border border-slate-200 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MonsterBattle
                monsterName={quest.monster_name || 'Monster'}
                monsterImage={quest.monster_image}
                totalHP={monsterMaxHP}
                currentHP={currentHP}
                themeColor={themeColor}
                isAttacking={isAttacking}
                lastDamage={lastDamage}
              />

              {isDead && (
                <motion.div
                  className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Trophy className="w-10 h-10 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Victory!</h3>
                  <p className="text-green-100">You've defeated {quest.monster_name || 'the monster'}!</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {adventuringParty && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: adventuringParty.color }} />
                <h3 className="text-lg font-semibold text-slate-800">
                  Adventuring Party: {adventuringParty.name}<Badge variant="secondary">| {adventuringPartyStudents.length}</Badge>
                </h3>
              </div>
              {adventuringParty.description && (
                <p className="text-slate-600 mb-4">{adventuringParty.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {adventuringParty.students?.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{student.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <StudentManager
            group={{ ...quest, participants: manageableParticipants }}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            themeColor={themeColor}
          />
        </div>
      </div>
    </div>
  );
}