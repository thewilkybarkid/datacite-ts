import { test } from '@fast-check/jest'
import { describe, expect } from '@jest/globals'
import fetchMock from 'fetch-mock'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { StatusCodes } from 'http-status-codes'
import * as D from 'io-ts/Decoder'
import * as _ from '../src'
import * as fc from './fc'

describe('constructors', () => {
  describe('getWork', () => {
    test.prop([
      fc.doi(),
      fc
        .dataciteWork()
        .chain(work =>
          fc.tuple(
            fc.constant(work),
            fc.response({ status: fc.constant(StatusCodes.OK), text: fc.constant(_.WorkC.encode(work)) }),
          ),
        ),
    ])('when the work can be decoded', async (doi, [work, response]) => {
      const fetch = fetchMock.sandbox().getOnce(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, response)

      const actual = await _.getWork(doi)({ fetch })()

      expect(actual).toStrictEqual(D.success(work))
    })

    test.prop([fc.doi(), fc.response({ status: fc.constant(StatusCodes.OK) })])(
      'when the work cannot be decoded',
      async (doi, response) => {
        const fetch = fetchMock.sandbox().getOnce(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, response)

        const actual = await _.getWork(doi)({ fetch })()

        expect(actual).toStrictEqual(E.left(expect.anything()))
      },
    )

    test.prop([fc.doi(), fc.response({ status: fc.statusCode().filter(status => status !== StatusCodes.OK) })])(
      'when the response has a non-200 status code',
      async (doi, response) => {
        const fetch = fetchMock.sandbox().getOnce(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, response)

        const actual = await _.getWork(doi)({ fetch })()

        expect(actual).toStrictEqual(E.left(expect.objectContaining({ status: response.status })))
      },
    )

    test.prop([fc.doi(), fc.error()])('when fetch throws an error', async (doi, error) => {
      const actual = await _.getWork(doi)({ fetch: () => Promise.reject(error) })()

      expect(actual).toStrictEqual(E.left(error))
    })
  })
})

describe('codecs', () => {
  describe('WorkC', () => {
    test.prop([fc.dataciteWork()])('when the work can be decoded', work => {
      const actual = pipe(work, _.WorkC.encode, _.WorkC.decode)

      expect(actual).toStrictEqual(D.success(work))
    })

    test.prop([fc.string()])('when the work cannot be decoded', string => {
      const actual = _.WorkC.decode(string)

      expect(actual).toStrictEqual(E.left(expect.anything()))
    })
  })
})
