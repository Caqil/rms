const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-restaurant', (data) => {
      socket.join(data.restaurantId);
      socket.emit('restaurant-joined', { success: true });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, () => {
    console.log('> Server ready on http://localhost:3000');
    console.log('> Socket.IO ready');
  });
});