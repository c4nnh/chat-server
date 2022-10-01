import { CollectionResponse } from '../../common/response/collection.response'
import { RoomResponse } from './room.response'

export class GetRoomsResponse extends CollectionResponse<RoomResponse> {
  data: RoomResponse[]
}
