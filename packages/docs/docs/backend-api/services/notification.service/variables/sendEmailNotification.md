[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: sendEmailNotification

> `const` **sendEmailNotification**: `Effect`\<(`job`, `toEmail`, `templateContext`) => `Promise`\<`string`\>, `never`, `never`\>

Defined in: [src/services/notification.service.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/notification.service.ts#L164)

Send email notification (called from Bull job handler)
