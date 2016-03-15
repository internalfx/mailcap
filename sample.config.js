
// Copy/rename this file to config.js

module.exports = {
  port: 2525,
  address: '',
  table: 'email',
  rethinkdb: {
    host: 'localhost',
    db: 'test'
  },
  regrid: {
    bucketName: 'email'
  }
}
