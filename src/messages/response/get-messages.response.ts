import { CollectionResponse } from '../../common/response/collection.response'
import { RelationMessageEntity } from '../entities/relation-message.entity'

export class GetMessagesResponse extends CollectionResponse<RelationMessageEntity> {
  data: RelationMessageEntity[]
}
