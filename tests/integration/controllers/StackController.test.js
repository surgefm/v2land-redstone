const request = require('supertest');
const urlencode = require('urlencode');
const SeqModels = require('../../../seqModels');
const assert = require('assert');

const testEmail = process.env.TEST_EMAIL?
      process.env.TEST_EMAIL : 'vincent@langchao.co';
const testUsername = '计量经济学家的AI';

describe('StackController', function() {
  let agent;
  const stacks = [];
  describe('createEvent', function() {
    before(async function() {
      agent = request.agent(sails.hooks.http.app);

      await global.sequelize.query(`DELETE FROM stack`);
      await global.sequelize.query(`DELETE FROM event`);
      await global.sequelize.query(`DELETE FROM client`);

      await SeqModels.Client.create({
        username: testUsername,
        password: '$2b$10$8njIkPFgDouZsKXYrkYF4.xqShsOPMK9WHEU7aou4FAeuvzb4WRmi',
        email: testEmail,
        role: 'admin',
      });

      await agent
        .post('/client/login')
        .send({
          username: testUsername,
          password: '666',
        });

      await SeqModels.Event.create({
        name: '小熊维尼',
        description: '吃蜂蜜',
        status: 'admitted',
      });
    });

    it('should create stack successfully', async function() {
      const resp1 = await agent
        .post(`/event/${urlencode('小熊维尼')}/stack`)
        .send({
          title: '111',
          description: '111',
          order: -1,
          tiem: new Date(),
        })
        .expect(201);

      stacks.push(resp1.body.stack);

      const resp2 = await agent
        .post(`/event/${urlencode('小熊维尼')}/stack`)
        .send({
          title: '222',
          description: '222',
          order: -1,
          tiem: new Date(),
        })
        .expect(201);

      stacks.push(resp2.body.stack);
    });

    it.skip('should update stack successfully', async function() {
      for (const stack of stacks) {
        const { body } = await agent
          .put(`/stack/${stack.id}`)
          .send({
            status: 'admitted',
          })
          .expect(200);

        console.log(body);
      }
    });

    it.skip('should get stacks successfully', async function() {
      const { body } = await agent
            .get(`/event/${urlencode('小熊维尼')}`)
            .expect(200);

      const { stack } = body;
      assert.equal(stack.length, 2);
    });
  });
});

