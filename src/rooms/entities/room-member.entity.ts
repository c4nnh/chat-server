import { RoomRole } from '@prisma/client'

export class RoomMemberEntity {
  id: string

  role: RoomRole

  isReady: boolean

  joinAt: Date
}
