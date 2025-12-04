[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / LoggingService

# Class: LoggingService

Defined in: Logging.service.ts:10

Service responsible for platform logs.

## Constructors

### new LoggingService()

> **new LoggingService**(): [`LoggingService`](LoggingService.md)

#### Returns

[`LoggingService`](LoggingService.md)

## Methods

### getAdminLogs()

> **getAdminLogs**(`category`?, `username`?): `Promise`\<`AdminLogResponse`[]\>

Defined in: Logging.service.ts:107

Retrieves all or filtered administrative logs.

#### Parameters

##### category?

`string`

The operation category

##### username?

`string`

Operation performer

#### Returns

`Promise`\<`AdminLogResponse`[]\>

A promise resolving to all or filtered administrative logs

***

### getPlatformLogs()

> **getPlatformLogs**(`type`?): `Promise`\<`PlatformLogResponse`[]\>

Defined in: Logging.service.ts:156

Retrieves all or filtered platform logs.

#### Parameters

##### type?

`string`

The type of the event

#### Returns

`Promise`\<`PlatformLogResponse`[]\>

A promise resolving to all or filtered platform logs

***

### log()

> **log**(`type`, `message`): `Promise`\<`void`\>

Defined in: Logging.service.ts:95

Logs different platform events.

#### Parameters

##### type

`string`

The type of event

##### message

`string`

The message to log

#### Returns

`Promise`\<`void`\>

***

### logOperation()

> **logOperation**(`username`, `target`, `operation`): `Promise`\<`void`\>

Defined in: Logging.service.ts:28

Logs different administrative operations.

#### Parameters

##### username

`string`

The username of the user performing the action

##### target

`string`

The type of entity being acted upon

##### operation

`string` = `'create'`

The action performed

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

#### Throws

UserNotFoundError
Thrown if the admin is not found.

#### Throws

AdminLogInvalidTargetError
Thrown if the provided target is not valid

#### Throws

AdminLogCreationError
Thrown if the log cannot be created
