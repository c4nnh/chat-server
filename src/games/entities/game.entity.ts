import { Game, GameType } from '@prisma/client'

export class GameEntity implements Game {
  id: string

  name: string

  type: GameType
}
