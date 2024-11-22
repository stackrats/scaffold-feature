import type { {{FeatureName}}Rsp } from '@/features/{{featurePath}}/model/types/requests/{{FeatureName}}Rsp'
import type { {{FeatureName}}Dto } from '@/features/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function map{{FeatureName}}RspToDto(
  rsp: {{FeatureName}}Rsp,
): {{FeatureName}}Dto {
  return {
    page: rsp.meta.page,
    perPage: rsp.meta.perPage,
    orderBy: rsp.meta.orderBy,
  }
}
