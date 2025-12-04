[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / AdminService

# Class: AdminService

Defined in: Admin.service.ts:24

Service responsible for Admin-related operations.

## Extends

- [`UserService`](UserService.md)

## Constructors

### new AdminService()

> **new AdminService**(`paymentService`?, `notificationService`?): [`AdminService`](AdminService.md)

Defined in: User.service.ts:52

#### Parameters

##### paymentService?

[`PaymentService`](PaymentService.md)

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`AdminService`](AdminService.md)

#### Inherited from

[`UserService`](UserService.md).[`constructor`](UserService.md#constructors)

## Properties

### notificationService?

> `protected` `optional` **notificationService**: [`NotificationService`](NotificationService.md)

Defined in: User.service.ts:50

#### Inherited from

[`UserService`](UserService.md).[`notificationService`](UserService.md#notificationservice-1)

***

### paymentService?

> `protected` `optional` **paymentService**: [`PaymentService`](PaymentService.md)

Defined in: User.service.ts:49

#### Inherited from

[`UserService`](UserService.md).[`paymentService`](UserService.md#paymentservice-1)

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

#### Inherited from

[`UserService`](UserService.md).[`changePassword`](UserService.md#changepassword)

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

#### Inherited from

[`UserService`](UserService.md).[`checkUserAvailability`](UserService.md#checkuseravailability)

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

#### Inherited from

[`UserService`](UserService.md).[`deleteNotification`](UserService.md#deletenotification)

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

#### Inherited from

[`UserService`](UserService.md).[`deleteUser`](UserService.md#deleteuser)

***

### findActiveCustomers()

> **findActiveCustomers**(): `Promise`\<\{ `count`: `number`; `customers`: `CustomerResponse`[]; \}\>

Defined in: Admin.service.ts:76

Retrieves active Customers from the database.

#### Returns

`Promise`\<\{ `count`: `number`; `customers`: `CustomerResponse`[]; \}\>

A promise resolving to an array of active Customer instances

***

### findCustomerByAttribute()

> **findCustomerByAttribute**(`attribute`, `attributeValue`): `Promise`\<`CustomerResponse`\>

Defined in: Admin.service.ts:105

Retrieves a specific Customer from the provided attribute.

#### Parameters

##### attribute

`string`

The attribute to search for

##### attributeValue

The value of the attribute

`string` | `number`

#### Returns

`Promise`\<`CustomerResponse`\>

A promise resolving to a Customer instance

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

#### Inherited from

[`UserService`](UserService.md).[`generateTokens`](UserService.md#generatetokens)

***

### getAdminById()

> **getAdminById**(`adminId`): `Promise`\<`AdminResponse`\>

Defined in: Admin.service.ts:322

Retrieves Admin by ID.

#### Parameters

##### adminId

`number`

The id of the Admin

#### Returns

`Promise`\<`AdminResponse`\>

A promise resolving to an Admin object

***

### getAllAdmins()

> **getAllAdmins**(`role`?): `Promise`\<\{ `admins`: `AdminResponse`[]; `count`: `number`; \}\>

Defined in: Admin.service.ts:295

Retrieves all Admins && optionally filtered by role.

#### Parameters

##### role?

`string`

The role of the Admins (optional)

#### Returns

`Promise`\<\{ `admins`: `AdminResponse`[]; `count`: `number`; \}\>

A promise resolving to an Admin instance array

***

### getAllCouriers()

> **getAllCouriers**(): `Promise`\<\{ `count`: `number`; `couriers`: `CourierResponse`[]; \}\>

Defined in: Admin.service.ts:235

Retrieves all Couriers in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `couriers`: `CourierResponse`[]; \}\>

A promise resolving to the total count along with the Courier objects

***

### getAllCustomers()

> **getAllCustomers**(): `Promise`\<\{ `count`: `number`; `customers`: `CustomerResponse`[]; \}\>

Defined in: Admin.service.ts:138

Retrieves all Customers in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `customers`: `CustomerResponse`[]; \}\>

A promise resolving to the total count along with
an array of Customer objects

***

### getAllSupportAgents()

> **getAllSupportAgents**(): `Promise`\<\{ `count`: `number`; `supportAgents`: `SupportAgentResponse`[]; \}\>

Defined in: Admin.service.ts:165

Retrieves all Support Agents in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `supportAgents`: `SupportAgentResponse`[]; \}\>

A promise resolving to the total count along with
an array of Support Agent objects

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

#### Inherited from

[`UserService`](UserService.md).[`getCourierById`](UserService.md#getcourierbyid)

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

#### Inherited from

[`UserService`](UserService.md).[`getCustomerById`](UserService.md#getcustomerbyid)

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

#### Inherited from

[`UserService`](UserService.md).[`getSupportAgentById`](UserService.md#getsupportagentbyid)

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

#### Inherited from

[`UserService`](UserService.md).[`loginUser`](UserService.md#loginuser)

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

#### Inherited from

[`UserService`](UserService.md).[`logoutUser`](UserService.md#logoutuser)

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

#### Inherited from

[`UserService`](UserService.md).[`markNotificationAsRead`](UserService.md#marknotificationasread)

***

### registerAdmin()

> **registerAdmin**(`details`): `Promise`\<`void`\>

Defined in: Admin.service.ts:66

Registers a user as an Admin.

#### Parameters

##### details

`UserCreationDetails`

The details of the user to register

#### Returns

`Promise`\<`void`\>

***

### registerCourier()

> **registerCourier**(`details`): `Promise`\<`void`\>

Defined in: Admin.service.ts:56

Registers a user as a Courier.

#### Parameters

##### details

`UserCreationDetails`

The details of the user to register

#### Returns

`Promise`\<`void`\>

***

### registerCustomer()

> **registerCustomer**(`details`): `Promise`\<`void`\>

Defined in: Admin.service.ts:30

Registers a user as a Customer.

#### Parameters

##### details

`UserCreationDetails`

The details of the user to register

#### Returns

`Promise`\<`void`\>

***

### registerSupportAgent()

> **registerSupportAgent**(`details`): `Promise`\<`void`\>

Defined in: Admin.service.ts:44

Registers a user as a Support Agent.

#### Parameters

##### details

`UserCreationDetails`

The details of the user to register

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

#### Inherited from

[`UserService`](UserService.md).[`requestPasswordReset`](UserService.md#requestpasswordreset)

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

#### Inherited from

[`UserService`](UserService.md).[`resetPassword`](UserService.md#resetpassword)

***

### setAdminRole()

> **setAdminRole**(`adminId`, `role`): `Promise`\<`void`\>

Defined in: Admin.service.ts:348

Sets admin role from the provided role number.

#### Parameters

##### adminId

`number`

The id of the Admin

##### role

`number`

The role number of the user

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError if the user is not found

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

#### Inherited from

[`UserService`](UserService.md).[`signUpCustomer`](UserService.md#signupcustomer)

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

#### Inherited from

[`UserService`](UserService.md).[`streamActiveUsers`](UserService.md#streamactiveusers)

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

#### Inherited from

[`UserService`](UserService.md).[`updateCustomerDetails`](UserService.md#updatecustomerdetails)

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

#### Inherited from

[`UserService`](UserService.md).[`updateUser`](UserService.md#updateuser)

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

#### Inherited from

[`UserService`](UserService.md).[`userFactory`](UserService.md#userfactory)

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

#### Inherited from

[`UserService`](UserService.md).[`verifyUserEmail`](UserService.md#verifyuseremail)
