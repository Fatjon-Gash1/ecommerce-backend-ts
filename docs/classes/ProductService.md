[**server**](../README.md)

***

[server](../globals.md) / ProductService

# Class: ProductService

Defined in: [Product.service.ts:64](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L64)

Service responsible for product-related operations.

## Constructors

### new ProductService()

> **new ProductService**(`notificationService`?): [`ProductService`](ProductService.md)

Defined in: [Product.service.ts:67](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L67)

#### Parameters

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`ProductService`](ProductService.md)

## Methods

### addCategory()

> **addCategory**(`name`, `description`, `parentId`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:82](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L82)

Creates a new category in the database.

#### Parameters

##### name

`string`

The name of the category

##### description

`string`

The description of the category

##### parentId

The id of the parent category

`null` | `number`

#### Returns

`Promise`\<`CategoryResponse`\>

A promise resolving to the created category

#### Throws

CategoryAlreadyExistsError
Thrown if the category already exists.

***

### addProductByCategoryId()

> **addProductByCategoryId**(`username`, `categoryId`, `details`, `promote`?): `Promise`\<`ProductResponse`\>

Defined in: [Product.service.ts:113](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L113)

Creates a new product in a given category.

#### Parameters

##### username

`string`

##### categoryId

`number`

The id of the category

##### details

`ProductDetails`

The product creation details

##### promote?

`boolean`

#### Returns

`Promise`\<`ProductResponse`\>

A promise that resolves to the created product

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

#### Throws

ProductAlreadyExistsError
Thrown if the product already exists or if the
product image is already in use.

***

### deleteCategoryById()

> **deleteCategoryById**(`categoryId`): `Promise`\<`void`\>

Defined in: [Product.service.ts:530](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L530)

Deletes a category by id.

#### Parameters

##### categoryId

`number`

The id of the category

#### Returns

`Promise`\<`void`\>

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

***

### deleteProductById()

> **deleteProductById**(`productId`): `Promise`\<`void`\>

Defined in: [Product.service.ts:558](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L558)

Deletes a product by id.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`void`\>

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:243](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L243)

Retrieves all categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of Category instances

***

### getAllProducts()

> **getAllProducts**(): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: [Product.service.ts:279](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L279)

Retrieves all products in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getAllTopLevelCategories()

> **getAllTopLevelCategories**(): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:227](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L227)

Retrieves all top level categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of top level Category instances

***

### getDiscountedPrice()

> **getDiscountedPrice**(`productId`): `Promise`\<`number`\>

Defined in: [Product.service.ts:411](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L411)

Retrieves the product's discounted price.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`number`\>

A promise resolving to the discounted price

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### getProductById()

> **getProductById**(`productId`): `Promise`\<`Product`\>

Defined in: [Product.service.ts:316](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L316)

Retrieves a product by ID for admins only.

#### Parameters

##### productId

`number`

The ID of the product

#### Returns

`Promise`\<`Product`\>

a promise resolving to a Product instance

***

### getProductCategory()

> **getProductCategory**(`productId`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:358](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L358)

Retrieves the category of a product.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`CategoryResponse`\>

A promise resolving to a Category instance

#### Throws

ProductNotFoundError
Thrown if the product is not found.

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

***

### getProductsByCategory()

> **getProductsByCategory**(`categoryId`): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: [Product.service.ts:294](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L294)

Retrieves all products of a certain category.

#### Parameters

##### categoryId

`number`

The ID of the category

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getProductsByStockStatus()

> **getProductsByStockStatus**(`status`): `Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

Defined in: [Product.service.ts:384](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L384)

Retrieves all products by stock status.

#### Parameters

##### status

`string`

The stock status ('inStock' or 'outOfStock')

#### Returns

`Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

A promise resolving to an array of Product instances

***

### getSubCategoriesForCategory()

> **getSubCategoriesForCategory**(`categoryId`): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:258](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L258)

Retrieves all subCategories for a category.

#### Parameters

##### categoryId

`number`

The ID of the category

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an object containing the count and rows

***

### searchProducts()

> **searchProducts**(`query`): `Promise`\<`ProductObject`[]\>

Defined in: [Product.service.ts:574](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L574)

Searches for products based on a query.

#### Parameters

##### query

`string`

The search query

#### Returns

`Promise`\<`ProductObject`[]\>

A promise resolving to an array of matched products

***

### setDiscountForProduct()

> **setDiscountForProduct**(`username`, `productId`, `discount`, `promote`?): `Promise`\<`number`\>

Defined in: [Product.service.ts:466](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L466)

Sets the discount for a product.

#### Parameters

##### username

`string`

The admin username

##### productId

`number`

The id of the product

##### discount

`number`

The discount to set

##### promote?

`boolean`

A boolean indicating whether to promote the product

#### Returns

`Promise`\<`number`\>

A promise resolving to the discount and the new price

***

### updateCategoryById()

> **updateCategoryById**(`categoryId`, `name`, `description`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:439](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L439)

Updates an existing category

#### Parameters

##### categoryId

`number`

The id of the category to update

##### name

`string`

The new name of the category

##### description

`string`

The new description of the category

#### Returns

`Promise`\<`CategoryResponse`\>

A promise that resolves to the updated category

#### Throws

CategoryNotFoundError
Thrown if the category doesn't exist

***

### updateProductById()

> **updateProductById**(`productId`, `details`): `Promise`\<`ProductResponse`\>

Defined in: [Product.service.ts:505](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L505)

Updates an existing product in the database.

#### Parameters

##### productId

`number`

The id of the product to update

##### details

`ProductDetails`

The product update details

#### Returns

`Promise`\<`ProductResponse`\>

A promise resolving to the updated product

#### Throws

ProductNotFoundError
Thrown if the product doesn't exist.

***

### viewProductById()

> **viewProductById**(`productId`): `Promise`\<`Product`\>

Defined in: [Product.service.ts:335](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Product.service.ts#L335)

Retrieves a product by ID for customers only.

#### Parameters

##### productId

`number`

The ID of the product

#### Returns

`Promise`\<`Product`\>

a promise resolving to a Product instance

#### Throws

ProductNotFoundError
Thrown if the product is not found
