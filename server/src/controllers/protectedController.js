export async function getTestData(req, res) {
  res.json({ message: 'Only paid members can access this info!' });
};
