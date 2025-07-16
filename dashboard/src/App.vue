<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-gray-900">Potato Bot Dashboard</h1>
          </div>
          <BotStatusComponent :status="botStatus" />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Offline Warning -->
        <div v-if="isOffline" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Bot is Offline</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Cannot connect to the bot server. Please start the bot with <code class="bg-red-100 px-1 rounded">yarn start:dev</code> to see live data.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chats Panel -->
          <div class="lg:col-span-1">
            <GroupsList 
              :groups="groups" 
              :selectedGroup="selectedGroup"
              @select-group="selectGroup"
            />
          </div>
          
          <!-- Messages Panel -->
          <div class="lg:col-span-2">
            <MessagesList 
              :messages="displayMessages"
              :isLoading="isLoading"
              :selectedGroup="selectedGroup"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { BotMessage, BotGroup, BotStatus } from './types';
import BotStatusComponent from './components/BotStatus.vue';
import GroupsList from './components/GroupsList.vue';
import MessagesList from './components/MessagesList.vue';
import { dashboardApi } from './api/dashboard-api';

const botStatus = ref<BotStatus>({
  isRunning: false,
  connectionStatus: 'disconnected',
  lastUpdate: new Date(),
  commandCount: 0,
  groupCount: 0
});

const groups = ref<BotGroup[]>([]);
const messages = ref<BotMessage[]>([]);
const selectedGroup = ref<string | null>(null);
const isLoading = ref(false);
const isOffline = ref(false);
const offlineRetryCount = ref(0);
const maxRetries = 3;

const displayMessages = computed(() => {
  if (selectedGroup.value) {
    return messages.value.filter(msg => msg.groupId === selectedGroup.value);
  }
  return messages.value;
});

const selectGroup = (groupId: string | null) => {
  selectedGroup.value = groupId;
  if (groupId) {
    loadGroupMessages(groupId);
  } else {
    loadAllMessages();
  }
};

const loadBotStatus = async () => {
  try {
    const status = await dashboardApi.getBotStatus();
    botStatus.value = status;
    isOffline.value = false;
    offlineRetryCount.value = 0;
  } catch (error) {
    console.error('Failed to load bot status:', error);
    handleOfflineError();
  }
};

const loadGroups = async () => {
  try {
    const groupsData = await dashboardApi.getGroups();
    groups.value = groupsData;
    isOffline.value = false;
    offlineRetryCount.value = 0;
  } catch (error) {
    console.error('Failed to load groups:', error);
    handleOfflineError();
  }
};

const loadAllMessages = async () => {
  isLoading.value = true;
  try {
    const messagesData = await dashboardApi.getMessages();
    messages.value = messagesData;
    isOffline.value = false;
    offlineRetryCount.value = 0;
  } catch (error) {
    console.error('Failed to load messages:', error);
    handleOfflineError();
  } finally {
    isLoading.value = false;
  }
};

const loadGroupMessages = async (groupId: string) => {
  isLoading.value = true;
  try {
    const messagesData = await dashboardApi.getGroupMessages(groupId);
    messages.value = messagesData;
    isOffline.value = false;
    offlineRetryCount.value = 0;
  } catch (error) {
    console.error('Failed to load group messages:', error);
    handleOfflineError();
  } finally {
    isLoading.value = false;
  }
};

const handleOfflineError = () => {
  isOffline.value = true;
  offlineRetryCount.value += 1;
  
  // Set bot status to offline
  botStatus.value = {
    isRunning: false,
    connectionStatus: 'disconnected',
    lastUpdate: new Date(),
    commandCount: 0,
    groupCount: 0
  };
  
  // Clear data when offline
  if (offlineRetryCount.value >= maxRetries) {
    groups.value = [];
    messages.value = [];
  }
};

const refreshData = async () => {
  // Skip API calls if we've exceeded retry attempts
  if (isOffline.value && offlineRetryCount.value >= maxRetries) {
    console.log('Bot is offline, skipping API calls');
    return;
  }
  
  await Promise.all([
    loadBotStatus(),
    loadGroups(),
    selectedGroup.value ? loadGroupMessages(selectedGroup.value) : loadAllMessages()
  ]);
};

onMounted(() => {
  refreshData();
  
  // Set up periodic refresh
  setInterval(refreshData, 5000);
});
</script>