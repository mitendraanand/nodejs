const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('uncaughtException. Shutting Down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
//console.log(process.env);

//When entering your password, make sure that any special characters are URL encoded. %23 for #
const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//console.log(DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    //console.log(con.connections);
    console.log('DB Connection Successfull');
  });

// START THE SERVER
const port = process.env.PROT || 3000;
const app = require('./app');
const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

// GLOBALLY HANDLE THE UNHANDLED REJECTIONS
// BY listening to 'unhandledRejection'
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandledRejection. Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
