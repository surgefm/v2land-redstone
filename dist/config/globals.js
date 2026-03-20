"use strict";
/**
 * THIS FILE WAS ADDED AUTOMATICALLY by the Sails 1.0 app migration tool.
 * The original file was backed up as `config/globals-old.js.txt`
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    site: process.env.SITE || 'https://langchao.org',
    api: process.env.API || 'https://api.langchao.org',
    notification: process.env.ENABLE_NOTIFICATION,
    officialAccount: {
        twitter: process.env.OFFICIAL_TWITTER || '768458621613072384',
        weibo: process.env.OFFICIAL_WEIBO || '6264484740',
    },
    telegramReviewChatId: process.env.TELEGRAM_REVIEW_ACCOUNT || '@langchao_review',
    telegramTestChatId: process.env.TELEGRAM_TEST_ACCOUNT || '@langchao_notification_test',
    inviteCode: process.env.INVITE_CODE || '渴望重回土地',
    environment: process.env.NODE_ENV || 'development',
    resourceLockTTL: 60 * 60 * 1, // in seconds
};

//# sourceMappingURL=globals.js.map
