
module.exports = {

  streamPromise: function (stream) {
    return new Promise(function (resolve, reject) {
      stream.on('end', resolve)
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

}
