<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ selectedGroup ? 'Chat Messages' : 'All Messages' }}
        </h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ messages.length }} messages</span>
          <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      </div>
      
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="border rounded-lg transition-colors"
          :class="{ 'border-blue-200': expandedMessages.has(message.id) }"
        >
          <!-- Card Header (always visible) -->
          <div 
            class="p-4 hover:bg-gray-50 cursor-pointer"
            @click="toggleMessage(message.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="message.isReaction ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'"
                  >
                    {{ message.isReaction ? '👍' : '⚡' }}
                    {{ message.isReaction ? (message.reactionToCommand ? `Reaction to ${message.reactionToCommand}` : 'Reaction') : 'Command' }}
                  </span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ message.isReaction && message.reactionToCommand ? message.reactionToCommand : message.command }}
                  </span>
                  <span v-if="message.reactionEmoji" class="text-lg">{{ message.reactionEmoji }}</span>
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="message.chatType === 'group' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                  >
                    {{ message.chatType === 'group' ? '👥' : '👤' }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-700 mb-2">
                  {{ message.isReaction && message.reactionToCommand && message.reactionEmoji 
                     ? `Reaction ${message.reactionEmoji} to command ${message.reactionToCommand}` 
                     : message.messageText }}
                </p>
                
                <!-- Show reaction context if available -->
                <div v-if="message.isReaction && message.reactionToMessageText" class="bg-gray-50 p-2 rounded text-xs mb-2">
                  <span class="text-gray-600">Reacted to:</span>
                  <span class="font-medium">{{ message.reactionToMessageText }}</span>
                </div>
                
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span class="flex items-center font-medium">
                    <span class="mr-1">💬</span>
                    {{ message.groupName }}
                  </span>
                  <span class="flex items-center">
                    <span class="mr-1">📱</span>
                    {{ formatPhone(message.senderPhone) }}
                  </span>
                  <span v-if="message.senderName" class="flex items-center">
                    <span class="mr-1">👤</span>
                    {{ message.senderName }}
                  </span>
                  <span>{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
              
              <!-- Expand/Collapse Indicator -->
              <div class="ml-4 flex items-center">
                <span v-if="message.botResponse" class="text-xs text-gray-500 mr-2">
                  Bot responded
                </span>
                <svg 
                  class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                  :class="{ 'rotate-180': expandedMessages.has(message.id) }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Expanded Content (dropdown) -->
          <div 
            v-if="expandedMessages.has(message.id)"
            class="border-t bg-gray-50 p-4"
          >
            <div v-if="!message.isReaction && message.botResponse" class="space-y-3">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">🤖 Bot Response:</h4>
                
                <!-- WhatsApp-like Message Bubble -->
                <div class="flex justify-start">
                  <div class="max-w-xs lg:max-w-md">
                    <!-- Message bubble -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 relative">
                      <!-- Message tail -->
                      <div class="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
                      
                      <!-- Message content -->
                      <div class="space-y-2">
                        <!-- Image if present -->
                        <div v-if="message.botResponseImage" class="mb-2">
                          <img 
                            :src="message.botResponseImage" 
                            :alt="'Image from bot response'"
                            class="max-w-full rounded-lg shadow-sm"
                            style="max-height: 200px; object-fit: cover;"
                            @error="handleImageError"
                          />
                        </div>
                        
                        <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{{ message.botResponse }}</p>
                        
                        <!-- Message timestamp and status -->
                        <div class="flex items-center justify-end space-x-1">
                          <span class="text-xs text-gray-500">
                            {{ formatWhatsAppTime(message.botResponseTimestamp) }}
                          </span>
                          <!-- WhatsApp checkmarks -->
                          <div class="flex items-center space-x-0.5">
                            <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                            <svg class="w-3 h-3 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Bot sender info -->
                    <div class="mt-1 ml-3">
                      <span class="text-xs text-gray-500">🤖 Potato Bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="!message.isReaction && !message.botResponse" class="space-y-3">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">🤖 Bot Response:</h4>
                
                <!-- No response placeholder -->
                <div class="flex justify-start">
                  <div class="max-w-xs lg:max-w-md">
                    <div class="bg-gray-100 rounded-lg border border-gray-200 p-3 relative">
                      <div class="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-100"></div>
                      <div class="flex items-center space-x-2">
                        <div class="animate-pulse flex space-x-1">
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span class="text-sm text-gray-500">Bot is typing...</span>
                      </div>
                    </div>
                    <div class="mt-1 ml-3">
                      <span class="text-xs text-gray-500">🤖 Potato Bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="message.isReaction && message.botResponse" class="space-y-3">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">🤖 Bot Response to Reaction:</h4>
                
                <!-- WhatsApp-like Message Bubble for Reaction Response -->
                <div class="flex justify-start">
                  <div class="max-w-xs lg:max-w-md">
                    <!-- Message bubble -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 relative">
                      <!-- Message tail -->
                      <div class="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
                      
                      <!-- Message content -->
                      <div class="space-y-2">
                        <!-- Image if present -->
                        <div v-if="message.botResponseImage" class="mb-2">
                          <img 
                            :src="message.botResponseImage" 
                            :alt="'Image from bot response to reaction'"
                            class="max-w-full rounded-lg shadow-sm"
                            style="max-height: 200px; object-fit: cover;"
                            @error="handleImageError"
                          />
                        </div>
                        
                        <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{{ message.botResponse }}</p>
                        
                        <!-- Message timestamp and status -->
                        <div class="flex items-center justify-end space-x-1">
                          <span class="text-xs text-gray-500">
                            {{ formatWhatsAppTime(message.botResponseTimestamp) }}
                          </span>
                          <!-- WhatsApp checkmarks -->
                          <div class="flex items-center space-x-0.5">
                            <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                            <svg class="w-3 h-3 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Bot sender info -->
                    <div class="mt-1 ml-3">
                      <span class="text-xs text-gray-500">🤖 Potato Bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="message.isReaction && !message.botResponse" class="space-y-3">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">🤖 Bot Response to Reaction:</h4>
                
                <!-- No response placeholder for reaction -->
                <div class="flex justify-start">
                  <div class="max-w-xs lg:max-w-md">
                    <div class="bg-gray-100 rounded-lg border border-gray-200 p-3 relative">
                      <div class="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-100"></div>
                      <div class="flex items-center space-x-2">
                        <div class="animate-pulse flex space-x-1">
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span class="text-sm text-gray-500">Bot is processing reaction...</span>
                      </div>
                    </div>
                    <div class="mt-1 ml-3">
                      <span class="text-xs text-gray-500">🤖 Potato Bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <p class="text-sm text-gray-500">ℹ️ This reaction doesn't trigger a bot response</p>
            </div>
          </div>
        </div>
        
        <div v-if="messages.length === 0 && !isLoading" class="text-center py-8">
          <p class="text-sm text-gray-500">No messages found</p>
        </div>
        
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Loading messages...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BotMessage } from '../types';

defineProps<{
  messages: BotMessage[];
  isLoading: boolean;
  selectedGroup: string | null;
}>();

const expandedMessages = ref<Set<string>>(new Set());

const toggleMessage = (messageId: string) => {
  if (expandedMessages.value.has(messageId)) {
    expandedMessages.value.delete(messageId);
  } else {
    expandedMessages.value.add(messageId);
  }
};

const formatTime = (date: Date) => {
  const activity = new Date(date);
  return activity.toLocaleString();
};

const formatPhone = (phone: string) => {
  if (!phone || phone === 'unknown' || phone === 'bot') {
    return phone;
  }
  
  // Format as +55 (11) 99999-9999 for Brazilian numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
};

const formatWhatsAppTime = (date: Date | undefined) => {
  if (!date) return '';
  
  const activity = new Date(date);
  const now = new Date();
  const diff = now.getTime() - activity.getTime();
  const diffInHours = diff / (1000 * 60 * 60);
  
  // If message is from today, show time like "14:30"
  if (diffInHours < 24) {
    return activity.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // If message is from yesterday or older, show date
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return activity.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return activity.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  console.error('Failed to load image:', img.src);
};
</script>