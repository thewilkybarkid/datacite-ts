import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import { FetchEnv } from 'fetch-fp-ts'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as C from 'io-ts/Codec'
import * as _ from '../src'

import Codec = C.Codec
import ReaderTaskEither = RTE.ReaderTaskEither
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray
import Work = _.Work

declare const doi: Doi
declare const work: Work

//
// Work
//

expectTypeOf(work.descriptions).toEqualTypeOf<ReadonlyArray<{ description: string; descriptionType: string }>>()
expectTypeOf(work.doi).toEqualTypeOf<Doi>()
expectTypeOf(work.titles).toEqualTypeOf<ReadonlyNonEmptyArray<{ title: string }>>()

//
// getWork
//

expectTypeOf(_.getWork(doi)).toMatchTypeOf<ReaderTaskEither<FetchEnv, unknown, Work>>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
