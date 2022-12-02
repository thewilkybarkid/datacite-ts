import { fc } from '@fast-check/jest'
import { Doi, isDoi } from 'doi-ts'
import { MockResponseObject } from 'fetch-mock'
import { isNonEmpty } from 'fp-ts/Array'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import * as _ from '../src'

export const { constant, string, tuple } = fc

export const nonEmptyArray = <T>(
  arb: fc.Arbitrary<T>,
  constraints: fc.ArrayConstraints = {},
): fc.Arbitrary<NonEmptyArray<T>> => fc.array(arb, { minLength: 1, ...constraints }).filter(isNonEmpty)

export const error = (): fc.Arbitrary<Error> => fc.string().map(error => new Error(error))

export const statusCode = (): fc.Arbitrary<number> => fc.integer({ min: 200, max: 599 })

export const doi = (): fc.Arbitrary<Doi> =>
  fc
    .tuple(
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 2 }),
      fc.unicodeString({ minLength: 1 }),
    )
    .map(([prefix, suffix]) => `10.${prefix}/${suffix}`)
    .filter(isDoi)

const headerName = () =>
  fc.stringOf(
    fc.char().filter(char => /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]$/.test(char)),
    { minLength: 1 },
  )

const headers = () => fc.option(fc.dictionary(headerName(), fc.string()), { nil: undefined })

export const response = ({
  status,
  text,
}: { status?: fc.Arbitrary<number>; text?: fc.Arbitrary<string> } = {}): fc.Arbitrary<MockResponseObject> =>
  fc.record({
    body: text ?? fc.oneof(fc.string(), fc.constant(undefined)),
    headers: headers(),
    status: status ?? fc.oneof(statusCode(), fc.constant(undefined)),
  })

export const dataciteWork = (): fc.Arbitrary<_.Work> =>
  fc.record({
    descriptions: fc.array(
      fc.record({
        description: fc.string(),
        descriptionType: fc.string(),
      }),
    ),
    doi: doi(),
    titles: nonEmptyArray(
      fc.record({
        title: fc.string(),
      }),
    ),
  })
