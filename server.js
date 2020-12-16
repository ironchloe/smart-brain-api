const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// use the knex function to connect to a database
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'chloeli',
    password: '',
    database: 'smart-brain',
  },
});

// Connect our server to our database
// * 需要用''包起來，否則會有error
/* db.select('*')
  .from('users')
  .then((data) => {
    console.log(data);
  });
*/

const app = express();

app.use(bodyParser.json());
// 不用body-parser, email會undefined
// body-parser是middleware, 必須放在const app = express(); 之後

app.use(cors());

// nodemon偵測到server變動, 會進行restart, 先前操作的data會消失, 必須再操作一次
/* 在Postgresql建立smart-brain database 就不用下面人工輸入的資料了
const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date(),
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [
    {
      id: '987',
      hash: '',
      email: 'john@gmail.com',
    },
  ],
};
*/

app.get('/', (req, res) => {
  res.send(database.users);
});

/*
root / --> res = This is working
     /signin --> POST = success / fail
     /register --> POST = user
     /profile/:userId --> GET = user
     /image --> PUT --> user

     // GET   （讀取資料）
     // POST  （新增寫入資料）
     // PUT   （異動更新單筆資料）
     // DELETE（刪除單筆資料)
*/

/* app.post('/signin', (req, res) => {
  /* 比較兩個密碼是否相符
  bcrypt.compare(
    'apples',
    '$2a$10$QagkLz.KNfbIKHmUkFFgseddgstAoOOYuRUirzUPArVsuivQJXy06',
    function (err, res) {
      // res == true
      console.log('first guess', res);
    }
  );
  bcrypt.compare(
    'veggies',
    '$2a$10$QagkLz.KNfbIKHmUkFFgseddgstAoOOYuRUirzUPArVsuivQJXy06',
    function (err, res) {
      // res = false
      console.log('second guess', res);
    }
  ); 
  */

/* 版本一
  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    res.json(database.users[0]);
  } else {
    res.status(400).json('Error logging in');
  }
  */

//  版本二
/* db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      // console.log(isValid);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', req.body.email)
          .then((user) => {
            // console.log(user);
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json('Unable to get user'));
      } else {
        res.status(400).json('Wrong credentials');
      }
    })
    .catch((err) => res.status(400).json('Wrong credentials'));
});
*/

// 版本三
/*
app.post('/signin', (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});
*/

// 版本四
app.post('/signin', signin.handleSignin(db, bcrypt));

/*
app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  /* bcrypt.hash(password, null, null, function (err, hash) {
    // Store hash in your password DB.
    console.log(hash);
  }); */

// 版本一：後端server接到database後,把資料以下方格式推到前端
/* database.users.push({
    id: '125',
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date(),
  });
  */

// 版本二：上方register改用下面knex方式，連接前端(Postman)資料到後端database：smart-brain 的table：users 中
/* return db('users')
    .returning('*') // return all
    .insert({
      email: email,
      name: name,
      joined: new Date(),
    })
    .then((user) => {
      res.json(user[0]);
    }) 
    .catch((err) => res.status(400).json('Unable to register'));
  */

// 版本三：上方register改用下面knex的transaction方式
/* db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json('Unable to register'));
});
*/

// 版本四
app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

/* app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json('not found');
  }
});
*/

// 版本二：上方profile改用下面knex方式
/*
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({ id }) // 原來是.where({id: id})，因為ES6語法可簡寫
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch((err) => res.status(400).json('Error getting user'));
});
*/

// 版本三：
app.get('/profile/:id', (req, res) => {
  profile.handleProfileGet(req, res, db);
});

/*
app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json('not found');
  }
});
*/

// 版本二：上方image改用下面knex方式
/*
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json('Unable to get entries'));
});
*/

// 版本三
app.put('/image', (req, res) => {
  image.handleImage(req, res, db);
});

// 因API從前端移至後端image.js所產生的指令
app.post('/imageurl', (req, res) => {
  image.handleApiCall(req, res);
});

/* 
bcrypt-nodejs Asynchronous

bcrypt.hash("bacon", null, null, function(err, hash) {
    // Store hash in your password DB.
});

// Load hash from your password DB.
bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});
*/

app.listen(3000, () => {
  console.log('app is running on port 3000');
});
