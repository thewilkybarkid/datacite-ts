---
title: Home
nav_order: 1
---

A [DataCite API] client for use with [fp-ts].

# Example

```ts
import fetch from 'cross-fetch'
import { getWork } from 'datacite-ts'
import { Doi } from 'doi-ts'
import { FetchEnv } from 'fetch-fp-ts'
import * as C from 'fp-ts/Console'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

const env: FetchEnv = {
  fetch,
}

void pipe(
  getWork('10.5438/0012' as Doi),
  RTE.chainFirstIOK(work => C.log(`Title is "${work.titles[0].title}"`)),
)(env)()
/*
Title is "DataCite Metadata Schema Documentation for the Publication and Citation of Research Data v4.0"
*/
```

[datacite api]: https://support.datacite.org/docs/api
[fp-ts]: https://gcanti.github.io/fp-ts/
