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
}
