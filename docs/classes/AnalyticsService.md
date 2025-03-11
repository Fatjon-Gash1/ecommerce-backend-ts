[**server**](../README.md)

***

[server](../globals.md) / AnalyticsService

# Class: AnalyticsService

Defined in: [Analytics.service.ts:42](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L42)

Service responsible for analytics-related operations and report generation.

## Constructors

### new AnalyticsService()

> **new AnalyticsService**(): [`AnalyticsService`](AnalyticsService.md)

#### Returns

[`AnalyticsService`](AnalyticsService.md)

## Methods

### deleteAllReportsByType()

> **deleteAllReportsByType**(`type`): `Promise`\<`string`\>

Defined in: [Analytics.service.ts:836](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L836)

Deletes all reports of a given type in the reports directory.

#### Parameters

##### type

`string`

The type of report to be deleted

#### Returns

`Promise`\<`string`\>

A promise that resolves to a successful deletion message

#### Throws

Error
Thrown if directory reading or file deletion fails.

***

### deleteReport()

> **deleteReport**(`reportName`): `Promise`\<`string`\>

Defined in: [Analytics.service.ts:807](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L807)

Deletes a report in the reports directory.

#### Parameters

##### reportName

`string`

The name of the report to be deleted

#### Returns

`Promise`\<`string`\>

A promise that resolves to a successful deletion message

#### Throws

Error
Thrown if the report is not found or deletion fails.

***

### generateSalesReport()

> **generateSalesReport**(`username`): `Promise`\<`void`\>

Defined in: [Analytics.service.ts:49](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L49)

Generates a broad sales report including product sales, category sales, and total revenue.

#### Parameters

##### username

`string`

The user's username

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

***

### generateStockReport()

> **generateStockReport**(`username`): `Promise`\<`void`\>

Defined in: [Analytics.service.ts:210](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L210)

Generates a stock report based on stock quantity.

#### Parameters

##### username

`string`

The user's username

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

***

### getAverageOrderValue()

> **getAverageOrderValue**(): `Promise`\<`number`\>

Defined in: [Analytics.service.ts:427](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L427)

Retrieves the average order value in the platform.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing
the average order value

***

### getCategoryWithMostPurchases()

> **getCategoryWithMostPurchases**(): `Promise`\<`TopCategory`\>

Defined in: [Analytics.service.ts:451](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L451)

Retrieves the category with the most purchases.

#### Returns

`Promise`\<`TopCategory`\>

A promise that resolves to an object containing the category
and the count of purchases.

***

### getCategoryWithMostPurchasesByCustomer()

> **getCategoryWithMostPurchasesByCustomer**(`customerId`): `Promise`\<`TopCategory`\>

Defined in: [Analytics.service.ts:542](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L542)

Retrieves the category with the most purchases made by customer.

#### Parameters

##### customerId

`number`

The ID of the customer

#### Returns

`Promise`\<`TopCategory`\>

A promise that resolves to an object containing the category
and the count of purchases

***

### getPlatformOrdersByStatus()

> **getPlatformOrdersByStatus**(`status`): `Promise`\<\{ `rows`: `Order`[]; `total`: `number`; \}\>

Defined in: [Analytics.service.ts:788](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L788)

Retrieves the total platform orders by status.

#### Parameters

##### status

`string`

The status of the order (e.g., 'Pending', 'Cancelled', 'Delivered')

#### Returns

`Promise`\<\{ `rows`: `Order`[]; `total`: `number`; \}\>

A promise that resolves to an object containing
the count and an array of orders

***

### getProductsByStockStatus()

> **getProductsByStockStatus**(`status`): `Promise`\<\{ `rows`: `Product`[]; `total`: `number`; \}\>

Defined in: [Analytics.service.ts:703](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L703)

Retrieves the products based on stock status.

#### Parameters

##### status

`string` = `'instock'`

The stock status of the products (e.g., 'instock', 'outofstock', 'lowstock')

#### Returns

`Promise`\<\{ `rows`: `Product`[]; `total`: `number`; \}\>

A promise resolving to an object containing
the products in stock for the given status

***

### getProductViews()

> **getProductViews**(`productId`): `Promise`\<`number`\>

Defined in: [Analytics.service.ts:636](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L636)

Retrieves the total views of a product.

#### Parameters

##### productId

`number`

The ID of the product

#### Returns

`Promise`\<`number`\>

A promise resolving to a number representing
the total views of the product

***

### getStockDataForCategoryByStatus()

> **getStockDataForCategoryByStatus**(`status`): `Promise`\<`object`[]\>

Defined in: [Analytics.service.ts:737](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L737)

Retrieves stock data for each category.

#### Parameters

##### status

`string` = `'instock'`

The stock status of the products (e.g., 'instock', 'outofstock', 'lowstock')

#### Returns

`Promise`\<`object`[]\>

A promise resolving to an array of objects containing the category name and stock status

***

### getTopSellingProducts()

> **getTopSellingProducts**(`limit`): `Promise`\<`number`\>

Defined in: [Analytics.service.ts:592](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L592)

Retrieves the top selling products.

#### Parameters

##### limit

`number`

The number of products to retrieve

#### Returns

`Promise`\<`number`\>

A promise resolving to an array of Product instances

***

### getTotalProductPurchases()

> **getTotalProductPurchases**(`filter`): `Promise`\<\{ `products`: `PurchasedProductResponse`[]; `purchasesCount`: `number`; \}\>

Defined in: [Analytics.service.ts:300](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L300)

Retrieves the total number of product purchases and each
purchased product in the platform.

#### Parameters

##### filter

`"quantity"` | `"totalRevenue"`

#### Returns

`Promise`\<\{ `products`: `PurchasedProductResponse`[]; `purchasesCount`: `number`; \}\>

A promise that resolves to an object containing
the total purchase count and an array of purchased products

***

### getTotalProductPurchasesForCustomer()

> **getTotalProductPurchasesForCustomer**(`customerId`): `Promise`\<\{ `products`: `PurchasedProductResponse`[]; `totalCount`: `number`; \}\>

Defined in: [Analytics.service.ts:499](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L499)

Retrieves the total product purchases for customer.

#### Parameters

##### customerId

`number`

The ID of the customer

#### Returns

`Promise`\<\{ `products`: `PurchasedProductResponse`[]; `totalCount`: `number`; \}\>

A promise that resolves to an object containing
the count and an array of products

***

### getTotalProductsRevenue()

> **getTotalProductsRevenue**(): `Promise`\<`number`\>

Defined in: [Analytics.service.ts:364](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L364)

Retrieves the total revenue of product sales.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number of total product sales.

***

### getTotalRevenue()

> **getTotalRevenue**(): `Promise`\<`number`\>

Defined in: [Analytics.service.ts:406](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Analytics.service.ts#L406)

Retrieves the total revenue of the platform including shipping costs.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing
the total revenue
