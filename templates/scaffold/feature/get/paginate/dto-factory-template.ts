import type { OrderBy } from '@/shared/model/types/OrderBy'
import type { {{FeatureName}}Dto } from '@/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function {{featureName}}DtoFactory(): {{FeatureName}}Dto {
  return {
    page: 1,
    perPage: 20,
    orderBy: OrderBy.ASC
  }
}
