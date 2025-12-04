[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / ChattingServiceHTTP

# Class: ChattingServiceHTTP

Defined in: Chatting.service.ts:816

Serves chatting related business logic for HTTP requests.

## Constructors

### new ChattingServiceHTTP()

> **new ChattingServiceHTTP**(): [`ChattingServiceHTTP`](ChattingServiceHTTP.md)

#### Returns

[`ChattingServiceHTTP`](ChattingServiceHTTP.md)

## Methods

### getChatroomMessages()

> **getChatroomMessages**(`userId`, `chatroomId`, `lastMessageDate`?): `Promise`\<`MessageResponse`[]\>

Defined in: Chatting.service.ts:849

Retrieved the chatroom messages.

#### Parameters

##### userId

`number`

The ID of the user

##### chatroomId

`number`

The ID of the chatroom

##### lastMessageDate?

`Date`

The timestamp of the last message

#### Returns

`Promise`\<`MessageResponse`[]\>

A promise that resolves to an array of messages

***

### getUserChatroomsByType()

> **getUserChatroomsByType**(`userId`, `type`?): `Promise`\<\{ `chatrooms`: `ChatroomResponse`[]; `total`: `number`; \}\>

Defined in: Chatting.service.ts:824

Retrieves the user chatrooms by type, or all if type is not provided.

#### Parameters

##### userId

`number`

The ID of the user

##### type?

`string`

The chatroom type ("one-on-one", "group", "support")

#### Returns

`Promise`\<\{ `chatrooms`: `ChatroomResponse`[]; `total`: `number`; \}\>

A promise that resolves to an array of chatrooms

***

### rateSupportSession()

> **rateSupportSession**(`chatroomId`, `rating`): `Promise`\<`void`\>

Defined in: Chatting.service.ts:891

Rates the support agent for the given session.

#### Parameters

##### chatroomId

`number`

The ID of the chatroom

##### rating

`number`

The rating value

#### Returns

`Promise`\<`void`\>
