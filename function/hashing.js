const bcrypt = require('bcrypt');
const hashingPass = async (password) => {
  const hashPassword = await bcrypt.hash(password, 14);
  return hashPassword;
};
module.exports = hashingPass;
