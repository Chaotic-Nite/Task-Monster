const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Transform MongoDB _id to id for frontend consistency
      const transformData = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(transformData);
        } else if (obj && typeof obj === 'object' && obj._id) {
          const { _id, ...rest } = obj;
          return { id: _id, ...rest };
        }
        return obj;
      };

      return transformData(data);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getLifetimeStats() {
    return this.request('/auth/stats');
  }

  async updateProfile(userData) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Quest methods
  async getQuests() {
    return this.request('/quests');
  }

  async getQuest(id) {
    return this.request(`/quests/${id}`);
  }

  async createQuest(questData) {
    return this.request('/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  async updateQuest(id, questData) {
    return this.request(`/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questData),
    });
  }

  async deleteQuest(id) {
    return this.request(`/quests/${id}`, {
      method: 'DELETE',
    });
  }

  // Backward-compatible task group aliases
  async getTaskGroups() {
    return this.getQuests();
  }

  async getTaskGroup(id) {
    return this.getQuest(id);
  }

  async createTaskGroup(groupData) {
    return this.createQuest(groupData);
  }

  async updateTaskGroup(id, groupData) {
    return this.updateQuest(id, groupData);
  }

  async deleteTaskGroup(id) {
    return this.deleteQuest(id);
  }

  // Adventuring Party methods
  async getAdventuringParties() {
    return this.request('/adventuring-parties');
  }

  async getAdventuringParty(id) {
    return this.request(`/adventuring-parties/${id}`);
  }

  async createAdventuringParty(partyData) {
    return this.request('/adventuring-parties', {
      method: 'POST',
      body: JSON.stringify(partyData),
    });
  }

  async updateAdventuringParty(id, partyData) {
    return this.request(`/adventuring-parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partyData),
    });
  }

  async deleteAdventuringParty(id) {
    return this.request(`/adventuring-parties/${id}`, {
      method: 'DELETE',
    });
  }

  // Quest Preset methods
  async getTaskPresets() {
    return this.request('/quest-presets');
  }

  async createTaskPreset(presetData) {
    return this.request('/quest-presets', {
      method: 'POST',
      body: JSON.stringify(presetData),
    });
  }

  async updateTaskPreset(id, presetData) {
    return this.request(`/quest-presets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(presetData),
    });
  }

  async deleteTaskPreset(id) {
    return this.request(`/quest-presets/${id}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(questId = null) {
    const query = questId ? `?quest_id=${questId}` : '';
    return this.request(`/tasks${query}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();