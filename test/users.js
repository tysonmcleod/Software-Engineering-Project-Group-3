const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../app');
const {User} = require('./../models/user');
const {users,  addDummyUsers} = require('./seed/seed')



beforeEach(addDummyUsers);
