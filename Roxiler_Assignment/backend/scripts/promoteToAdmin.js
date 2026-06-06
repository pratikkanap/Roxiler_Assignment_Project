const { User } = require('../models');

(async () => {
  try {
    const email = 'alex@example.com';
    const user = await User.findOne({ where: { email } });
    if (!user) return console.log('User not found:', email);
    user.role = 'Admin';
    await user.save();
    console.log(`Promoted ${email} to Admin`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
