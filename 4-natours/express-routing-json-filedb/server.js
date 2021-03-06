const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

//console.log(process.env);

// START THE SERVER
const port = process.env.PROT || 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
