# mailcap

[![npm version](https://img.shields.io/npm/v/mailcap.svg)](https://www.npmjs.com/package/mailcap) [![license](https://img.shields.io/npm/l/mailcap.svg)](https://github.com/internalfx/mailcap/blob/master/LICENSE)

A mail capture and archival server for RethinkDB.

Mailcap makes it easy to store emails in a RethinkDB database.

- Mailcap is an SMTP server so it can receive mail from any MTA.
- Emails are parsed into a JSON format that is easy to search.
- File attachments are saved efficiently using [ReGrid](https://github.com/internalfx/regrid)

## Getting Started

###### Install Mailcap

```
npm install -g mailcap
```

###### Create config.js

```
mailcap bootstrap
```

###### Edit config.js

```javascript
module.exports = {
  port: 2525, // Port server listens on
  address: '', // Email address mail will be sent to
  table: 'email', // RethinkDB table to store mail in
  rethinkdb: {
    host: 'localhost', // RethinkDB host address
    db: 'test' // RethinkDB database name
  },
  regrid: {
    bucketName: 'email' // ReGrid bucket name
  }
}
```

###### Start mailcap Server

```
mailcap start
```
