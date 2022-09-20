import { CollectionResponse } from '../../common/response/collection.response'
import { ConversationResponse } from './conversation.response'

export class GetConversationsResponse extends CollectionResponse<ConversationResponse> {
  data: ConversationResponse[]
}
