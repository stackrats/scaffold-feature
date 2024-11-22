import type { OrderBy } from '@/shared/model/types/OrderBy'
import type { {{FeatureName}}Dto } from '@/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function {{featureName}}DtoFactory(): {{FeatureName}}Dto {
  return {
    orderBy: OrderBy.ASC
  }
}
