export async function getIsAuth(req, res) {
  res.json({ isAuth: true });
};

export async function getTestData(req, res) {
  res.json({ message: 'Only paid members can access this info!' });
};
