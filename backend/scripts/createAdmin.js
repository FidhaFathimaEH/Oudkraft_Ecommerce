const readline = require('readline');
const { connectDB, disconnectDB } = require('../src/config/database');
const User = require('../src/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const rawEmail = (await askQuestion('Enter email address: ')).trim().toLowerCase();
    if (!rawEmail) {
      console.error('Email is required.');
      process.exitCode = 1;
      return;
    }

    // Normalize email (removes dots in gmail addresses to match express-validator's normalizeEmail)
    const normalizedEmail = rawEmail.endsWith('@gmail.com')
      ? rawEmail.split('@')[0].replace(/\./g, '') + '@gmail.com'
      : rawEmail;

    const existingUser = await User.findOne({
      $or: [{ email: rawEmail }, { email: normalizedEmail }]
    }).select('+role +isActive');

    if (existingUser) {
      console.log(`\nUser already exists:`);
      console.log(`- Name: ${existingUser.name}`);
      console.log(`- Email in DB: ${existingUser.email}`);
      console.log(`- Current Role: ${existingUser.role}`);
      console.log(`- Active: ${existingUser.isActive ? 'Yes' : 'No'}`);

      if (existingUser.role === 'admin') {
        const updatePass = (await askQuestion('\nThis user is already an admin. Would you like to reset/update their password? (y/n): ')).trim().toLowerCase();
        if (updatePass === 'y' || updatePass === 'yes') {
          const newPass = await askQuestion('Enter new password (min 8 chars): ');
          if (!newPass || newPass.length < 8) {
            console.error('Password must be at least 8 characters long.');
            process.exitCode = 1;
            return;
          }
          existingUser.email = normalizedEmail; // ensure email matches login normalization
          existingUser.password = newPass;
          existingUser.isActive = true;
          await existingUser.save();
          console.log('\nSuccessfully updated password and normalized email for admin user!');
          console.log(`You can now log in with: ${rawEmail} or ${normalizedEmail}`);
        } else {
          console.log('Operation cancelled.');
        }
        return;
      }

      const confirm = (await askQuestion('\nWould you like to promote this user to admin? (y/n): ')).trim().toLowerCase();
      if (confirm === 'y' || confirm === 'yes') {
        existingUser.role = 'admin';
        existingUser.email = normalizedEmail;
        if (!existingUser.isActive) {
          existingUser.isActive = true;
        }
        const changePass = (await askQuestion('Would you also like to set a new password? (y/n): ')).trim().toLowerCase();
        if (changePass === 'y' || changePass === 'yes') {
          const newPass = await askQuestion('Enter new password (min 8 chars): ');
          if (newPass && newPass.length >= 8) {
            existingUser.password = newPass;
          }
        }
        await existingUser.save();
        console.log('Successfully promoted user to admin!');
      } else {
        console.log('Operation cancelled.');
      }
    } else {
      console.log('\nUser not found. Creating a new admin user...');
      const name = (await askQuestion('Enter full name: ')).trim();
      if (!name) {
        console.error('Name is required.');
        process.exitCode = 1;
        return;
      }

      const phone = (await askQuestion('Enter phone number: ')).trim();
      if (!phone) {
        console.error('Phone is required.');
        process.exitCode = 1;
        return;
      }

      const password = await askQuestion('Enter password (min 8 chars): ');
      if (!password || password.length < 8) {
        console.error('Password must be at least 8 characters long.');
        process.exitCode = 1;
        return;
      }

      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        console.error('A user with this phone number already exists.');
        process.exitCode = 1;
        return;
      }

      const newAdmin = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password,
        role: 'admin',
        isVerified: true,
        isActive: true
      });

      console.log(`\nAdmin user created successfully! ID: ${newAdmin._id}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exitCode = 1;
  } finally {
    rl.close();
    await disconnectDB();
    console.log('Database connection closed.');
  }
}

main();
