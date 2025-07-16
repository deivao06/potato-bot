<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Chats</h3>
        <button
          @click="$emit('select-group', null)"
          class="text-sm text-blue-600 hover:text-blue-800"
          :class="{ 'font-semibold': !selectedGroup }"
        >
          All Chats
        </button>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="group in groups" 
          :key="group.id"
          class="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50 border-blue-200': selectedGroup === group.id }"
          @click="$emit('select-group', group.id)"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-medium text-gray-900">{{ group.name }}</h4>
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="group.chatType === 'group' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                >
                  {{ group.chatType === 'group' ? '👥 Group' : '👤 Private' }}
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ group.messageCount }} messages</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">{{ formatTime(group.lastActivity) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="groups.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500">No chats found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BotGroup } from '../types';

defineProps<{
  groups: BotGroup[];
  selectedGroup: string | null;
}>();

defineEmits<{
  'select-group': [groupId: string | null];
}>();

const formatTime = (date: Date) => {
  const now = new Date();
  const activity = new Date(date);
  const diffSeconds = Math.floor((now.getTime() - activity.getTime()) / 1000);
  
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`;
  } else if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  } else {
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  }
};
</script>