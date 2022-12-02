import { fc } from '@fast-check/jest'
import { Doi, isDoi } from 'doi-ts'
import * as _ from '../src'

export const { string } = fc

export const doi = (): fc.Arbitrary<Doi> =>
  fc
    .tuple(
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 2 }),
      fc.unicodeString({ minLength: 1 }),
    )
    .map(([prefix, suffix]) => `10.${prefix}/${suffix}`)
    .filter(isDoi)

export const dataciteWork = (): fc.Arbitrary<_.Work> =>
  fc.record({
    doi: doi(),
  })
