import { test } from '@fast-check/jest'
import { describe, expect } from '@jest/globals'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import * as _ from '../src'
import * as fc from './fc'

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
