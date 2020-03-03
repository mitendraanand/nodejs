const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
