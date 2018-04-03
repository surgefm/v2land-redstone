
// 默认不跑这个测试
describe.skip('TelegramService', function() {
  it('should send a message', async function() {
    this.timeout(30000);
    await TelegramService.sendText('Hello World');
  });
});
