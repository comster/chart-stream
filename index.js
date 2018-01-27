'use strict'

var path = require('path')
var http = require('http')
var PassThrough = require('readable-stream').PassThrough
var pump = require('pump')
var ecstatic = require('ecstatic')
var SSE = require('sse-stream')

module.exports = function (cb) {
  var input = new PassThrough()
  var server = http.createServer(ecstatic({ root: path.join(__dirname, 'public') }))
  var sse = SSE('/data')
  var header

  sse.install(server)
console.log('init')
  sse.on('connection', function (client) {
      console.log('connection...')
      if(header) client.write(header);
      
      setTimeout(function(){
        pump(input, client);
        client.on('close', function(){
            console.log('client closed')
        })
      },5000)
    // input.once('data', function (chunk) {
    //     // console.log('input data')
    //   if (chunk !== header) client.write(header)
    //   client.write(chunk)
    //   pump(input, client)
    // })
  })

  server.listen(5000, '0.0.0.0', function () {
    sse.interval.unref()
    console.log('server listening')
    cb('http://localhost:' + server.address().port)
  })

  server.unref()

  input.once('data', function (chunk) {
    header = chunk
    console.log('got header ', header)
  })
console.log('inited')

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => { 
    console.error(err, 'Uncaught Exception thrown');
    // process.exit(1);
  });
  
  return input
}