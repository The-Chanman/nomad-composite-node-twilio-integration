const Nomad = require('nomad-stream')
const moment = require('moment')

const credentials = require('./twilio-login.js')
const phoneNumbers = require('./phone-numbers.js')

const nomad = new Nomad()

//require the Twilio module and create a REST client
const client = require('twilio')(credentials.accountSid, credentials.authToken)

const subscriptions = ['QmXeYj4i32SAynbS43jWuJSinVRveZQ7YoMWL9RsfkDE6h']

let instance = null
let lastPub = null
let messageBody = ""

const frequency = 60 * 1000 // 1 hour
const timeThreshold = 24 * 60 * 60 * 1000 // 1 day
const trigger = 94
const toNumber = phoneNumbers.toNumber
const fromNumber = phoneNumbers.fromNumber

function getTime() {
  return new moment()
}

lastPub = getTime()
nomad.subscribe(subscriptions, function(message) {
  console.log(message.message)
  messageData = JSON.parse(message.message)

  let currentTime = getTime()
  let timeSince = currentTime - lastPub
  if (timeSince >= frequency){
    console.log("===================================>   timeSince >= timeBetween")
    if (messageData.data[5] > trigger){
      console.log("***************************************************************************************")
      console.log(`The dissolved_o2 is ${messageData.data[5]} which is higher than the average of ${trigger}`)
      console.log("***************************************************************************************")
    
      messageBody = `The dissolved_o2 is ${messageData.data[5]} which is higher than the average of ${trigger}`

      client.messages.create({
        to: toNumber,
        from: fromNumber,
        body: messageBody,
      }, function (err, message) {
        console.log(err)
        console.log(message)
      })

      lastPub = currentTime
    }
  }
  if (timeSince >= timeThreshold){
    // publish what we got
    console.log("===================================>   timeSince >= timeThreshold")
    console.log("***************************************************************************************")
    console.log('Heartbeat, I Twilio composite node is ALIVE <3')
    console.log("***************************************************************************************")
    
    messageBody = 'Heartbeat, I Twilio composite node is ALIVE <3'

    client.messages.create({
      to: toNumber,
      from: fromNumber,
      body: messageBody,
    }, function (err, message) {
      console.log(err)
      console.log(message)
    })

    lastPub = currentTime
  }
})



