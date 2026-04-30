import { IndividualImpairmentService } from './individual-impairment.service'

export class IndividualImpairmentV2Service extends IndividualImpairmentService {
    readonly apiVersion = 'v2'
}

export const individualImpairmentV2Service = new IndividualImpairmentV2Service()
