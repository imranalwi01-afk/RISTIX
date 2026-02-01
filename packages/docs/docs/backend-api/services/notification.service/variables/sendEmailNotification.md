[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: sendEmailNotification

> `const` **sendEmailNotification**: `Effect`\<(`job`, `toEmail`, `templateContext`) => `Promise`\<`string`\>, `never`, `never`\>

Defined in: [packages/new-backend/src/services/notification.service.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/notification.service.ts#L164)

Send email notification (called from Bull job handler)
