const fs = require('fs');

if (fs.existsSync('./public')) {
  process.env.NODE_ENV = 'production';
  process.env.databaseUri = 'mongodb://root:Furkan.1234@shop-shard-00-00-xk7jz.mongodb.net:27017,shop-shard-00-01-xk7jz.mongodb.net:27017,shop-shard-00-02-xk7jz.mongodb.net:27017/meanstack?ssl=true&replicaSet=shop-shard-0&authSource=admin&retryWrites=true&w=majority';
  process.env.databaseName = 'Uygulamanın databasesi olan meanstack';
} else {
  process.env.NODE_ENV = 'development';
  process.env.databaseUri = 'mongodb://localhost:27017/meanstack';
  process.env.databaseName = 'Lokalde uygulamanın databasesi olan meanstack';
}