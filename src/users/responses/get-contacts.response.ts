import { CollectionResponse } from '../../common/response/collection.response'
import { ContactResponse } from './contact.response'

export class GetContactsResponse extends CollectionResponse<ContactResponse> {
  data: ContactResponse[]
}
