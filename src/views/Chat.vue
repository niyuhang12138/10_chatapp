<template>
  <div class="chat">
    <Sidebar />
    <div class="chat-main">
      <MessageList />
      <MessageSend />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Sidebar from '@/components/Sidebar.vue'
import MessageList from '@/components/MessageList.vue'
import MessageSend from '@/components/MessageSend.vue'
import useMainStore from '@/stores'
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { SSE_URL } from '@/global'

// init ...
const main_store = useMainStore()
const { token, users } = storeToRefs(main_store)

let source: null | EventSource

onMounted(() => {
  if (!token.value) return
  source = new EventSource(`${SSE_URL}?access_token=${token.value}`)
  source.addEventListener('open', sseOpen)
  source.addEventListener('message', sseMessage)
  source.addEventListener('error', sseError)
  source.addEventListener('NewChat', newChat)
  source.addEventListener('AddToChat', addToChat)
  source.addEventListener('RemoveFromChat', removeFromChat)
  source.addEventListener('NewMessage', newMessage)
})

onUnmounted(() => {
  if (!source) return
  source.removeEventListener('open', sseOpen)
  source.removeEventListener('message', sseMessage)
  source.removeEventListener('error', sseError)
  source.removeEventListener('NewChat', newChat)
  source.removeEventListener('AddToChat', addToChat)
  source.removeEventListener('RemoveFromChat', removeFromChat)
  source.removeEventListener('NewMessage', newMessage)
  source.close()
})

function sseOpen(e: Event) {
  console.log('sseOpen e: ---> ', e)
}

function sseMessage(e: MessageEvent) {
  console.log('sseMessage e: ---> ', e)
}

function sseError(e: Event) {
  console.log('sseError e: ---> ', e)
}

function newChat(event: MessageEvent) {
  console.log('NewChat:', JSON.parse(event.data))
}

function addToChat(event: MessageEvent) {
  console.log('AddToChat:', event.data)
}

function removeFromChat(event: MessageEvent) {
  console.log('RemoveFromChat:', event.data)
}

function newMessage(event: MessageEvent) {
  console.log('NewMessage:', JSON.parse(event.data))
  const new_message = JSON.parse(event.data) as Interface.IMessage
  new_message.sender = users.value[new_message.sender_id]
  main_store.addMessage(new_message.chat_id, new_message)
}
</script>

<style scoped>
.chat {
  display: flex;
  height: 100vh; /* Full height to fit the screen */
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}
</style>
