import type { {{FeatureName}}Req } from '@/features/{{featurePath}}/model/types/requests/{{FeatureName}}Req'
import type { {{FeatureName}}Dto } from '@/features/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function map{{FeatureName}}DtoToReq(
  dto: {{FeatureName}}Dto,
): {{FeatureName}}Req {
  return {
    id: dto.id,
  }
}
