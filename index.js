#!/usr/bin/env node
const yeoman = require('yeoman-environment');
const env = yeoman.createEnv();
const babelInit = require('./init');

env.registerStub(babelInit, 'babel:init');
env.run('babel:init', () => console.log('done'));
