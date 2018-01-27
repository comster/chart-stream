#!/usr/bin/env node
'use strict'

var pump = require('pump')
var opn = require('opn')
var chart = require('./')

function ready (url) {
    console.log('ready at '+url);
    
    setInterval(() => {}, Number.POSITIVE_INFINITY);
//   opn(url).then(() => {
//         console.log('opn closed')
//     }, (err)=>{
//         console.log('opn err')
//         console.log(err)
//     });
}

pump(process.stdin, chart(ready))