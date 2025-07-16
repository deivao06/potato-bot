import axios from 'axios';
import { BotMessage, BotGroup, BotStatus } from '../types';

const API_BASE_URL = '/api';

export const dashboardApi = {
  async getBotStatus(): Promise<BotStatus> {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  },

  async getMessages(limit: number = 100): Promise<BotMessage[]> {
    const response = await axios.get(`${API_BASE_URL}/messages`, {
      params: { limit }
    });
    return response.data;
  },

  async getGroups(): Promise<BotGroup[]> {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    return response.data;
  },

  async getGroupMessages(groupId: string, limit: number = 50): Promise<BotMessage[]> {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/messages`, {
      params: { limit }
    });
    return response.data;
  }
};