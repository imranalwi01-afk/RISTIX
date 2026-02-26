[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: sendEmailNotification

> `const` **sendEmailNotification**: `Effect`\<(`job`, `toEmail`, `templateContext`) => `Promise`\<`string`\>, `never`, `never`\>

Defined in: [src/services/notification.service.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/notification.service.ts#L164)

Send email notification (called from Bull job handler)
