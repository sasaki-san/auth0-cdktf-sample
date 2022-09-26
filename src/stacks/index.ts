import { CreateActionsStack } from "./ActionsStack"
import { CreateBasicM2mClientStack } from "./BasicM2MClientStack"
import { CreateBasicNativeClientStack } from "./BasicNativeClientStack"
import { CreateBasicRwaClientStack } from "./BasicRwaClientStack"
import { CreateBasicSpaClientStack } from "./BasicSpaClientStack"
import { CreateRulesStack } from "./RulesStack"

export default [
  CreateBasicNativeClientStack,
  CreateBasicM2mClientStack,
  CreateBasicRwaClientStack,
  CreateBasicSpaClientStack,
  CreateActionsStack,
  CreateRulesStack,
]