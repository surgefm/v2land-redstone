/* eslint-disable */
'use strict';

import contract from 'acl/lib/contract';
import _ from 'lodash';
import AclSeq from 'acl-sequelize';

import { sequelize, Sequelize } from '@Models';

function noop() {}

function RedisBackend(redis, prefix) {
  this.redis = redis;
  this.prefix = prefix || 'acl';
  this.pg = new AclSeq(sequelize, {
    prefix: 'acl_',
    defaultSchema: {
      key: { type: Sequelize.STRING, primaryKey: true },
      value: { type: Sequelize.TEXT },
    },
    schema: {
      users: {
        key: { type: Sequelize.INTEGER, primaryKey: true },
        value: { type: Sequelize.TEXT },
      },
    },
  });
}

RedisBackend.prototype = {
  /**
     Begins a transaction
  */
  begin: function() {
    return [this.redis.multi(), this.pg.begin()];
  },

  /**
     Ends a transaction (and executes it)
  */
  end: async function(transactions, cb) {
    contract(arguments).params('array', 'function').end();
    const [redisTransaction, pgTransaction] = transactions;
    await new Promise(resolve => this.pg.end(pgTransaction, resolve));
    await redisTransaction.exec();
    cb();
  },

  /**
    Cleans the whole storage.
  */
  clean: function(cb) {
    contract(arguments).params('function').end();
    const self = this;
    self.pg.clean();
    self.redis.keys(self.prefix+'*', function(err, keys) {
      if (keys.length) {
        self.redis.del(keys, function() {
          cb();
        });
      } else {
        cb();
      }
    });
  },

  /**
     Gets the contents at the bucket's key.
  */
  get: async function(bucket, key, cb) {
    contract(arguments)
	      .params('string', 'string|number', 'function')
	      .end();

    const redisKey = this.bucketKey(bucket, key);

    try {
      let keys = await this.redis.smembers(redisKey);
      if (keys.length === 0) {
        keys = (await (new Promise(resolve => this.pg.get(bucket, key, resolve)))) || [];
        if (keys.length > 0) {
          await this.redis.sadd(redisKey, ...keys)
        }
      }
      cb(null, keys);
    } catch (err) {
      cb(err);
    }
  },

  /**
    Gets an object mapping each passed bucket to the union of the specified keys inside that bucket.
  */
  unions: async function(buckets, keys, cb) {
    contract(arguments)
      .params('array', 'array', 'function')
      .end();

    const redisKeys = {};
    const batch = this.redis.batch();
    const self = this;

    const refresh = [];
    for (let i = 0; i < buckets.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        refresh.add(new Promise(this.get(buckets[i], keys[j])));
      }
    }
    await Promise.all(refresh);

    buckets.forEach(function(bucket) {
      redisKeys[bucket] = self.bucketKey(bucket, keys);
      batch.sunion(redisKeys[bucket], noop);
    });

    batch.exec(function(err, replies) {
      if (!Array.isArray(replies)) {
        return {};
      }

      const result = {};
      replies.forEach(function(reply, index) {
        if (reply instanceof Error) {
          throw reply;
        }

        result[buckets[index]] = reply;
      });
      cb(err, result);
    });
  },

  /**
		Returns the union of the values in the given keys.
	*/
  union: async function(bucket, keys, cb) {
    contract(arguments)
	      .params('string', 'array', 'function')
	      .end();

    await Promise.all(keys.map(key => new Promise(resolve => this.get(bucket, key, resolve))));
    keys = this.bucketKey(bucket, keys);
    this.redis.sunion(keys, cb);
  },

  /**
		Adds values to a given key inside a bucket.
	*/
  add: async function(transactions, bucket, key, values) {
    contract(arguments)
	      .params('array', 'string', 'string|number', 'string|array|number')
      .end();

    const [redisTransaction, pgTransaction] = transactions;
    this.pg.add(pgTransaction, bucket, key, values);
    key = this.bucketKey(bucket, key);

    if (Array.isArray(values)) {
      values.forEach(function(value) {
        redisTransaction.sadd(key, value);
      });
    } else {
      redisTransaction.sadd(key, values);
    }
  },

  /**
     Delete the given key(s) at the bucket
  */
  del: function(transactions, bucket, keys) {
    contract(arguments)
	      .params('array', 'string', 'string|array')
	      .end();

    const self = this;
    const [redisTransaction, pgTransaction] = transactions;
    this.pg.del(pgTransaction, bucket, keys);

    keys = Array.isArray(keys) ? keys : [keys];

    keys = keys.map(function(key) {
      return self.bucketKey(bucket, key);
    });

    redisTransaction.del(keys);
  },

  /**
		Removes values from a given key inside a bucket.
	*/
  remove: function(transactions, bucket, key, values) {
    contract(arguments)
	      .params('array', 'string', 'string|number', 'string|array|number')
      .end();

    const [redisTransaction, pgTransaction] = transactions;
    this.pg.remove(pgTransaction, bucket, key, values);
    key = this.bucketKey(bucket, key);

    if (Array.isArray(values)) {
      values.forEach(function(value) {
        redisTransaction.srem(key, value);
      });
    } else {
      redisTransaction.srem(key, values);
    }
  },

  //
  // Private methods
  //
  bucketKey: function(bucket, keys) {
    const self = this;
    if (Array.isArray(keys)) {
      return keys.map(function(key) {
        return self.prefix+'_'+bucket+'@'+key;
      });
    } else {
      return self.prefix+'_'+bucket+'@'+keys;
    }
  },
};

export default RedisBackend;
