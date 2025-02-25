declare namespace Interface {
  interface ISignup {
    email: string
    fullname: string
    password: string
    workspace: string
  }

  interface ISignin {
    email: string
    password: string
  }

  interface IUser {
    id: number
    fullname: string
    email: string
    create: string
  }

  interface IWorkspace {
    id: number
    name: string
  }

  interface IUsersInner {
    id: number
    fullname: string
    email: string
  }

  interface IChannel {
    id: number
    ws_id: number
    name: string
    type: ChannelType
    members: Array<number>
    created_at: string
  }

  enum ChannelType {
    Single,
    Group,
    PrivateChannel,
    PublicChannel,
  }

  interface IUserSingleChannel extends IUsersInner {
    channel_id: number
  }
}
