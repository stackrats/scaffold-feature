import { useApiRequest } from '@/composables/useApiRequest'
import { ApiMethods } from '@/shared/model/enums/ApiMethods'

import type { AxiosResponse } from 'axios'
import type { {{FeatureName}}Rsp } from '@/{{featurePath}}/model/types/responses/{{FeatureName}}Rsp'
import type { {{FeatureName}}Req } from '@/{{featurePath}}/model/types/requests/{{FeatureName}}Req'

export const api{{FeatureName}} = async (
  req: {{FeatureName}}Req,
): Promise<AxiosResponse<{{FeatureName}}Rsp>> => {
  const { apiRequest } = useApiRequest()

  return await apiRequest({
    method: ApiMethods.GET,
    url: '{{feature-name}}',
    config: {
      params: req
    },
    actions: [],
  })
}
