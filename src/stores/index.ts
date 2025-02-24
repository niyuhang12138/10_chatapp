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
  interface IChannel {
    id: number
  }

  const channels = reactive<Array<IChannel>>([])

  function setChannels(new_channels: Array<IChannel>) {
    channels.splice(0, channels.length, ...new_channels)
  }

  /**
   * Messages hashmap, keyed by channel ID
   */
  type TMessages = Map<number, Array<string>>

  const messages = reactive<TMessages>(new Map())

  function setMessages(new_messages: TMessages) {
    messages.clear()
    for (const [key, value] of new_messages) {
      messages.set(key, value)
    }
  }

  function addChannel(channel: IChannel) {
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
      saveUser(response)
    } catch (err) {
      console.error('signup error: ---> ', err)
      throw err
    }
  }

  async function signin(data: Interface.ISignin) {
    try {
      const response = await request.post('/signin', data)
      saveUser(response)
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
    // messages ...
    messages,
    // other ...
    setMessages,
    addChannel,
    addMessage,
    signin,
    signup,
  }
})

export default useMainStore

function saveUser(response: AxiosResponse) {
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
  console.log('saveUser: ---> ', user)
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

  localStorage.setItem('user', JSON.stringify(new_user))
  localStorage.setItem('workspace', JSON.stringify(workspace))
  localStorage.setItem('token', token)
}
