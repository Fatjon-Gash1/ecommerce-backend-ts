[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / ChattingService

# Class: ChattingService

Defined in: Chatting.service.ts:29

Service responsible for Real-Time one-on-one and group chatting.

## Constructors

### new ChattingService()

> **new ChattingService**(`server`, `loggingService`): [`ChattingService`](ChattingService.md)

Defined in: Chatting.service.ts:38

#### Parameters

##### server

`Server`

##### loggingService

[`LoggingService`](LoggingService.md)

#### Returns

[`ChattingService`](ChattingService.md)

## Methods

### init()

> **init**(`socket`): `Promise`\<`void`\>

Defined in: Chatting.service.ts:48

Initializes the socket connection and sets up the necessary event listeners.

#### Parameters

##### socket

`Socket`\<`ClientToServerEvents`, `ServerToClientEvents`, `InterServerEvents`, `UserData`\>

The socket instance representing the connected user.

#### Returns

`Promise`\<`void`\>
