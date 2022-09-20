export class PaginationResponse {
  total: number

  totalPage: number
}

export class CollectionResponse<T> {
  pagination: PaginationResponse

  data: T[]
}
