const handleProfileGet = (req, res, db) => {
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
};

/*
module.exports = {
  handleProfileGet: handleProfileGet,
};
*/

// 上方經ES6簡化
module.exports = {
  handleProfileGet,
};
