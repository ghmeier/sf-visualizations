function start() {
  const app = require('./src/server');
  app.listen(process.env.PORT || 8080);
}

start();
