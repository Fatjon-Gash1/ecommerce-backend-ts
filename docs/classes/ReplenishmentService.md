[**server**](../README.md)

***

[server](../globals.md) / ReplenishmentService

# Class: ReplenishmentService

Defined in: [subscription\_service/Replenishment.service.ts:42](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L42)

Responsible for replenishment related operations

## Remarks

Users two separate classes.

## Scheduler

- Handles scheduling of replenishments

## Worker Service

- Handles processing of replenishments

## Constructors

### new ReplenishmentService()

> **new ReplenishmentService**(`instantiation`?): [`ReplenishmentService`](ReplenishmentService.md)

Defined in: [subscription\_service/Replenishment.service.ts:47](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L47)

#### Parameters

##### instantiation?

`"partial"`

#### Returns

[`ReplenishmentService`](ReplenishmentService.md)

## Properties

### scheduler?

> `optional` **scheduler**: `Scheduler`

Defined in: [subscription\_service/Replenishment.service.ts:44](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L44)

## Methods

### getAllReplenishments()

> **getAllReplenishments**(`filters`?): `Promise`\<\{ `replenishments`: `ReplenishmentResponse`[]; `total`: `number`; \}\>

Defined in: [subscription\_service/Replenishment.service.ts:146](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L146)

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

Defined in: [subscription\_service/Replenishment.service.ts:65](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L65)

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

Defined in: [subscription\_service/Replenishment.service.ts:104](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L104)

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

### listenAll()

> **listenAll**(): `void`

Defined in: [subscription\_service/Replenishment.service.ts:54](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/Replenishment.service.ts#L54)

#### Returns

`void`
