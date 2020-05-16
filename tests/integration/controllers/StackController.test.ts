import request from 'supertest';
import urlencode from 'urlencode';
import assert from 'assert';
import { Client, Event, sequelize } from '@Models';
import app from '~/app';
import { AccessControlService } from '@Services';

let agent: request.SuperTest<request.Test>;

const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = '计量经济学家的AI';

describe('StackController', function() {
  const stacks: ({ id: number })[] = [];
  describe('createEvent', function() {
    before(async function() {
      agent = request.agent(app);

      await sequelize.query(`DELETE FROM commit`);
      await sequelize.query(`DELETE FROM stack`);
      await sequelize.query(`DELETE FROM event`);
      await sequelize.query(`DELETE FROM client`);

      const client = await Client.create({
        username: testUsername,
        password: '$2b$10$8njIkPFgDouZsKXYrkYF4.xqShsOPMK9WHEU7aou4FAeuvzb4WRmi',
        email: testEmail,
        role: 'admin',
      });

      await AccessControlService.addUserRoles(client.id, 'editors');

      await agent
        .post('/client/login')
        .send({
          username: testUsername,
          password: '666',
        });

      const event = await Event.create({
        name: '小熊维尼',
        description: '吃蜂蜜',
        status: 'admitted',
      });
      await AccessControlService.setClientEventOwner(client.id, event.id);
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

    it('should update stack successfully', async function() {
      for (const stack of stacks) {
        const res = await agent
          .post(`/event/${urlencode('小熊维尼')}/news`)
          .send({
            url: `https://langchao.org/${Date.now()}`,
            source: 'source',
            title: '浪潮今天不上线',
            abstract: '浪潮今天不上线',
            time: new Date(),
            stackId: stack.id,
          });

        await agent
          .put(`/news/${res.body.news.id}`)
          .send({
            status: 'admitted',
          });

        await agent
          .put(`/stack/${stack.id}`)
          .send({
            status: 'admitted',
            order: 1,
          })
          .expect(201);
      }
    });

    it('should get stacks successfully', async function() {
      const { body } = await agent
        .get(`/event/${urlencode('小熊维尼')}`)
        .expect(200);

      const { stacks } = body;
      assert.equal(stacks.length, 2);
    });
  });
});

