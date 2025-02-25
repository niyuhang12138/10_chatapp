import { ref, computed, readonly, reactive } from 'vue'
import { defineStore } from 'pinia'
import request from '@/service'
import type { AxiosResponse } from 'axios'
import { jwtDecode, type JwtPayload } from 'jwt-decode'

export const useMainStore = defineStore('main_store', () => {
  /**
   * User information
   */

  const user = reactive<Interface.IUser>(
    localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : {
          id: 0,
          fullname: '',
          email: '',
          create: '',
        },
  )

  function setUser(state: Interface.IUser) {
    Object.assign(user, state)
  }

  function hasUser() {
    return user.id !== 0 && user.fullname && user.email && user.create
  }

  /**
   * Authentication token
   */
  const token = ref(localStorage.getItem('token') || '')

  function setToken(new_token: string) {
    token.value = new_token
  }

  function hasToken() {
    return !!token.value
  }

  /**
   * Current workspace
   */
  const workspace = reactive<Interface.IWorkspace>(
    localStorage.getItem('workspace')
      ? JSON.parse(localStorage.getItem('workspace')!)
      : { id: 0, name: '' },
  )

  function setWorkspace(new_workspace: Interface.IWorkspace) {
    Object.assign(workspace, new_workspace)
  }

  function hasWorkspace() {
    return workspace.id !== 0 && workspace.name
  }

  /**
   * List of channels
   */

  const channels = reactive<Array<Interface.IChannel>>(
    localStorage.getItem('channels') ? JSON.parse(localStorage.getItem('channels')!) : [],
  )

  function setChannels(new_channels: Array<Interface.IChannel>) {
    channels.splice(0, channels.length, ...new_channels)
  }

  const get_channels = computed(() =>
    channels.filter((channel) => channel.type !== Interface.ChannelType.Single),
  )

  const get_single_channels = computed(() => {
    return channels.filter((channel) => channel.type === Interface.ChannelType.Single)
  })

  /**
   * Messages hashmap, keyed by channel ID
   */
  type TMessages = Map<number, Array<string>>

  const messages = reactive<TMessages>(
    new Map(
      localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')!) : new Map(),
    ),
  )

  function setMessages(new_messages: TMessages) {
    messages.clear()
    for (const [key, value] of new_messages) {
      messages.set(key, value)
    }
  }

  /**
   * users hashmap, keyed by user ID
   */
  const users = reactive<Map<number, Interface.IUsersInner>>(
    new Map(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')!) : new Map()),
  )

  function setUsers(new_users: Array<Interface.IUsersInner>) {
    users.clear()
    for (const user of new_users) {
      users.set(user.id, user)
    }
  }

  function addChannel(channel: Interface.IChannel) {
    channels.push(channel)
    messages.set(channel.id, [])
  }

  function addMessage(channel_id: number, message: string) {
    if (messages.has(channel_id)) {
      messages.get(channel_id)!.push(message)
    } else {
      messages.set(channel_id, [message])
    }
  }

  function getChannelMessages(channel_id: number): Array<string> {
    return messages.get(channel_id) || []
  }

  async function signup(data: Interface.ISignup) {
    try {
      const response = await request.post('/signup', data)
      await loadState(response)
    } catch (err) {
      console.error('signup error: ---> ', err)
      throw err
    }
  }

  async function signin(data: Interface.ISignin) {
    try {
      const response = await request.post('/signin', data)
      await loadState(response)
    } catch (err) {
      console.error('signin error: ---> ', err)
      throw err
    }
  }

  return {
    // user ...
    user,
    setUser,
    hasUser,
    users,
    setUsers,
    // token ...
    token,
    setToken,
    hasToken,
    // workspace ...
    workspace,
    setWorkspace,
    hasWorkspace,
    // channels ...
    channels,
    setChannels,
    get_channels,
    get_single_channels,
    // messages ...
    messages,
    setMessages,
    getChannelMessages,
    // other ...
    addChannel,
    addMessage,
    signin,
    signup,
  }
})

export default useMainStore

async function loadState(response: AxiosResponse) {
  try {
    const mainStore = useMainStore()
    const token = response.data.token
    const user = jwtDecode(token) as {
      ws_id: number
      ws_name: string
      id: number
      fullname: string
      created: string
      email: string
    } // Decode the JWT to get user info

    const users_response = await request.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const users = users_response.data as Array<Interface.IUsersInner>

    const channels_response = await request.get('/chats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const channels = channels_response.data as Array<Interface.IChannel>

    const workspace = { id: user.ws_id, name: user.ws_name }

    const new_user = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      create: user.created,
    }

    mainStore.setWorkspace(workspace)
    mainStore.setUser(new_user)
    mainStore.setToken(token)
    mainStore.setUsers(users)
    mainStore.setChannels(channels)

    localStorage.setItem('user', JSON.stringify(new_user))
    localStorage.setItem('workspace', JSON.stringify(workspace))
    localStorage.setItem('token', token)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('channels', JSON.stringify(channels))
  } catch (err) {
    console.error('loadState error: ---> ', err)
    throw err
  }
}
