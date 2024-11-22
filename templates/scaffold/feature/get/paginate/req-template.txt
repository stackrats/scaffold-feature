import type { OrderBy } from '@/shared/model/types/OrderBy'

export interface {{FeatureName}}Req {
  page: number
  perPage: number
  orderBy: OrderBy
}