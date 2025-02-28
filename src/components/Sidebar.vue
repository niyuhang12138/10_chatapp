<template>
  <div class="sidebar">
    <div class="workspace">
      <div class="workspace-name" @click="toggleDropdown">
        <span>{{ workspace.name }}</span>
        <button class="dropdown-toggle">&nbsp;▼</button>
      </div>
      <div v-if="dropdownVisible" class="dropdown-menu">
        <ul>
          <li @click="logout">Logout</li>
          <!-- Add more dropdown items here as needed -->
        </ul>
      </div>
      <button class="add-channel">+</button>
    </div>

    <div class="channels">
      <h2>Channels</h2>
      <ul>
        <li
          v-for="channel in get_channels"
          :key="channel.id"
          @click="selectChannel(channel.id)"
          :class="{ active: channel.id === active_channel?.id }"
        >
          # {{ channel.name }}
        </li>
      </ul>
    </div>

    <div class="direct-messages">
      <h2>Direct Messages</h2>
      <ul>
        <li
          v-for="user in filter_users"
          :key="user.id"
          @click="selectChannel(user.channel_id)"
          :class="{ active: user.channel_id === active_channel?.id }"
        >
          <img
            :src="`https://ui-avatars.com/api/?name=${user.fullname.replace(' ', '+')}`"
            class="avatar"
            alt="Avatar"
          />
          {{ user.fullname }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import useMainStore from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

// init ...
const main_store = useMainStore()

const { user, workspace, get_channels, get_single_channels, users, active_channel } =
  storeToRefs(main_store)

const filter_users = computed<Array<Interface.IUserSingleChannel>>(() => {
  const filter_users: Array<Interface.IUserSingleChannel> = []
  get_single_channels.value.forEach((channel) => {
    const id = channel.members.filter((member) => member !== user.value.id)[0]
    const new_user = users.value[id]
    filter_users.push({
      channel_id: channel.id,
      ...new_user,
    })
  })
  return filter_users
})

const dropdownVisible = ref(false)

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value
}

function logout() {
  main_store.reset()
  router.replace('/login')
}

async function selectChannel(channel_id: number) {
  main_store.setActiveChannel(channel_id)
}
</script>

<style scoped>
/* Base sidebar styling */
.sidebar {
  width: 250px;
  background-color: #2f3136;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
  font-size: 14px;
}

/* Workspace section */
.workspace {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.workspace-name {
  font-weight: bold;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #b9bbbe;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  width: 200px;
  background-color: #2f3136;
  border: 1px solid #3a3e44;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 8px;
  cursor: pointer;
  color: #b9bbbe;
}

.dropdown-menu li:hover {
  background-color: #3a3e44;
  color: #fff;
}

.add-channel {
  background: none;
  border: none;
  color: #b9bbbe;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.add-channel:hover {
  color: #fff;
}

/* Channels section */
.channels {
  margin-bottom: 20px;
}

.channels h2 {
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: #b9bbbe;
}

.channels ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.channels li {
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.channels li:hover {
  background-color: #3a3e44;
}

.channels li.active {
  background-color: #5865f2; /* Highlight color for active channel */
  color: #ffffff;
}

/* Direct Messages section */
.direct-messages h2 {
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: #b9bbbe;
}

.direct-messages ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.direct-messages li {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.direct-messages li:hover {
  background-color: #3a3e44;
}

/* Active channel styling */
.direct-messages li.active {
  background-color: #5865f2; /* Highlight color for active channel */
  color: #ffffff;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
