[**server**](../README.md)

***

[server](../globals.md) / UserService

# Class: UserService

Defined in: [User.service.ts:63](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L63)

Service responsible for user-related operations.

## Extended by

- [`AdminService`](AdminService.md)

## Constructors

### new UserService()

> **new UserService**(`paymentService`, `notificationService`): [`UserService`](UserService.md)

Defined in: [User.service.ts:67](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L67)

#### Parameters

##### paymentService

[`PaymentService`](PaymentService.md)

##### notificationService

[`NotificationService`](NotificationService.md)

#### Returns

[`UserService`](UserService.md)

## Properties

### notificationService

> `protected` **notificationService**: [`NotificationService`](NotificationService.md)

Defined in: [User.service.ts:65](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L65)

***

### paymentService

> `protected` **paymentService**: [`PaymentService`](PaymentService.md)

Defined in: [User.service.ts:64](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L64)

## Methods

### changePassword()

> **changePassword**(`userId`, `oldPassword`, `newPassword`): `Promise`\<`void`\>

Defined in: [User.service.ts:291](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L291)

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

Defined in: [User.service.ts:217](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L217)

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

### deleteUser()

> **deleteUser**(`userId`): `Promise`\<`void`\>

Defined in: [User.service.ts:365](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L365)

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

> **generateTokens**(`userId`, `username`, `role`): `AuthTokens`

Defined in: [User.service.ts:186](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L186)

Generates refresh and access tokens for a user.

#### Parameters

##### userId

`number`

The ID of the user to generate tokens for

##### username

`string`

The username of the user

##### role

`string` = `'customer'`

The role of the user

#### Returns

`AuthTokens`

An object containing access and refresh tokens

***

### getCustomerById()

> **getCustomerById**(`customerId`): `Promise`\<`CustomerResponse`\>

Defined in: [User.service.ts:245](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L245)

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

### loginUser()

> **loginUser**(`username`, `password`): `Promise`\<`AuthTokens`\>

Defined in: [User.service.ts:154](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L154)

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

### requestPasswordReset()

> **requestPasswordReset**(`userEmail`): `Promise`\<`void`\>

Defined in: [User.service.ts:393](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L393)

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

Defined in: [User.service.ts:420](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L420)

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

Defined in: [User.service.ts:121](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L121)

Signs-Up a new customer user type in the platform.

#### Parameters

##### details

`UserCreationDetails`

The details of the customer to sign-up

#### Returns

`Promise`\<`AuthTokens`\>

A promise resolving to an object containing access and refresh tokens

***

### updateCustomerDetails()

> **updateCustomerDetails**(`userId`, `details`): `Promise`\<`Customer`\>

Defined in: [User.service.ts:321](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L321)

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

Defined in: [User.service.ts:344](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L344)

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

Defined in: [User.service.ts:89](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/User.service.ts#L89)

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
