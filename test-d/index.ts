import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as C from 'io-ts/Codec'
import * as _ from '../src'

import Codec = C.Codec
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray
import Work = _.Work

declare const work: Work

//
// Work
//

expectTypeOf(work.descriptions).toEqualTypeOf<ReadonlyArray<{ description: string; descriptionType: string }>>()
expectTypeOf(work.doi).toEqualTypeOf<Doi>()
expectTypeOf(work.titles).toEqualTypeOf<ReadonlyNonEmptyArray<{ title: string }>>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
