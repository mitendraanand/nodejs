const fs = require('fs');
const superagent = require('superagent');

// CALLBACK HELL
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .end((err, res) => {
//       if (err) return console.log(err.message);
//       console.log(res.body.message);

//       fs.writeFile('dog-img.txt', res.body.message, err => {
//         console.log('Random dog image save to file');
//       });
//     });
// });

// JUST CONSUMING PROMISE

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);

//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then(res => {
//       console.log(res.body.message);

//       fs.writeFile('dog-img.txt', res.body.message, err => {
//         console.log('Random dog image save to file');
//       });
//     })
//     .catch(err => {
//       console.log(err.message);
//     });
// });

// BUILDING PROMISES, CONSUMING AND CHAINING AS WELL

const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file'); // // This data will be avaiable to 'catch handler' err parameter.
      resolve(data); // This data will be avaiable to 'then handler' resolve parameter.
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('Could not write the file');
      resolve('Success');
    });
  });
};

readFilePro(`${__dirname}/dog.txt`)
  .then(data => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then(res => {
    console.log(res.body.message);
    return writeFilePro('dog-img.txt', res.body.message);
  })
  .then(() => {
    console.log('Random dog image saved to file.');
  })
  .catch(err => {
    console.log(err);
  });
