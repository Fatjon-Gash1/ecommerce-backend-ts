[**server**](../README.md)

***

[server](../globals.md) / AdminLogsService

# Class: AdminLogsService

Defined in: [AdminLogs.service.ts:7](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/AdminLogs.service.ts#L7)

Service responsible for logging administrative operations.

## Constructors

### new AdminLogsService()

> **new AdminLogsService**(): [`AdminLogsService`](AdminLogsService.md)

#### Returns

[`AdminLogsService`](AdminLogsService.md)

## Methods

### log()

> **log**(`username`, `target`, `operation`): `Promise`\<`void`\>

Defined in: [AdminLogs.service.ts:25](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/AdminLogs.service.ts#L25)

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
