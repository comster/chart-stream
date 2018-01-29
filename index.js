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
  
  var clients = []
  
  input.on('data', function(data){
      for(var c in clients) {
          clients[c].write(data);
      }
  })

  sse.install(server)

    console.log('init chart-stream')
    
    /// TODO MANUALLY MANAGE CONENCTED CLIENTS AND SEND THEM INPUT > FANOUT
    
  sse.on('connection', function (client) {
      console.log('client connection...')
      var cx = clients.push(client) - 1
      if(header) client.write(header);
      
      client.on('close', function(){
        console.log('client closed. remove from clients list len: '+clients.length)
        clients.splice(cx, 1);
        console.log('client closed. removed from clients list len: '+clients.length)
    })
    
      
    //   setTimeout(function(){
    //       console.log('client connection pump starting..')
    //     pump(input, client);
    //     client.on('close', function(){
    //         console.log('client closed')
    //     })
    //   },5000)
    
    // input.once('data', function (chunk) {
    //     // console.log('input data')
    //   if (chunk !== header) client.write(header)
    //   client.write(chunk)
    //   pump(input, client)
    // })
  })

  server.listen(5000, '0.0.0.0', function () {
    // sse.interval.unref()
    console.log('server listening address')
    console.log(server.address())
    cb('http://'+server.address().address+':' + server.address().port)
  })

//   server.unref()

  input.once('data', function (chunk) {
    header = chunk
    console.log('got header ', header.toString())
  })
  // DEBUGGING
input.on('data', function (dataChunk) {
    console.log('got data ', dataChunk.toString())
})
console.log('inited chart-stream.')

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