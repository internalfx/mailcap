'use strict'

module.exports = function (argv) {
  try {
    var config = require(`${process.cwd()}/config.js`)
  } catch (err) {
    console.log('config.js missing! Please run "mailcap bootstrap"')
    process.exit()
  }
  var ReGrid = require('rethinkdb-regrid')
  var bucket = ReGrid(config.rethinkdb, config.regrid)
  var SMTPServer = require('smtp-server').SMTPServer
  var MailParser = require('mailparser').MailParser
  var co = require('co')
  var streamPromise = require('./mcUtil').streamPromise
  var _ = require('lodash')
  var r = require('rethinkdbdash')(config.rethinkdb)

  var onAuth = function (auth, session, cb) {
    return cb()
  }

  var onMailFrom = function (address, session, cb) {
    return cb()
  }

  var onRcptTo = function (address, session, cb) {
    if (address.address === config.address) {
      return cb()
    }

    return cb(new Error('DENIED'))
  }

  var onData = function (stream, session, cb) {
    let mailparser = new MailParser()

    stream.pipe(mailparser)

    mailparser.on('end', function (mail) {
      co(function *() {
        mail.attachments = mail.attachments || []
        let attachments = mail.attachments.map(function (attachment) {
          return _.omit(attachment, 'content')
        })
        let obj = {
          html: mail.html,
          text: mail.text,
          headers: mail.headers,
          subject: mail.subject,
          messageId: mail.messageId,
          createdAt: mail.date,

          from: _.compact(_.map(mail.from, (i) => _.isString(i.address) ? i.address.toLowerCase() : null)),
          to: _.compact(_.map(mail.to, (i) => _.isString(i.address) ? i.address.toLowerCase() : null)),
          cc: _.compact(_.map(mail.cc, (i) => _.isString(i.address) ? i.address.toLowerCase() : null)),

          attachments: attachments,
          addresses: _.uniq(obj.from.concat(obj.to, obj.cc))
        }

        let results = yield r.table(config.table).insert(obj, {returnChanges: true}).run()
        let email = results.changes[0].new_val
        let queue = []

        for (let attachment of mail.attachments) {
          let wstream = bucket.upload(`${email.id}/${attachment.fileName}`)
          queue.push(streamPromise(wstream))
          wstream.write(attachment.content)
          wstream.end()
        }

        yield Promise.all(queue)

        console.log('Received Mail:', email.addresses)
      }).catch(function (err) {
        console.log(err.stack)
      }).finally(function () {
        cb()
      })
    })
  }

  co(function *() {
    yield bucket.initBucket()

    var server = new SMTPServer({
      secure: false,
      hideSTARTTLS: true,
      name: 'MAIL CAPTURE SERVER',
      disabledCommands: ['AUTH'],
      onAuth: onAuth,
      onMailFrom: onMailFrom,
      onRcptTo: onRcptTo,
      onData: onData,
      logger: false
    })

    server.listen(config.port)

    console.log('Server Started...')
  })
}
