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

###### Start the server

```
mailcap start
```

## Storage format

Mailcap stores all email in the configured table. File attachments are stored separately in [ReGrid](https://github.com/internalfx/regrid).

###### Email Format Example

```javascript
{
  addresses: [
    "fromAddress@example.com",
    "toAddress@example.com"
  ],
  attachments: [
    {
      "contentType": "image/jpeg",
      "fileName": "swirly-ubuntu-wallpaper.jpg",
      "length": 331469
    }
  ],
  cc: [ ],
  createdAt: "Wed Mar 16 2016 03:28:55 GMT+00:00",
  from: [
    "fromAddress@example.com"
  ],
  headers: {
    content-type: 'multipart/mixed; boundary="----=_Part_87467_1755068617.1458098935181"',
    date: "Wed, 16 Mar 2016 03:28:55 +0000 (UTC)",
    from: "fromAddress <fromAddress@example.com>",
    message-id: "<219358855.87471.1458098935216.JavaMail.asdfasdf@example.com>",
    mime-version: "1.0",
    received: [
      "from localhost (localhost.localdomain [127.0.0.1]) by mail.example.com (Postfix) with ESMTP id ECC231C2B43 for <test@test.example.com>; Wed, 16 Mar 2016 03:29:00 +0000 (UTC)",
      "from mail.example.com ([127.0.0.1]) by localhost (mail.example.com [127.0.0.1]) (amavisd-new, port 10032) with ESMTP id FM4FhPl1ZqLS for <test@test.example.com>; Wed, 16 Mar 2016 03:28:58 +0000 (UTC)",
      "from localhost (localhost.localdomain [127.0.0.1]) by mail.example.com (Postfix) with ESMTP id 86B501C2B42 for <test@test.example.com>; Wed, 16 Mar 2016 03:28:57 +0000 (UTC)",
      "from mail.example.com ([127.0.0.1]) by localhost (mail.example.com [127.0.0.1]) (amavisd-new, port 10026) with ESMTP id 3PFEkD1lm_1C for <test@test.example.com>; Wed, 16 Mar 2016 03:28:56 +0000 (UTC)",
      "from mail.example.com (mail.example.com [xxx.xxx.xxx.xxx]) by mail.example.com (Postfix) with ESMTP id A9E291C2B43 for <test@test.example.com>; Wed, 16 Mar 2016 03:28:55 +0000 (UTC)"
    ],
    subject: "This is a test email",
    thread-index: "rX2hWYSOPicdVe5+pGD2LDwrQ2D/AA==",
    thread-topic: "This is a test email",
    to: "toAddress <toAddress@example.com>",
    x-mailer: "Zimbra 8.6.0_GA_1191 (ZimbraWebClient - FF45 (Linux)/8.6.0_GA_1191)",
    x-originating-ip: "[xxx.xxx.xxx.xxx]",
    x-virus-scanned: "amavisd-new at mail.internalfx.com"
  },
  html: `<html><body>
  <p>Hello,</p>
  <p>Mailcap makes it easy to store emails in a RethinkDB database.</p>
  <p>Thanks</p>
  </body></html>`,
  id: "d9e31972-6eee-46bd-b63f-acee4b2cd462",
  messageId: "219358855.87471.1458098935216.JavaMail.asdfasdf@example.com",
  subject: "This is a test email",
  text: `Hello,

  Mailcap makes it easy to store emails in a RethinkDB database.

  Thanks
  `,
  to: [
    "toAddress@example.com"
  ]
}
```

## How to retrieve file attachments

File attachments are stored with a path (called a filename in [ReGrid](https://github.com/internalfx/regrid)) of the `id` of the email and the attachments filename. Per the above email example, the file would be stored at `d9e31972-6eee-46bd-b63f-acee4b2cd462/swirly-ubuntu-wallpaper.jpg`.

The above file could be retrieved with the following code.

```javascript
var fileName = 'd9e31972-6eee-46bd-b63f-acee4b2cd462/swirly-ubuntu-wallpaper.jpg'
var ReGrid = require('rethinkdb-regrid')

var bucket = ReGrid({db: 'example'})

// initBucket creates tables and indexes if they don't exist, returns a promise.
bucket.initBucket().then(function () {
  // We are now ready to read and write files

  var rstream = bucket.downloadFilename(fileName)
  rstream.pipe(fs.createWriteStream('./swirly-ubuntu-wallpaper.jpg'))

})
```
