import { TelegramService } from '@Services';

if (process.env.TELE_TOKEN) {
  describe.skip('TelegramService', () => {
    it('should send a message', async function() {
      this.timeout(30000);
      await TelegramService.sendText(`Unit test: ${ new Date() }`);
    });
  });
}
