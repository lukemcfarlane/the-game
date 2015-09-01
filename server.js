import http from 'http'
import socketIo from 'socket.io'
import fs from 'fs'

import Game from './lib/game'

const PORT = 8080

var app = http.createServer(handler)
var io = socketIo(app)

app.listen(PORT)

console.log('Running on port ' + PORT)

function handler (req, res) {
  var path = '/' + (req.url.replace(/^\//, '') || 'index.html')
  fs.readFile(__dirname + path, function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + path);
    }

    res.writeHead(200);
    res.end(data);
  });
}

const timeStepInMs = 20

var game = new Game()

setInterval(function() {
  game.tick(timeStepInMs / 1000)
  io.sockets.emit('state', game.state)
}, timeStepInMs)

setInterval(function(){
  console.log(game.state)
}, 1000)

io.on('connection', function (socket) {
  console.log('Connection registered at', socket.id)
  game.addShip(socket.id)

  socket.on('inputState', function (state) {
    game.state.ships[0].thrusting = state.thrust
    game.state.ships[0].left = state.left
    game.state.ships[0].right = state.right
  });
});
