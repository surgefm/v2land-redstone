
const testEmail = process.env.TEST_EMAIL?
  process.env.TEST_EMAIL : 'vincent@langchao.co';

describe('ClientModel', function() {
  describe('#find()', function() {
    it('should check find function', async function() {
      await Client.find();
    });
  });

  describe('#create()', function() {
    before(async function() {
      await Client.destroy();
    });


    it('should create and destroy client', async function() {
      await Client.create({
        username: 'test',
        password: 'test6666666',
        email: testEmail,
      });
    });
  });
});
