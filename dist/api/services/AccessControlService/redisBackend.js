/* eslint-disable */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = __importDefault(require("acl/lib/contract"));
const lodash_1 = __importDefault(require("lodash"));
const acl_sequelize_1 = __importDefault(require("acl-sequelize"));
const _Models_1 = require("@Models");
function noop() { }
function RedisBackend(redis, prefix) {
    this.redis = redis;
    this.prefix = prefix || 'acl';
    this.pg = new acl_sequelize_1.default(_Models_1.sequelize, {
        prefix: 'acl_',
        defaultSchema: {
            key: { type: _Models_1.Sequelize.STRING, primaryKey: true },
            value: { type: _Models_1.Sequelize.TEXT },
        },
        schema: {
            users: {
                key: { type: _Models_1.Sequelize.INTEGER, primaryKey: true },
                value: { type: _Models_1.Sequelize.TEXT },
            },
        },
    });
}
RedisBackend.prototype = {
    /**
       Begins a transaction
    */
    begin: function () {
        return [this.redis.multi(), this.pg.begin()];
    },
    /**
       Ends a transaction (and executes it)
    */
    end: function (transactions, cb) {
        return __awaiter(this, arguments, void 0, function* () {
            (0, contract_1.default)(arguments).params('array', 'function').end();
            const [redisTransaction, pgTransaction] = transactions;
            yield new Promise(resolve => this.pg.end(pgTransaction, resolve));
            yield redisTransaction.exec();
            cb();
        });
    },
    /**
      Cleans the whole storage.
    */
    clean: function (cb) {
        (0, contract_1.default)(arguments).params('function').end();
        const self = this;
        self.pg.clean();
        self.redis.keys(self.prefix + '*', function (err, keys) {
            if (keys.length) {
                self.redis.del(keys, function () {
                    cb();
                });
            }
            else {
                cb();
            }
        });
    },
    /**
       Gets the contents at the bucket's key.
    */
    get: function (bucket, key, cb) {
        return __awaiter(this, arguments, void 0, function* () {
            (0, contract_1.default)(arguments)
                .params('string', 'string|number', 'function')
                .end();
            const redisKey = this.bucketKey(bucket, key);
            try {
                let keys = yield this.redis.smembers(redisKey);
                if (keys.length === 0) {
                    keys = (yield (new Promise(resolve => this.pg.get(bucket, key, resolve)))) || [];
                    if (keys.length > 0) {
                        yield this.redis.sadd(redisKey, ...keys);
                    }
                }
                cb(null, keys);
            }
            catch (err) {
                cb(err);
            }
        });
    },
    /**
      Gets an object mapping each passed bucket to the union of the specified keys inside that bucket.
    */
    unions: function (buckets, keys, cb) {
        return __awaiter(this, arguments, void 0, function* () {
            (0, contract_1.default)(arguments)
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
            yield Promise.all(refresh);
            buckets.forEach(function (bucket) {
                redisKeys[bucket] = self.bucketKey(bucket, keys);
                batch.sunion(redisKeys[bucket], noop);
            });
            batch.exec(function (err, replies) {
                if (!Array.isArray(replies)) {
                    return {};
                }
                const result = {};
                replies.forEach(function (reply, index) {
                    if (reply instanceof Error) {
                        throw reply;
                    }
                    result[buckets[index]] = reply;
                });
                cb(err, result);
            });
        });
    },
    /**
          Returns the union of the values in the given keys.
      */
    union: function (bucket, keys, cb) {
        return __awaiter(this, arguments, void 0, function* () {
            (0, contract_1.default)(arguments)
                .params('string', 'array', 'function')
                .end();
            yield Promise.all(keys.map(key => new Promise(resolve => this.get(bucket, key, resolve))));
            keys = this.bucketKey(bucket, keys);
            this.redis.sunion(keys, cb);
        });
    },
    /**
          Adds values to a given key inside a bucket.
      */
    add: function (transactions, bucket, key, values) {
        return __awaiter(this, arguments, void 0, function* () {
            (0, contract_1.default)(arguments)
                .params('array', 'string', 'string|number', 'string|array|number')
                .end();
            const [redisTransaction, pgTransaction] = transactions;
            this.pg.add(pgTransaction, bucket, key, values);
            key = this.bucketKey(bucket, key);
            if (Array.isArray(values)) {
                values.forEach(function (value) {
                    redisTransaction.sadd(key, value);
                });
            }
            else {
                redisTransaction.sadd(key, values);
            }
        });
    },
    /**
       Delete the given key(s) at the bucket
    */
    del: function (transactions, bucket, keys) {
        (0, contract_1.default)(arguments)
            .params('array', 'string', 'string|array')
            .end();
        const self = this;
        const [redisTransaction, pgTransaction] = transactions;
        this.pg.del(pgTransaction, bucket, keys);
        keys = Array.isArray(keys) ? keys : [keys];
        keys = keys.map(function (key) {
            return self.bucketKey(bucket, key);
        });
        redisTransaction.del(keys);
    },
    /**
          Removes values from a given key inside a bucket.
      */
    remove: function (transactions, bucket, key, values) {
        (0, contract_1.default)(arguments)
            .params('array', 'string', 'string|number', 'string|array|number')
            .end();
        const [redisTransaction, pgTransaction] = transactions;
        this.pg.remove(pgTransaction, bucket, key, values);
        key = this.bucketKey(bucket, key);
        if (Array.isArray(values)) {
            values.forEach(function (value) {
                redisTransaction.srem(key, value);
            });
        }
        else {
            redisTransaction.srem(key, values);
        }
    },
    //
    // Private methods
    //
    bucketKey: function (bucket, keys) {
        const self = this;
        if (Array.isArray(keys)) {
            return keys.map(function (key) {
                return self.prefix + '_' + bucket + '@' + key;
            });
        }
        else {
            return self.prefix + '_' + bucket + '@' + keys;
        }
    },
};
exports.default = RedisBackend;

//# sourceMappingURL=redisBackend.js.map
