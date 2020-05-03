declare module 'nodemailer-express-handlebars' {
  import MailMessage from 'nodemailer/lib/mailer/mail-message';

  interface NodeMailerHandleBarInput {
    viewEngine: {
      layoutsDir: string;
      partialsDir: string;
      helpers: { [index: string]: Function };
    };
    viewPath: string;
  }
  function init(input: NodeMailerHandleBarInput): ((mail: MailMessage, callback: (err?: Error | null) => void) => void)
  export default init;
}
