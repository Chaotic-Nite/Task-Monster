const getTaskGroups = () => JSON.parse(localStorage.getItem('taskGroups')) || [];
const setTaskGroups = (groups) => localStorage.setItem('taskGroups', JSON.stringify(groups));

const getTasks = () => JSON.parse(localStorage.getItem('tasks')) || [];
const setTasks = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const localData = {
  entities: {
    TaskGroup: {
      filter: (criteria) => {
        const groups = getTaskGroups();
        return Object.keys(criteria).reduce((filtered, key) => {
          return filtered.filter(group => group[key] === criteria[key]);
        }, groups);
      },
      create: (data) => {
        const groups = getTaskGroups();
        const newGroup = { ...data, id: generateId() };
        groups.push(newGroup);
        setTaskGroups(groups);
        return newGroup;
      },
      update: (id, data) => {
        const groups = getTaskGroups();
        const index = groups.findIndex(g => g.id === id);
        if (index !== -1) {
          groups[index] = { ...groups[index], ...data };
          setTaskGroups(groups);
          return groups[index];
        }
        throw new Error('Group not found');
      },
      delete: (id) => {
        const groups = getTaskGroups();
        const filtered = groups.filter(g => g.id !== id);
        setTaskGroups(filtered);
      }
    },
    Task: {
      filter: (criteria) => {
        const tasks = getTasks();
        return Object.keys(criteria).reduce((filtered, key) => {
          return filtered.filter(task => task[key] === criteria[key]);
        }, tasks);
      },
      create: (data) => {
        const tasks = getTasks();
        const newTask = { ...data, id: generateId() };
        tasks.push(newTask);
        setTasks(tasks);
        return newTask;
      },
      update: (id, data) => {
        const tasks = getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...data };
          setTasks(tasks);
          return tasks[index];
        }
        throw new Error('Task not found');
      },
      delete: (id) => {
        const tasks = getTasks();
        const filtered = tasks.filter(t => t.id !== id);
        setTasks(filtered);
      }
    }
  }
};