<template>
  <div class="message-list">
    <div v-if="getMessageForActiveChannel.length === 0" class="no-messages">
      No messages in this channel yet.
    </div>
    <template v-else>
      <div v-for="message in getMessageForActiveChannel" :key="message.id" class="message">
        <img
          :src="`https://ui-avatars.com/api/?name=${message.sender.fullname.replace(' ', '+')}`"
          class="avatar"
          alt="Avatar"
        />
        <div class="message-content">
          <div class="message-header">
            <span class="message-user">{{ message.sender.fullname }}</span>
            <span class="message-time">{{ formatTime(message.created_at) }}</span>
          </div>
          <div class="message-text">{{ message.content }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, watchEffect } from 'vue'
import useMainStore from '@/stores'
import { storeToRefs } from 'pinia'

// init ...
const main_store = useMainStore()

const { getMessageForActiveChannel, active_channel } = storeToRefs(main_store)

watch(
  () => active_channel.value,
  async () => {
    if (active_channel.value) {
      await main_store.fetchMessagesForChannel(active_channel.value?.id)
    }
  },
)

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
/* Container styling */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Individual message styling */
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  max-width: 80%;
}

/* Header styling: username and timestamp */
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.message-user {
  font-weight: bold;
  margin-right: 10px;
}

.message-time {
  font-size: 12px;
}

/* Message text styling */
.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.no-messages {
  text-align: center;
  color: #b9bbbe;
  margin-top: 20px;
}
</style>
