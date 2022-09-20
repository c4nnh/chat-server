import { PaginationResponse } from '../response/collection.response'

export const convertToPaginationResponse = (
  total: number,
  take: number
): PaginationResponse => ({
  total,
  totalPage: Math.ceil(total / take),
})
