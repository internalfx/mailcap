'use strict'

var co = require('co')
var inquirer = require('inquirer')
var fs = Promise.promisifyAll(require('fs'))
var streamPromise = require('./mcUtil').streamPromise
var path = require('path')

var prompt = function (question) {
  question = Object.assign({name: 'default'}, question)
  return new Promise(function (resolve) {
    inquirer.prompt([question], function (answer) {
      resolve(answer[question.name])
    })
  })
}

module.exports = function (argv) {
  return co(function *() {
    var exists = false
    var writeFile = true
    try {
      yield fs.statAsync(path.join(process.cwd(), 'config.js'))
      exists = true
    } catch (err) {
      // swallow error
      err
    }

    if (exists) {
      writeFile = yield prompt({
        type: 'confirm',
        message: 'config.js already exists in current directory! overwrite?',
        default: false
      })
    }

    if (writeFile) {
      let wstream = fs.createWriteStream(path.join(process.cwd(), 'config.js'))
      let rstream = fs.createReadStream(path.join(__dirname, '..', 'sample.config.js'))
      let promise = streamPromise(wstream)
      rstream.pipe(wstream)
      yield promise
      console.log('config.js created in current directory...')
    }
  })
}
