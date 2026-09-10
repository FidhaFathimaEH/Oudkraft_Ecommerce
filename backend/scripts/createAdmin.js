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

    const email = (await askQuestion('Enter email address: ')).trim().toLowerCase();
    if (!email) {
      console.error('Email is required.');
      process.exitCode = 1;
      return;
    }

    const existingUser = await User.findOne({ email }).select('+role +isActive');

    if (existingUser) {
      console.log(`\nUser already exists:`);
      console.log(`- Name: ${existingUser.name}`);
      console.log(`- Phone: ${existingUser.phone}`);
      console.log(`- Current Role: ${existingUser.role}`);
      console.log(`- Active: ${existingUser.isActive ? 'Yes' : 'No'}`);

      if (existingUser.role === 'admin') {
        console.log('\nThis user is already an admin.');
        return;
      }

      const confirm = (await askQuestion('\nWould you like to promote this user to admin? (y/n): ')).trim().toLowerCase();
      if (confirm === 'y' || confirm === 'yes') {
        existingUser.role = 'admin';
        if (!existingUser.isActive) {
          existingUser.isActive = true;
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
        email,
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
