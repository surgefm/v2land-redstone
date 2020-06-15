/* eslint-disable no-invalid-this */
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Client, Event, sequelize } from '@Models';
import { AccessControlService } from '@Services';
import app from '~/app';

let agent: request.SuperTest<request.Test>;

const testEmail = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : 'vincent@langchao.org';
const testUsername = 'AlanAI';

const testEventName = '陈博女装';

describe('NewsController', function() {
  before(async function() {
    agent = request.agent(app);

    await sequelize.query(`DELETE FROM commit`);
    await sequelize.query(`DELETE FROM news`);
    await sequelize.query(`DELETE FROM event`);
    await sequelize.query(`DELETE FROM client`);

    await Event.create({
      name: testEventName,
      description: '浪潮今天上线',
      status: 'admitted',
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('testPassword', salt);

    const client = await Client.create({
      username: testUsername,
      nickname: testUsername,
      password: hash,
      email: testEmail,
      role: 'manager',
    }, {
      raw: true,
    });

    await AccessControlService.addUserRoles(client.id, 'admins');

    await agent
      .post('/client/login')
      .send({
        username: testUsername,
        password: 'testPassword',
      });
  });

  it('should return 404', async function() {
    this.timeout(50000);
    await agent
      .post(`/event/${-1}/news`)
      .send({
        url: 'https://langchao.org',
        source: 'source',
        title: '浪潮今天不上线',
        abstract: '浪潮今天不上线',
        time: new Date(),
      })
      .expect(404);
  });
});
