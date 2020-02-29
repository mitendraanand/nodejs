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

// readFilePro(`${__dirname}/dog.txt`)
//   .then(data => {
//     console.log(`Breed: ${data}`);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then(res => {
//     console.log(res.body.message);
//     return writeFilePro('dog-img.txt', res.body.message);
//   })
//   .then(() => {
//     console.log('Random dog image saved to file.');
//   })
//   .catch(err => {
//     console.log(err);
//   });

// ASYNC and AWAIT from ES8 uses the PROMISE in even more cleaner way
// JUST a SYNTAXTICAL SUGAR
// const getDogPic = async () => {
//   try {
//     const data = await readFilePro(`${__dirname}/dog.txt`); // No need of then, await does the trick
//     console.log(`Breed: ${data}`);

//     const res = await superagent.get(
//       `https://dog.ceo/api/breed/${data}/images/random`
//     );
//     console.log(res.body);

//     await writeFilePro('dog-img.txt', res.body.message);
//     console.log('Random dog image saved to file.');
//   } catch (err) {
//     console.log('ERROR!');
//     throw err;
//   }

//   return 'READY';
// };

// Option 1: Call and collect the return value as Promises
// getDogPic()
//   .then(x => {
//     console.log(x);
//   })
//   .catch(err => {
//     console.log('getDogPic catch ERROR!');
//   });

// Option 2: ASYNC/AWAIT using Immediate Invoked Funciton (IIFE)
// This helps in NOT declaring a new function and then having to call the same.
// (async () => {
//   try {
//     const result = await getDogPic();
//     console.log(result);
//   } catch (err) {
//     console.log('getDogPic catch ERROR!');
//   }
// })();

// ASYNC function returns PROMISE and the return PROMISE is in RESOLVED state if there was no error otherwise
// the same will be in REJECTED state. PROMISE is in PENDING state at the time of creation.

// HOW TO CALL MULTIPLE PROMISES AT THE SAME TIME and not call 1 by 1.
const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`); // No need of then, await does the trick
    console.log(`Breed: ${data}`);

    const res1Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res2Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const res3Pro = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
    const imgs = all.map(el => el.body.message);
    console.log(imgs);

    await writeFilePro('dog-img.txt', imgs.join('\n'));
    console.log('Random dog image saved to file.');
  } catch (err) {
    console.log('ERROR!');
    throw err;
  }

  return 'READY';
};

(async () => {
  try {
    const result = await getDogPic();
    console.log(result);
  } catch (err) {
    console.log('getDogPic catch ERROR!');
  }
})();
