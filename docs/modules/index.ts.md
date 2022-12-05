---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [codecs](#codecs)
  - [WorkC](#workc)
- [constructors](#constructors)
  - [getWork](#getwork)
- [model](#model)
  - [PartialDate (type alias)](#partialdate-type-alias)
  - [Work (interface)](#work-interface)

---

# codecs

## WorkC

**Signature**

```ts
export declare const WorkC: C.Codec<string, string, Work>
```

Added in v0.1.0

# constructors

## getWork

**Signature**

```ts
export declare const getWork: (doi: Doi) => ReaderTaskEither<FetchEnv, unknown, Work>
```

Added in v0.1.0

# model

## PartialDate (type alias)

**Signature**

```ts
export type PartialDate = number | PlainYearMonth | PlainDate
```

Added in v0.1.1

## Work (interface)

**Signature**

```ts
export interface Work {
  readonly creators: ReadonlyArray<{ givenName?: string; familyName: string } | { name: string }>
  readonly dates: ReadonlyNonEmptyArray<{
    date: Instant | PartialDate
    dateType: string
  }>
  readonly descriptions: ReadonlyArray<{ description: string; descriptionType: string }>
  readonly doi: Doi
  readonly identifiers: ReadonlyArray<{ identifier: string; identifierType: string }>
  readonly types: {
    resourceType?: string
    resourceTypeGeneral?: string
  }
  readonly titles: ReadonlyNonEmptyArray<{ title: string }>
  readonly url: URL
}
```

Added in v0.1.0
