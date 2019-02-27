const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const aws = require('aws-sdk');
const path = require('path');

const email = {};

const {
  SES_HOST,
  SES_USER,
  SES_PASS,
  SES_RATE,
  SES_REGION,
} = process.env;

if (SES_USER && SES_PASS) {
  const transporter = nodemailer.createTransport({
    SES: new aws.SES({
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

  transporter.use('compile', hbs({
    viewEngine: {
      helpers: {
        plusOne: (index) => index + 1,
        if: function(conditional, options) {
          if (conditional) {
            return options.fn(this);
          }
        },
      },
    },
    viewPath: path.resolve(__dirname, '../assets/templates'),
  }));

  email.transporter = transporter;
}

module.exports.email = email;