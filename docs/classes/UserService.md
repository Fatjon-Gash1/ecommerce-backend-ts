[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / UserService

# Class: UserService

Defined in: User.service.ts:48

Service responsible for user-related operations.

## Extended by

- [`AdminService`](AdminService.md)

## Constructors

### new UserService()

> **new UserService**(`paymentService`?, `notificationService`?): [`UserService`](UserService.md)

Defined in: User.service.ts:52

#### Parameters

##### paymentService?

[`PaymentService`](PaymentService.md)

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`UserService`](UserService.md)

## Properties

### notificationService?

> `protected` `optional` **notificationService**: [`NotificationService`](NotificationService.md)

Defined in: User.service.ts:50

***

### paymentService?

> `protected` `optional` **paymentService**: [`PaymentService`](PaymentService.md)

Defined in: User.service.ts:49

## Methods

### changePassword()

> **changePassword**(`userId`, `oldPassword`, `newPassword`): `Promise`\<`void`\>

Defined in: User.service.ts:522

Changes a user's password.

#### Parameters

##### userId

`number`

The ID of the user to update

##### oldPassword

`string`

The old password

##### newPassword

`string`

The new password

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the user is not found.

#### Throws

InvalidCredentialsError
Thrown if the old password is invalid.

***

### checkUserAvailability()

> **checkUserAvailability**(`userField`, `value`): `Promise`\<\{ `available`: `boolean`; `message`: `string`; \}\>

Defined in: User.service.ts:321

Checks user availability.

#### Parameters

##### userField

`string`

The field to check

##### value

`string`

The value of the field

#### Returns

`Promise`\<\{ `available`: `boolean`; `message`: `string`; \}\>

A promise resolving to an object containing a boolean and a message

***

### deleteNotification()

> **deleteNotification**(`userId`, `notificationId`?, `all`?): `Promise`\<`void`\>

Defined in: User.service.ts:657

Removes user notification/s.

#### Parameters

##### userId

`number`

The ID of the user

##### notificationId?

`number`

The ID of the notification

##### all?

`boolean`

Whether to remove all notifications

#### Returns

`Promise`\<`void`\>

***

### deleteUser()

> **deleteUser**(`userId`): `Promise`\<`void`\>

Defined in: User.service.ts:630

Deletes a user from the database.

#### Parameters

##### userId

`number`

The ID of the user to delete

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the user is not found

***

### generateTokens()

> **generateTokens**(`userId`, `username`, `type`, `membership`?): `AuthTokens`

Defined in: User.service.ts:289

Generates refresh and access tokens for a user.

#### Parameters

##### userId

`number`

The ID of the user to generate tokens for

##### username

`string`

The username of the user

##### type

`UserType` = `'customer'`

The type of the user

##### membership?

`CustomerMembership`

#### Returns

`AuthTokens`

An object containing access and refresh tokens

***

### getCourierById()

> **getCourierById**(`userId`?, `courierId`?): `Promise`\<`CourierResponse`\>

Defined in: User.service.ts:453

Retrieves a Courier by its id.

#### Parameters

##### userId?

`number`

The user id of the Courier

##### courierId?

`number`

The id of the Courier

#### Returns

`Promise`\<`CourierResponse`\>

A promise resolving to the courier object

***

### getCustomerById()

> **getCustomerById**(`customerId`): `Promise`\<`CustomerResponse`\>

Defined in: User.service.ts:349

Retrieves Customer by its Id.

#### Parameters

##### customerId

`number`

The id of the Customer

#### Returns

`Promise`\<`CustomerResponse`\>

A promise resolving to a Customer instance

#### Throws

UserNotFoundError
Thrown if the Customer is not found

***

### getSupportAgentById()

> **getSupportAgentById**(`userId`?, `agentId`?): `Promise`\<`SupportAgentResponse`\>

Defined in: User.service.ts:379

Retrieves a Support Agent by its ID.

#### Parameters

##### userId?

`number`

The user ID of the Support Agent

##### agentId?

`number`

The ID of the Support Agent

#### Returns

`Promise`\<`SupportAgentResponse`\>

A promise resolving to the support agent object

***

### loginUser()

> **loginUser**(`username`, `password`): `Promise`\<`AuthTokens`\>

Defined in: User.service.ts:235

Logins a user and returns access and refresh tokens.

#### Parameters

##### username

`string`

The username of the user

##### password

`string`

The password of the user

#### Returns

`Promise`\<`AuthTokens`\>

A promise resolving to an object containing access and refresh tokens

#### Throws

UserNotFoundError if the user is not found

#### Throws

InvalidCredentialsError if the password is invalid

***

### logoutUser()

> **logoutUser**(`userId`, `type`): `Promise`\<`void`\>

Defined in: User.service.ts:609

Logs a user out.

#### Parameters

##### userId

`number`

The ID of the user to log out

##### type

`UserType`

The type of the user ('admin', 'manager', 'customer')

#### Returns

`Promise`\<`void`\>

***

### markNotificationAsRead()

> **markNotificationAsRead**(`userId`, `notificationId`?, `all`?): `Promise`\<`void`\>

Defined in: User.service.ts:595

Marks user notification as read.

#### Parameters

##### userId

`number`

The ID of the user

##### notificationId?

`number`

The ID of the notification

##### all?

`boolean`

Whether to mark all notifications as read

#### Returns

`Promise`\<`void`\>

***

### requestPasswordReset()

> **requestPasswordReset**(`userEmail`): `Promise`\<`void`\>

Defined in: User.service.ts:677

Requests a password reset for a user.

#### Parameters

##### userEmail

`string`

The email of the user

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the user is not found

***

### resetPassword()

> **resetPassword**(`userId`, `newPassword`): `Promise`\<`void`\>

Defined in: User.service.ts:704

Resets user's password.

#### Parameters

##### userId

`string`

The ID of the user

##### newPassword

`string`

The new password to set

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the user is not found

***

### signUpCustomer()

> **signUpCustomer**(`details`): `Promise`\<`AuthTokens`\>

Defined in: User.service.ts:191

Signs-Up a new customer user type in the platform.

#### Parameters

##### details

`UserCreationDetails`

The details of the customer to sign-up

#### Returns

`Promise`\<`AuthTokens`\>

A promise resolving to an object containing access and refresh tokens

***

### streamActiveUsers()

> `protected` **streamActiveUsers**(`type`): `Promise`\<`void`\>

Defined in: User.service.ts:65

Streams active users of a given type.

#### Parameters

##### type

`UserType`

The user type

#### Returns

`Promise`\<`void`\>

***

### updateCustomerDetails()

> **updateCustomerDetails**(`userId`, `details`): `Promise`\<`Customer`\>

Defined in: User.service.ts:552

Updates customer's shipping and billing details.

#### Parameters

##### userId

`number`

The user ID of the Customer

##### details

`CustomerDetails`

The shipping and billing details

#### Returns

`Promise`\<`Customer`\>

#### Throws

UserNotFoundError
Thrown if the Customer is not found.

***

### updateUser()

> **updateUser**(`userId`, `details`): `Promise`\<`User`\>

Defined in: User.service.ts:575

Updates a user in the database.

#### Parameters

##### userId

`number`

The ID of the user to update

##### details

`UserDetails`

The details of the user to update

#### Returns

`Promise`\<`User`\>

A promise resolving to the updated user

#### Throws

UserNotFoundError
Thrown if the user is not found

***

### userFactory()

> `protected` **userFactory**\<`T`\>(`userClass`, `details`): `Promise`\<`T`\>

Defined in: User.service.ts:118

Creates a provided user type class instance.

#### Type Parameters

• **T** *extends* `Model`\<`any`, `any`\>

#### Parameters

##### userClass

`ModelStatic`\<`T`\>

The user type class

##### details

`UserCreationDetails`

The details of the user to build

#### Returns

`Promise`\<`T`\>

A promise resolving to the created class instance

#### Remarks

This is a factory method that will be used by utility methods below
and in a subclass.

#### Throws

UserAlreadyExistsError
Thrown if the user already exists.

***

### verifyUserEmail()

> **verifyUserEmail**(`details`): `Promise`\<`void`\>

Defined in: User.service.ts:149

Verify user email

#### Parameters

##### details

`UserCreationDetails`

The details of the user to sign-up

#### Returns

`Promise`\<`void`\>
