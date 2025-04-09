// deleteTestUsers.js
const UserModel = require('../models/UserModel');

async function deleteTestUsers() {
  try {
    const result = await UserModel.deleteMany({ email: { $regex: /^testuser/ } });
    console.log(`Deleted ${result.deletedCount} test user(s)`);
  } catch (error) {
    console.error('Error deleting test users:', error);
  }
}

module.exports = deleteTestUsers;
