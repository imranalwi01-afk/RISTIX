[**Backend API Reference v1.0.0**](../../../../README.md)

***

# Variable: menuItemsRelations

> `const` **menuItemsRelations**: `Relations`\<`"menu_items"`, \{ `category`: `One`\<`"menu_categories"`, `false`\>; `children`: `Many`\<`"menu_items"`\>; `parent`: `One`\<`"menu_items"`, `false`\>; `roleAccess`: `Many`\<`"role_menu_access"`\>; `userCustomization`: `Many`\<`"menu_user_customization"`\>; \}\>

Defined in: [packages/new-backend/src/db/schema/menu.schema.ts:231](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/db/schema/menu.schema.ts#L231)
