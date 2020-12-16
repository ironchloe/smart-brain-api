// const handleSignin = (req, res, db, bcrypt) => {
const handleSignin = (db, bcrypt) => (req, res) => {
  // Destructring
  const { email, password } = req.body;

  // Security Validation
  if (!email || !password) {
    return res.status(400).json('Incorrect form submission');
  }

  db.select('email', 'hash')
    .from('login')
    .where('email', '=', email) // 解構前.where('email', '=', req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash); // 解構前const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

      // console.log(isValid);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email) // 解構前.where('email', '=', req.body.email)
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
};

module.exports = {
  handleSignin: handleSignin,
};
