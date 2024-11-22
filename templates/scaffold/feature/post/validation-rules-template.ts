import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

import type { Ref } from 'vue'
import type { {{FeatureName}}Dto } from '@/{{featurePath}}/model/types/{{FeatureName}}Dto'

export function {{featureName}}ValidationRules(
  dto: Ref<{{FeatureName}}Dto>,
) {
  return useVuelidate(
    {
      dto: {
        name: {
          required,
          $autoDirty: true,
        }
      },
    },
    {
      dto,
    },
  )
}
