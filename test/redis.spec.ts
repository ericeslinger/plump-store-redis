import { RedisStore } from '../dist/redis';
import { testSuite } from './storageTests';
import { TestType } from './testType';
import * as Redis from 'fakeredis';
// import * as Redis from 'redis';

import 'mocha';
import * as chai from 'chai';
const expect = chai.expect;

testSuite(
  {
    describe,
    it,
    before,
    after,
  },
  {
    ctor: RedisStore,
    opts: {
      redisClient: Redis.createClient(),
      terminal: true,
    },
    name: 'Plump Redis Store',
  },
);

describe('Redis-specific functionality', () => {
  it('should pre-allocate id values based on the store contents', () => {
    const testClient = Redis.createClient();
    const testStore = new RedisStore({
      redisClient: testClient,
      terminal: true,
    });
    return new Promise((resolve, reject) => {
      testClient.set(
        testStore.keyString({ type: TestType.type, id: 1 }),
        'foo',
        (err, reply) => (err ? reject(err) : resolve(reply)),
      );
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          testClient.set(
            testStore.keyString({ type: TestType.type, id: 7 }),
            'foo',
            (err, reply) => (err ? reject(err) : resolve(reply)),
          );
        });
      })
      .then(() => testStore.addSchema(TestType))
      .then(() => testStore.allocateId(TestType.type))
      .then(n => expect(n).to.equal(8))
      .then(() => testStore.allocateId(TestType.type))
      .then(n => expect(n).to.equal(9));
  });
});
