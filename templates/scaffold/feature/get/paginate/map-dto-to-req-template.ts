import type { {{FeatureName}}Req } from '@/features/{{featurePath}}/model/types/requests/{{FeatureName}}Req'
import type { {{FeatureName}}Dto } from '@/features/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function map{{FeatureName}}DtoToReq(
  dto: {{FeatureName}}Dto,
): {{FeatureName}}Req {
  return {
    page: dto.page,
    perPage: dto.perPage,
    orderBy: dto.orderBy,
  }
}
