import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { SES } from '@aws-sdk/client-ses';
import hbs from 'nodemailer-express-handlebars';

let email: { transporter: nodemailer.Transporter } = { transporter: null };

const {
  SES_HOST,
  SES_USER,
  SES_PASS,
  SES_RATE,
  SES_REGION,
} = process.env;

if (SES_USER && SES_PASS) {
  const transporter = nodemailer.createTransport({
    SES: new SES({
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
  } as unknown as nodemailer.Transport);

  transporter.use('compile', hbs({
    viewEngine: {
      helpers: {
        plusOne: (index: number) => index + 1,
        if: function(conditional: any, options: any) {
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

export default email;
