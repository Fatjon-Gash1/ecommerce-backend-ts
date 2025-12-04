[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / ReplenishmentService

# Class: ReplenishmentService

Defined in: subscription\_service/Replenishment.service.ts:25

Responsible for replenishment related operations

## Remarks

Uses two separate classes.

## Scheduler

- Handles scheduling of replenishments

## Worker Service

- Handles processing of replenishments

## Constructors

### new ReplenishmentService()

> **new ReplenishmentService**(`instantiation`?): [`ReplenishmentService`](ReplenishmentService.md)

Defined in: subscription\_service/Replenishment.service.ts:30

#### Parameters

##### instantiation?

`"partial"`

#### Returns

[`ReplenishmentService`](ReplenishmentService.md)

## Properties

### scheduler?

> `optional` **scheduler**: `Scheduler`

Defined in: subscription\_service/Replenishment.service.ts:27

## Methods

### getAllReplenishments()

> **getAllReplenishments**(`filters`?): `Promise`\<\{ `replenishments`: `ReplenishmentResponse`[]; `total`: `number`; \}\>

Defined in: subscription\_service/Replenishment.service.ts:137

Retrieves all customer order replenishments based on filtered parameters. If none provided it returns all replenishments.

#### Parameters

##### filters?

`ReplenishmentFilters`

Optional filters to filter replenishments

#### Returns

`Promise`\<\{ `replenishments`: `ReplenishmentResponse`[]; `total`: `number`; \}\>

A promise resolving to an object containing the total number of replenishments and an array of replenishments

***

### getCustomerReplenishments()

> **getCustomerReplenishments**(`userId`): `Promise`\<\{ `rows`: `ReplenishmentResponse`[]; `total`: `number`; \}\>

Defined in: subscription\_service/Replenishment.service.ts:56

Retrieves all replenishments for a customer

#### Parameters

##### userId

`number`

The user id of the customer

#### Returns

`Promise`\<\{ `rows`: `ReplenishmentResponse`[]; `total`: `number`; \}\>

A promise resolving to an object containing the total number of replenishments and an array of replenishments

***

### getReplenishmentById()

> **getReplenishmentById**(`userId`, `replenishmentId`): `Promise`\<`ReplenishmentResponse`\>

Defined in: subscription\_service/Replenishment.service.ts:95

Retrieves a specific replenishment by its ID for a customer

#### Parameters

##### userId

`number`

The user id of the customer

##### replenishmentId

`number`

The ID of the replenishment to retrieve

#### Returns

`Promise`\<`ReplenishmentResponse`\>

A promise resolving to the replenishment object

***

### getScheduler()

> **getScheduler**(): `null` \| `Scheduler`

Defined in: subscription\_service/Replenishment.service.ts:42

#### Returns

`null` \| `Scheduler`

***

### getWorkerService()

> **getWorkerService**(): `null` \| `WorkerService`

Defined in: subscription\_service/Replenishment.service.ts:46

#### Returns

`null` \| `WorkerService`

***

### listenAll()

> **listenAll**(): `void`

Defined in: subscription\_service/Replenishment.service.ts:37

#### Returns

`void`
