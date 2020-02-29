const EventEmitter = require('events');
const http = require('http');

const myEmmitter = new EventEmitter();

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

myEmmitter.on('newSale', () => {
  console.log('There was a new sale!');
});

myEmmitter.on('newSale', () => {
  console.log('Customer name is Mitendra!');
});

myEmmitter.on('newSale', stock => {
  console.log(`There are new ${stock} items left in stock.`);
});

myEmmitter.emit('newSale', 9);

//////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
  res.end('Request received.');
   console.log('Request received.');
});

server.on('request', (req, res) => {
  res.end('Another request received.');
   console.log('Another Request received.');
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Waiting for request')
})