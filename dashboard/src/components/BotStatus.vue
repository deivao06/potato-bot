<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center">
      <div 
        class="w-3 h-3 rounded-full mr-2"
        :class="statusColor"
      ></div>
      <span class="text-sm font-medium text-gray-700">{{ connectionText }}</span>
    </div>
    
    <div class="flex items-center space-x-4 text-sm text-gray-500">
      <div class="flex items-center">
        <span class="font-medium">{{ status.commandCount }}</span>
        <span class="ml-1">commands</span>
      </div>
      <div class="flex items-center">
        <span class="font-medium">{{ status.groupCount }}</span>
        <span class="ml-1">chats</span>
      </div>
      <div class="flex items-center">
        <span class="font-medium">{{ lastUpdateText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BotStatus } from '../types';

const props = defineProps<{
  status: BotStatus;
}>();

const statusColor = computed(() => {
  switch (props.status.connectionStatus) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
      return 'bg-yellow-500';
    case 'disconnected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
});

const connectionText = computed(() => {
  if (!props.status.isRunning) return 'Stopped';
  
  switch (props.status.connectionStatus) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Unknown';
  }
});

const lastUpdateText = computed(() => {
  const now = new Date();
  const lastUpdate = new Date(props.status.lastUpdate);
  const diffSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
  
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`;
  } else {
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }
});
</script>