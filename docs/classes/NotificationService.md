[**server**](../README.md)

***

[server](../README.md) / NotificationService

# Class: NotificationService

Defined in: [Notification.service.ts:19](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Notification.service.ts#L19)

Service responsible for handling platform notifications.

## Constructors

### new NotificationService()

> **new NotificationService**(): [`NotificationService`](NotificationService.md)

Defined in: [Notification.service.ts:32](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Notification.service.ts#L32)

Initialize the redis and nodemailer clients.

#### Returns

[`NotificationService`](NotificationService.md)

## Methods

### sendEmail()

> **sendEmail**(`options`): `Promise`\<`void`\>

Defined in: [Notification.service.ts:126](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Notification.service.ts#L126)

Notifies customers about new order confirmation.

Throws NotificationError
Thrown if it fails to publish the notification.

#### Parameters

##### options

`EmailOptions`

#### Returns

`Promise`\<`void`\>

***

### sendNewPromotionsEmail()

> **sendNewPromotionsEmail**(): `Promise`\<`void`\>

Defined in: [Notification.service.ts:145](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Notification.service.ts#L145)

Sends an email to all users about new product promotions.

Throws EmailNotificationError
Thrown if it fails to send some emails to the customers.

#### Returns

`Promise`\<`void`\>

***

### sendWelcomeEmail()

> **sendWelcomeEmail**(`firstName`, `email`): `Promise`\<`void`\>

Defined in: [Notification.service.ts:177](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Notification.service.ts#L177)

Sends a welcome email to a newly registered customer.

Throws EmailNotificationEmail
Thrown if it fails to send the email to the customer.

#### Parameters

##### firstName

`string`

##### email

`string`

#### Returns

`Promise`\<`void`\>
