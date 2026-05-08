import { individualImpairmentV2Service } from '@/services/individual-impairment-v2.service'
import { IndividualImpairmentController } from './individual-impairment.controller'

export class IndividualImpairmentV2Controller extends IndividualImpairmentController {
    constructor() {
        super(individualImpairmentV2Service)
    }
}

export const individualImpairmentV2Controller = new IndividualImpairmentV2Controller()
