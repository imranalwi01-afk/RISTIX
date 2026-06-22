[**Backend API Reference v1.0.0**](index.md)

***

# lib/errors

## Classes

### AppError

Defined in: [src/lib/errors.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L6)

Base application error - all errors extend from this

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `cause?`: `unknown`; `code`: `string`; `message`: `string`; &#125;&gt;

#### Constructors

##### Constructor

> **new AppError**(`args`): [`AppError`](#apperror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### cause?

`unknown`

###### code

`string`

###### message

`string`

###### Returns

[`AppError`](#apperror)

###### Inherited from

`Data.TaggedError('AppError')<{ readonly message: string readonly code: string readonly cause?: unknown }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"AppError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('AppError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`AppError`](#apperror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('AppError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`AppError`](#apperror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('AppError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`AppError`](#apperror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('AppError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`AppError`](#apperror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('AppError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

[`ValidationError`](#validationerror).[`cause`](#cause-8)

##### code

> `readonly` **code**: `string`

Defined in: [src/lib/errors.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L8)

###### Inherited from

`Data.TaggedError('AppError').code`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('AppError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('AppError').name`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('AppError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`AppError`](#apperror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`AppError`](#apperror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('AppError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AppError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AppError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AppError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AppError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('AppError').toString`

***

### AuthenticationError

Defined in: [src/lib/errors.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L42)

Authentication error - token invalid or missing

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `code?`: `string`; `message`: `string`; `reason`: `"missing_token"` &#124; `"invalid_token"` &#124; `"expired_token"` &#124; `"invalid_credentials"` &#124; `"refactor_pending"` &#124; `"unexpected_error"`; &#125;&gt;

#### Constructors

##### Constructor

> **new AuthenticationError**(`args`): [`AuthenticationError`](#authenticationerror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### code?

`string`

###### message

`string`

###### reason

`"missing_token"` &#124; `"invalid_token"` &#124; `"expired_token"` &#124; `"invalid_credentials"` &#124; `"refactor_pending"` &#124; `"unexpected_error"`

###### Returns

[`AuthenticationError`](#authenticationerror)

###### Inherited from

Data.TaggedError('AuthenticationError')&lt;&#123; readonly message: string readonly reason: 'missing\_token' &#124; 'invalid\_token' &#124; 'expired\_token' &#124; 'invalid\_credentials' &#124; 'refactor\_pending' &#124; 'unexpected\_error' readonly code?: string &#125;&gt;.constructor

#### Properties

##### \_tag

> `readonly` **\_tag**: `"AuthenticationError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('AuthenticationError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`AuthenticationError`](#authenticationerror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('AuthenticationError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`AuthenticationError`](#authenticationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('AuthenticationError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`AuthenticationError`](#authenticationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('AuthenticationError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`AuthenticationError`](#authenticationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('AuthenticationError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('AuthenticationError').cause`

##### code?

> `readonly` `optional` **code?**: `string`

Defined in: [src/lib/errors.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L45)

###### Inherited from

`Data.TaggedError('AuthenticationError').code`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('AuthenticationError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('AuthenticationError').name`

##### reason

> `readonly` **reason**: `"missing_token"` &#124; `"invalid_token"` &#124; `"expired_token"` &#124; `"invalid_credentials"` &#124; `"refactor_pending"` &#124; `"unexpected_error"`

Defined in: [src/lib/errors.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L44)

###### Inherited from

`Data.TaggedError('AuthenticationError').reason`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('AuthenticationError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`AuthenticationError`](#authenticationerror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`AuthenticationError`](#authenticationerror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('AuthenticationError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AuthenticationError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AuthenticationError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AuthenticationError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('AuthenticationError').toString`

***

### AuthorizationError

Defined in: [src/lib/errors.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L51)

Authorization error - user lacks permission

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `details?`: `Record`&lt;`string`, `unknown`&gt;; `message`: `string`; `requiredPermission`: `string`; `userId?`: `string`; &#125;&gt;

#### Constructors

##### Constructor

> **new AuthorizationError**(`args`): [`AuthorizationError`](#authorizationerror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### details?

`Record`&lt;`string`, `unknown`&gt;

###### message

`string`

###### requiredPermission

`string`

###### userId?

`string`

###### Returns

[`AuthorizationError`](#authorizationerror)

###### Inherited from

`Data.TaggedError('AuthorizationError')<{ readonly message: string readonly requiredPermission: string readonly userId?: string readonly details?: Record<string, unknown> }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"AuthorizationError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('AuthorizationError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`AuthorizationError`](#authorizationerror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('AuthorizationError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`AuthorizationError`](#authorizationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('AuthorizationError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`AuthorizationError`](#authorizationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('AuthorizationError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`AuthorizationError`](#authorizationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('AuthorizationError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('AuthorizationError').cause`

##### details?

> `readonly` `optional` **details?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/lib/errors.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L55)

###### Inherited from

`Data.TaggedError('AuthorizationError').details`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('AuthorizationError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('AuthorizationError').name`

##### requiredPermission

> `readonly` **requiredPermission**: `string`

Defined in: [src/lib/errors.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L53)

###### Inherited from

`Data.TaggedError('AuthorizationError').requiredPermission`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('AuthorizationError').stack`

##### userId?

> `readonly` `optional` **userId?**: `string`

Defined in: [src/lib/errors.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L54)

###### Inherited from

`Data.TaggedError('AuthorizationError').userId`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`AuthorizationError`](#authorizationerror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`AuthorizationError`](#authorizationerror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('AuthorizationError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AuthorizationError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('AuthorizationError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('AuthorizationError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('AuthorizationError').toString`

***

### BusinessError

Defined in: [src/lib/errors.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L61)

Business rule violation

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `code`: `string`; `details?`: `Record`&lt;`string`, `unknown`&gt;; `message`: `string`; &#125;&gt;

#### Constructors

##### Constructor

> **new BusinessError**(`args`): [`BusinessError`](#businesserror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### code

`string`

###### details?

`Record`&lt;`string`, `unknown`&gt;

###### message

`string`

###### Returns

[`BusinessError`](#businesserror)

###### Inherited from

`Data.TaggedError('BusinessError')<{ readonly message: string readonly code: string readonly details?: Record<string, unknown> }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"BusinessError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('BusinessError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`BusinessError`](#businesserror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('BusinessError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`BusinessError`](#businesserror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('BusinessError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`BusinessError`](#businesserror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('BusinessError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`BusinessError`](#businesserror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('BusinessError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('BusinessError').cause`

##### code

> `readonly` **code**: `string`

Defined in: [src/lib/errors.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L63)

###### Inherited from

`Data.TaggedError('BusinessError').code`

##### details?

> `readonly` `optional` **details?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/lib/errors.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L64)

###### Inherited from

`Data.TaggedError('BusinessError').details`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('BusinessError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('BusinessError').name`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('BusinessError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`BusinessError`](#businesserror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`BusinessError`](#businesserror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('BusinessError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('BusinessError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('BusinessError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('BusinessError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('BusinessError').toString`

***

### ConflictError

Defined in: [src/lib/errors.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L78)

Conflict error - duplicate resource or version mismatch

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `details?`: `Record`&lt;`string`, `unknown`&gt;; `field?`: `string`; `message`: `string`; `resource`: `string`; `value?`: `unknown`; &#125;&gt;

#### Constructors

##### Constructor

> **new ConflictError**(`args`): [`ConflictError`](#conflicterror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### details?

`Record`&lt;`string`, `unknown`&gt;

###### field?

`string`

###### message

`string`

###### resource

`string`

###### value?

`unknown`

###### Returns

[`ConflictError`](#conflicterror)

###### Inherited from

`Data.TaggedError('ConflictError')<{ readonly message: string readonly resource: string readonly field?: string readonly value?: unknown readonly details?: Record<string, unknown> }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"ConflictError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('ConflictError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`ConflictError`](#conflicterror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('ConflictError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`ConflictError`](#conflicterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('ConflictError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`ConflictError`](#conflicterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('ConflictError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`ConflictError`](#conflicterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('ConflictError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('ConflictError').cause`

##### details?

> `readonly` `optional` **details?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/lib/errors.ts:83](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L83)

###### Inherited from

`Data.TaggedError('ConflictError').details`

##### field?

> `readonly` `optional` **field?**: `string`

Defined in: [src/lib/errors.ts:81](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L81)

###### Inherited from

`Data.TaggedError('ConflictError').field`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('ConflictError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('ConflictError').name`

##### resource

> `readonly` **resource**: `string`

Defined in: [src/lib/errors.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L80)

###### Inherited from

`Data.TaggedError('ConflictError').resource`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('ConflictError').stack`

##### value?

> `readonly` `optional` **value?**: `unknown`

Defined in: [src/lib/errors.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L82)

###### Inherited from

`Data.TaggedError('ConflictError').value`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`ConflictError`](#conflicterror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`ConflictError`](#conflicterror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('ConflictError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('ConflictError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('ConflictError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('ConflictError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('ConflictError').toString`

***

### DatabaseError

Defined in: [src/lib/errors.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L15)

Database operation errors

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `cause?`: `unknown`; `message`: `string`; `operation`: `"query"` &#124; `"insert"` &#124; `"update"` &#124; `"delete"` &#124; `"upsert"` &#124; `"transaction"`; &#125;&gt;

#### Constructors

##### Constructor

> **new DatabaseError**(`args`): [`DatabaseError`](#databaseerror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### cause?

`unknown`

###### message

`string`

###### operation

`"query"` &#124; `"insert"` &#124; `"update"` &#124; `"delete"` &#124; `"upsert"` &#124; `"transaction"`

###### Returns

[`DatabaseError`](#databaseerror)

###### Inherited from

Data.TaggedError('DatabaseError')&lt;&#123; readonly message: string readonly operation: 'query' &#124; 'insert' &#124; 'update' &#124; 'delete' &#124; 'upsert' &#124; 'transaction' readonly cause?: unknown &#125;&gt;.constructor

#### Properties

##### \_tag

> `readonly` **\_tag**: `"DatabaseError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('DatabaseError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`DatabaseError`](#databaseerror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('DatabaseError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`DatabaseError`](#databaseerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('DatabaseError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`DatabaseError`](#databaseerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('DatabaseError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`DatabaseError`](#databaseerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('DatabaseError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

[`ValidationError`](#validationerror).[`cause`](#cause-8)

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('DatabaseError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('DatabaseError').name`

##### operation

> `readonly` **operation**: `"query"` &#124; `"insert"` &#124; `"update"` &#124; `"delete"` &#124; `"upsert"` &#124; `"transaction"`

Defined in: [src/lib/errors.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L17)

###### Inherited from

`Data.TaggedError('DatabaseError').operation`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('DatabaseError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`DatabaseError`](#databaseerror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`DatabaseError`](#databaseerror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('DatabaseError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('DatabaseError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('DatabaseError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('DatabaseError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('DatabaseError').toString`

***

### NotFoundError

Defined in: [src/lib/errors.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L33)

Resource not found error

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `id`: `string` &#124; `number`; `message`: `string`; `resource`: `string`; &#125;&gt;

#### Constructors

##### Constructor

> **new NotFoundError**(`args`): [`NotFoundError`](#notfounderror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### id

`string` &#124; `number`

###### message

`string`

###### resource

`string`

###### Returns

[`NotFoundError`](#notfounderror)

###### Inherited from

Data.TaggedError('NotFoundError')&lt;&#123; readonly message: string readonly resource: string readonly id: string &#124; number &#125;&gt;.constructor

#### Properties

##### \_tag

> `readonly` **\_tag**: `"NotFoundError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('NotFoundError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`NotFoundError`](#notfounderror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('NotFoundError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`NotFoundError`](#notfounderror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('NotFoundError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`NotFoundError`](#notfounderror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('NotFoundError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`NotFoundError`](#notfounderror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('NotFoundError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('NotFoundError').cause`

##### id

> `readonly` **id**: `string` &#124; `number`

Defined in: [src/lib/errors.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L36)

###### Inherited from

`Data.TaggedError('NotFoundError').id`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('NotFoundError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('NotFoundError').name`

##### resource

> `readonly` **resource**: `string`

Defined in: [src/lib/errors.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L35)

###### Inherited from

`Data.TaggedError('NotFoundError').resource`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('NotFoundError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`NotFoundError`](#notfounderror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`NotFoundError`](#notfounderror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('NotFoundError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('NotFoundError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('NotFoundError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('NotFoundError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('NotFoundError').toString`

***

### RateLimitError

Defined in: [src/lib/errors.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L70)

Rate limit exceeded

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `message`: `string`; `retryAfter`: `number`; &#125;&gt;

#### Constructors

##### Constructor

> **new RateLimitError**(`args`): [`RateLimitError`](#ratelimiterror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### message

`string`

###### retryAfter

`number`

###### Returns

[`RateLimitError`](#ratelimiterror)

###### Inherited from

`Data.TaggedError('RateLimitError')<{ readonly message: string readonly retryAfter: number }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"RateLimitError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('RateLimitError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`RateLimitError`](#ratelimiterror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('RateLimitError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`RateLimitError`](#ratelimiterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('RateLimitError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`RateLimitError`](#ratelimiterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('RateLimitError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`RateLimitError`](#ratelimiterror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('RateLimitError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('RateLimitError').cause`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('RateLimitError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('RateLimitError').name`

##### retryAfter

> `readonly` **retryAfter**: `number`

Defined in: [src/lib/errors.ts:72](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L72)

###### Inherited from

`Data.TaggedError('RateLimitError').retryAfter`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('RateLimitError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`RateLimitError`](#ratelimiterror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`RateLimitError`](#ratelimiterror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('RateLimitError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('RateLimitError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('RateLimitError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('RateLimitError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('RateLimitError').toString`

***

### ValidationError

Defined in: [src/lib/errors.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L24)

Validation errors from Zod or business rules

#### Extends

- `YieldableError`&lt;`this`&gt; & `object` & `Readonly`&lt;&#123; `errors`: readonly `string`[]; `field?`: `string`; `message`: `string`; &#125;&gt;

#### Constructors

##### Constructor

> **new ValidationError**(`args`): [`ValidationError`](#validationerror)

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:610

###### Parameters

###### args

###### errors

readonly `string`[]

###### field?

`string`

###### message

`string`

###### Returns

[`ValidationError`](#validationerror)

###### Inherited from

`Data.TaggedError('ValidationError')<{ readonly message: string readonly field?: string readonly errors: readonly string[] }>.constructor`

#### Properties

##### \_tag

> `readonly` **\_tag**: `"ValidationError"`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Data.d.ts:611

###### Inherited from

`Data.TaggedError('ValidationError')._tag`

##### \[ChannelTypeId\]

> `readonly` **\[ChannelTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, [`ValidationError`](#validationerror), `unknown`, `never`, `unknown`, `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:285

###### Inherited from

`Data.TaggedError('ValidationError').[ChannelTypeId]`

##### \[EffectTypeId\]

> `readonly` **\[EffectTypeId\]**: `VarianceStruct`&lt;`never`, [`ValidationError`](#validationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:282

###### Inherited from

`Data.TaggedError('ValidationError').[EffectTypeId]`

##### \[SinkTypeId\]

> `readonly` **\[SinkTypeId\]**: `VarianceStruct`&lt;`never`, `unknown`, `never`, [`ValidationError`](#validationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:284

###### Inherited from

`Data.TaggedError('ValidationError').[SinkTypeId]`

##### \[StreamTypeId\]

> `readonly` **\[StreamTypeId\]**: `VarianceStruct`&lt;`never`, [`ValidationError`](#validationerror), `never`&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:283

###### Inherited from

`Data.TaggedError('ValidationError').[StreamTypeId]`

##### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

###### Inherited from

`Data.TaggedError('ValidationError').cause`

##### errors

> `readonly` **errors**: readonly `string`[]

Defined in: [src/lib/errors.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L27)

###### Inherited from

`Data.TaggedError('ValidationError').errors`

##### field?

> `readonly` `optional` **field?**: `string`

Defined in: [src/lib/errors.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L26)

###### Inherited from

`Data.TaggedError('ValidationError').field`

##### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

###### Inherited from

`Data.TaggedError('ValidationError').message`

##### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

###### Inherited from

`Data.TaggedError('ValidationError').name`

##### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

###### Inherited from

`Data.TaggedError('ValidationError').stack`

#### Methods

##### \[iterator\]()

> **\[iterator\]**(): `EffectGenerator`&lt;`Effect`&lt;`never`, [`ValidationError`](#validationerror), `never`&gt;&gt;

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Cause.d.ts:286

###### Returns

`EffectGenerator`&lt;`Effect`&lt;`never`, [`ValidationError`](#validationerror), `never`&gt;&gt;

###### Inherited from

`Data.TaggedError('ValidationError').[iterator]`

##### \[NodeInspectSymbol\]()

> **\[NodeInspectSymbol\]**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:22

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('ValidationError').[NodeInspectSymbol]`

##### pipe()

###### Call Signature

> **pipe**&lt;`A`&gt;(`this`): `A`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:10

###### Type Parameters

###### A

`A`

###### Parameters

###### this

`A`

###### Returns

`A`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`&gt;(`this`, `ab`): `B`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:11

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### Returns

`B`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`&gt;(`this`, `ab`, `bc`): `C`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:12

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### Returns

`C`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`&gt;(`this`, `ab`, `bc`, `cd`): `D`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:13

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### Returns

`D`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`&gt;(`this`, `ab`, `bc`, `cd`, `de`): `E`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:14

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### Returns

`E`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`): `F`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:15

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### Returns

`F`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`): `G`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:16

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### Returns

`G`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`): `H`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:17

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### Returns

`H`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`): `I`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:18

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### Returns

`I`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`): `J`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:19

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### Returns

`J`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`): `K`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:20

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### Returns

`K`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`): `L`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:21

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### Returns

`L`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`): `M`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:22

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### Returns

`M`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`): `N`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:23

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### Returns

`N`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`): `O`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:24

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### Returns

`O`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`): `P`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:25

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### Returns

`P`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`): `Q`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:26

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### Returns

`Q`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`): `R`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:27

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### Returns

`R`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`): `S`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:28

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### Returns

`S`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`): `T`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:29

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### Returns

`T`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:30

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

###### Call Signature

> **pipe**&lt;`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`&gt;(`this`, `ab`, `bc`, `cd`, `de`, `ef`, `fg`, `gh`, `hi`, `ij`, `jk`, `kl`, `lm`, `mn`, `no`, `op`, `pq`, `qr`, `rs`, `st`, `tu`): `U`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Pipeable.d.ts:31

###### Type Parameters

###### A

`A`

###### B

`B` = `never`

###### C

`C` = `never`

###### D

`D` = `never`

###### E

`E` = `never`

###### F

`F` = `never`

###### G

`G` = `never`

###### H

`H` = `never`

###### I

`I` = `never`

###### J

`J` = `never`

###### K

`K` = `never`

###### L

`L` = `never`

###### M

`M` = `never`

###### N

`N` = `never`

###### O

`O` = `never`

###### P

`P` = `never`

###### Q

`Q` = `never`

###### R

`R` = `never`

###### S

`S` = `never`

###### T

`T` = `never`

###### U

`U` = `never`

###### Parameters

###### this

`A`

###### ab

(`_`) => `B`

###### bc

(`_`) => `C`

###### cd

(`_`) => `D`

###### de

(`_`) => `E`

###### ef

(`_`) => `F`

###### fg

(`_`) => `G`

###### gh

(`_`) => `H`

###### hi

(`_`) => `I`

###### ij

(`_`) => `J`

###### jk

(`_`) => `K`

###### kl

(`_`) => `L`

###### lm

(`_`) => `M`

###### mn

(`_`) => `N`

###### no

(`_`) => `O`

###### op

(`_`) => `P`

###### pq

(`_`) => `Q`

###### qr

(`_`) => `R`

###### rs

(`_`) => `S`

###### st

(`_`) => `T`

###### tu

(`_`) => `U`

###### Returns

`U`

###### Inherited from

`Data.TaggedError('ValidationError').pipe`

##### toJSON()

> **toJSON**(): `unknown`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:21

###### Returns

`unknown`

###### Inherited from

`Data.TaggedError('ValidationError').toJSON`

##### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/effect@3.21.0/node\_modules/effect/dist/dts/Inspectable.d.ts:20

###### Returns

`string`

###### Inherited from

`Data.TaggedError('ValidationError').toString`

## Type Aliases

### CommonError

> **CommonError** = [`DatabaseError`](#databaseerror) &#124; [`ValidationError`](#validationerror) &#124; [`NotFoundError`](#notfounderror) &#124; [`AuthenticationError`](#authenticationerror) &#124; [`AuthorizationError`](#authorizationerror) &#124; [`BusinessError`](#businesserror) &#124; [`ConflictError`](#conflicterror)

Defined in: [src/lib/errors.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/errors.ts#L89)

Type alias for common error union
