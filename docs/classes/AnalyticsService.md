[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / AnalyticsService

# Class: AnalyticsService

Defined in: Analytics.service.ts:46

Service responsible for analytics-related operations and report generation.

## Constructors

### new AnalyticsService()

> **new AnalyticsService**(): [`AnalyticsService`](AnalyticsService.md)

#### Returns

[`AnalyticsService`](AnalyticsService.md)

## Methods

### deleteAllReportsByType()

> **deleteAllReportsByType**(`type`): `Promise`\<`string`\>

Defined in: Analytics.service.ts:1846

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

Defined in: Analytics.service.ts:1817

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

### generateCustomerOrdersReport()

> **generateCustomerOrdersReport**(`username`, `customerId`, `status`?, `interval`?): `Promise`\<`void`\>

Defined in: Analytics.service.ts:568

Generates a customer specific orders report.

#### Parameters

##### username

`string`

The user's username

##### customerId

`number`

The customer's id

##### status?

`string` = `'all'`

The order status

##### interval?

`BaseInterval`

The interval for which the report should be generated

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

***

### generateCustomerPurchasesReport()

> **generateCustomerPurchasesReport**(`username`, `customerId`, `interval`?): `Promise`\<`void`\>

Defined in: Analytics.service.ts:472

Generates a customer specific purchases report (singular product purchases).

#### Parameters

##### username

`string`

The user's username

##### customerId

`number`

The customer's id

##### interval?

`BaseInterval` = `'full'`

The interval for which the report should be generated

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

***

### generateOrdersReport()

> **generateOrdersReport**(`username`, `status`, `interval`?): `Promise`\<`void`\>

Defined in: Analytics.service.ts:421

Generates an orders report.

#### Parameters

##### username

`string`

The user's username

##### status

`string`

The status of the order

##### interval?

`BaseInterval` = `'full'`

The interval for which the report should be generated

#### Returns

`Promise`\<`void`\>

***

### generatePurchasesReport()

> **generatePurchasesReport**(`username`, `interval`?): `Promise`\<`void`\>

Defined in: Analytics.service.ts:363

Generates a purchases report (singular product purchases).

#### Parameters

##### username

`string`

The user's username

##### interval?

`BaseInterval` = `'full'`

The interval for which the report should be generated

#### Returns

`Promise`\<`void`\>

A promise that resolves to void

***

### generateSalesReport()

> **generateSalesReport**(`username`): `Promise`\<`void`\>

Defined in: Analytics.service.ts:52

Generates a broad sales report including product sales, category sales, total revenue and so on.

#### Parameters

##### username

`string`

The user's username

#### Returns

`Promise`\<`void`\>

***

### generateStockReport()

> **generateStockReport**(`username`): `Promise`\<`void`\>

Defined in: Analytics.service.ts:267

Generates a stock report.

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

Defined in: Analytics.service.ts:920

Retrieves the average order value in the platform.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing
the average order value

***

### getCartAbandonmentRate()

> **getCartAbandonmentRate**(): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1783

Retrieves the product "Add to Cart Rate".

#### Returns

`Promise`\<`number`\>

A promise resolving to the rate.

***

### getCategoryWithMostPurchases()

> **getCategoryWithMostPurchases**(): `Promise`\<`PurchasedCategoryResponse`\>

Defined in: Analytics.service.ts:940

Retrieves the category with the most purchases.

#### Returns

`Promise`\<`PurchasedCategoryResponse`\>

A promise that resolves to an object containing the category
and the count of purchases.

***

### getCategoryWithMostPurchasesByCustomer()

> **getCategoryWithMostPurchasesByCustomer**(`customerId`): `Promise`\<`PurchasedCategoryResponse`\>

Defined in: Analytics.service.ts:1420

Retrieves the category with the most purchases made by customer.

#### Parameters

##### customerId

`number`

The ID of the customer

#### Returns

`Promise`\<`PurchasedCategoryResponse`\>

A promise that resolves to an object containing the category response

***

### getConversionRate()

> **getConversionRate**(`interval`?): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1619

Retrieves the conversion rate for a given interval.

#### Parameters

##### interval?

`BaseInterval` = `'full'`

The interval for which the conversion rate is to be retrieved.

#### Returns

`Promise`\<`number`\>

A promise resolving to the conversion rate.

***

### getCustomerAcquisitionCost()

> **getCustomerAcquisitionCost**(`expenses`, `interval`): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1689

Retrieves the customer acquisition cost for a given interval.

#### Parameters

##### expenses

`number`

The expenses to be considered in the calculation.

##### interval

The interval for which the acquisition cost is to be retrieved.

`"monthly"` | `"weekly"` | `"yearly"`

#### Returns

`Promise`\<`number`\>

A promise resolving to the acquisition cost.

***

### getCustomerAcquisitionRate()

> **getCustomerAcquisitionRate**(`leads`, `interval`): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1720

Retrieves the customer acquisition rate for a given interval.

#### Parameters

##### leads

`number`

The number of leads for the acquisition rate calculation.

##### interval

The interval for which the acquisition rate is to be retrieved.

`"monthly"` | `"weekly"` | `"yearly"`

#### Returns

`Promise`\<`number`\>

A promise resolving to the acquisition rate.

***

### getPopulatedCarts()

> **getPopulatedCarts**(): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1799

Retrieves the current carts populated with items.

#### Returns

`Promise`\<`number`\>

A promise resolving to the total populated carts.

***

### getProductAddToCartRate()

> **getProductAddToCartRate**(`productId`): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1761

Retrieves the product "Add to Cart Rate".

#### Parameters

##### productId

`number`

#### Returns

`Promise`\<`number`\>

A promise resolving to the rate.

***

### getProductsByStockStatus()

> **getProductsByStockStatus**(`status`): `Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

Defined in: Analytics.service.ts:673

Retrieves all products by stock status.

#### Parameters

##### status

The stock status ('in' or 'out')

`"out"` | `"in"`

#### Returns

`Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

A promise resolving to an array of Product instances and their count

***

### getPurchasesPerCategory()

> **getPurchasesPerCategory**(`page`, `pageSize`, `sortBy`?, `sortOrder`?, `minPurchases`?, `minRevenue`?): `Promise`\<\{ `categories`: `PurchasedCategoryResponse`[]; `meta`: `PageMetaData`; \}\>

Defined in: Analytics.service.ts:1500

Retrieves the total purchases for each category.

#### Parameters

##### page

`number`

The current page number

##### pageSize

`number`

The number of items per page

##### sortBy?

`string` = `'purchaseCount'`

Sort by the specified column

##### sortOrder?

`string` = `'DESC'`

Sorting order

##### minPurchases?

`number` = `0`

The minimum number of purchases for a category

##### minRevenue?

`number` = `0.0`

The minimum revenue for a category

#### Returns

`Promise`\<\{ `categories`: `PurchasedCategoryResponse`[]; `meta`: `PageMetaData`; \}\>

A promise resolving to an array of PurchasedCategory objects

***

### getRepeatPurchaseRate()

> **getRepeatPurchaseRate**(): `Promise`\<`number`\>

Defined in: Analytics.service.ts:1749

Retrieves the repeat purchase rate.

#### Returns

`Promise`\<`number`\>

A promise resolving to the rate.

***

### getTopCustomers()

> **getTopCustomers**(`getBy`?, `sortBy`?, `page`?, `pageSize`?): `Promise`\<\{ `customers`: `TopCustomersResponse`[]; `meta`: `PageMetaData`; \}\>

Defined in: Analytics.service.ts:1001

Retrieves the top customers based on the ranking type.

#### Parameters

##### getBy?

Which format to retrieve the data by

`"order"` | `"purchase"`

##### sortBy?

`TopCustomerSortBy`

##### page?

`number`

##### pageSize?

`number`

#### Returns

`Promise`\<\{ `customers`: `TopCustomersResponse`[]; `meta`: `PageMetaData`; \}\>

A promise that resolves to an array

***

### getTotalOrderRecordsByCustomer()

> **getTotalOrderRecordsByCustomer**(`customerId`, `status`?, `interval`?): `Promise`\<\{ `orders`: `OrderResponse`[]; `totalCount`: `number`; `totalRevenue`: `number`; \}\>

Defined in: Analytics.service.ts:1260

Retrieves the total orders by customer.

#### Parameters

##### customerId

`number`

The ID of the customer

##### status?

`string` = `'all'`

The order status

##### interval?

`BaseInterval` = `'full'`

The interval to filter by

#### Returns

`Promise`\<\{ `orders`: `OrderResponse`[]; `totalCount`: `number`; `totalRevenue`: `number`; \}\>

A promise that resolves to the total orders count

***

### getTotalOrdersByCustomer()

> **getTotalOrdersByCustomer**(`customerId`): `Promise`\<\{ `totalCount`: `number`; `totalRevenue`: `number`; \}\>

Defined in: Analytics.service.ts:1241

Retrieves the total orders data by customer.

#### Parameters

##### customerId

`number`

The ID of the customer

#### Returns

`Promise`\<\{ `totalCount`: `number`; `totalRevenue`: `number`; \}\>

A promise that resolves to the total orders count

***

### getTotalProductPurchases()

> **getTotalProductPurchases**(`page`, `pageSize`, `interval`?, `sortBy`?, `sortOrder`?, `minPurchases`?, `minRevenue`?): `Promise`\<\{ `meta`: `PageMetaData`; `products`: `PurchasedProductResponse`[]; `purchasesCount`: `number`; \}\>

Defined in: Analytics.service.ts:749

Retrieves the total number of product purchases and each
purchased product in the platform.

#### Parameters

##### page

`number`

The current page number

##### pageSize

`number`

The number of items per page

##### interval?

`BaseInterval` = `'full'`

The interval to filter by

##### sortBy?

`string` = `'purchaseCount'`

Sort by the specified column

##### sortOrder?

`string` = `'DESC'`

Sorting order

##### minPurchases?

`number` = `0`

The minimum number of purchases for a product

##### minRevenue?

`number` = `0.0`

The minimum revenue for a product

#### Returns

`Promise`\<\{ `meta`: `PageMetaData`; `products`: `PurchasedProductResponse`[]; `purchasesCount`: `number`; \}\>

A promise that resolves to an object containing
the total purchase count and an array of unique purchased products

***

### getTotalProductPurchasesForCustomer()

> **getTotalProductPurchasesForCustomer**(`customerId`, `interval`?): `Promise`\<\{ `purchasedProducts`: `PurchasedProductResponse`[]; `totalCount`: `number`; `totalRevenue`: `number`; \}\>

Defined in: Analytics.service.ts:1313

Retrieves the total product purchases for customer.

#### Parameters

##### customerId

`number`

The ID of the customer

##### interval?

`BaseInterval` = `'full'`

The interval to filter by

#### Returns

`Promise`\<\{ `purchasedProducts`: `PurchasedProductResponse`[]; `totalCount`: `number`; `totalRevenue`: `number`; \}\>

A promise that resolves to an object containing
the total count, revenue and an array of products

***

### getTotalProductsRevenue()

> **getTotalProductsRevenue**(): `Promise`\<`number`\>

Defined in: Analytics.service.ts:900

Retrieves the total revenue of product sales.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total revenue of product sales.

***

### getTotalRevenue()

> **getTotalRevenue**(): `Promise`\<`number`\>

Defined in: Analytics.service.ts:910

Retrieves the total revenue of the platform including shipping costs.

#### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing
the total revenue
