const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');

async function seedAdmin() {
    try {
        // Check if any user exists
        const userCount = await User.countDocuments();

        if (userCount === 0) {
            console.log('No users found. Seeding initial admin user...');

            const email = 'amer.assouli@gmail.com';
            const password = 'Spoxlax@123.';
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create Admin User
            const adminUser = new User({
                firstName: 'Amer',
                lastName: 'Assouli',
                email: email,
                password: hashedPassword,
                role: 'admin'
            });

            await adminUser.save();

            // Create System Administrator Profile
            const adminProfile = new Profile({
                name: 'System Administrator',
                description: 'Default system administrator profile with full permissions',
                permissions: ['*'],
                ownerId: adminUser.id
            });

            await adminProfile.save();

            // Link Profile to User
            adminUser.profileId = adminProfile.id;
            await adminUser.save();

            console.log('✅ Initial admin user seeded successfully.');
            console.log(`📧 Email: ${email}`);
            console.log('🔑 Password: [HIDDEN]');
        } else {
            console.log('Users already exist. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
    }
}

module.exports = seedAdmin;
