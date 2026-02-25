"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const path = __importStar(require("path"));
const client_ses_1 = require("@aws-sdk/client-ses");
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
let email = { transporter: null };
const { SES_HOST, SES_USER, SES_PASS, SES_RATE, SES_REGION, } = process.env;
if (SES_USER && SES_PASS) {
    const transporter = nodemailer.createTransport({
        SES: new client_ses_1.SES({
            // The key apiVersion is no longer supported in v3, and can be removed.
            // @deprecated The client uses the "latest" apiVersion.
            apiVersion: '2010-12-01',
            region: SES_REGION || 'us-east-1',
        }),
        sendingRate: SES_RATE || 14,
        host: SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
        auth: {
            user: SES_USER,
            pass: SES_PASS,
        },
    });
    transporter.use('compile', (0, nodemailer_express_handlebars_1.default)({
        viewEngine: {
            helpers: {
                plusOne: (index) => index + 1,
                if: function (conditional, options) {
                    if (conditional) {
                        return options.fn(this);
                    }
                },
            },
            layoutsDir: path.resolve(__dirname, '../assets/templates'),
            partialsDir: path.resolve(__dirname, '../assets/templates'),
        },
        viewPath: path.resolve(__dirname, '../assets/templates'),
    }));
    email = { transporter };
}
exports.default = email;

//# sourceMappingURL=email.js.map
