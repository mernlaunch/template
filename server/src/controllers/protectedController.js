async function getIsAuth(req, res) {
  res.json({ isAuth: true });
}

async function getTestData(req, res) {
  res.json({ message: 'Only paid members can access this info!' });
}

module.exports = { getIsAuth, getTestData };
