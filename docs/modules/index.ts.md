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
- [model](#model)
  - [Work (interface)](#work-interface)

---

# codecs

## WorkC

**Signature**

```ts
export declare const WorkC: C.Codec<string, string, Work>
```

Added in v0.1.0

# model

## Work (interface)

**Signature**

```ts
export interface Work {
  readonly descriptions: ReadonlyArray<{ description: string; descriptionType: string }>
  readonly doi: Doi
  readonly titles: ReadonlyNonEmptyArray<{ title: string }>
}
```

Added in v0.1.0
