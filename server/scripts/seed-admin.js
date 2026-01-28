require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql } = require('../config/database');

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seed...');

    // Check if any admin exists
    const adminCheck = await sql`SELECT id FROM users WHERE is_admin = true LIMIT 1`;
    
    if (adminCheck.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping seed.');
      console.log('If you want to create another admin, use the admin panel or update the database directly.');
      process.exit(0);
    }

    // Admin user credentials
    const adminData = {
      username: 'admin',
      email: 'admin@bioaffinity.com',
      password: 'Admin123!', // Change this password after first login!
      is_admin: true
    };

    console.log('\n📝 Creating admin user with credentials:');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const result = await sql`
      INSERT INTO users (username, email, password, is_admin) 
      VALUES (${adminData.username}, ${adminData.email}, ${hashedPassword}, ${adminData.is_admin})
      RETURNING id, username, email, is_admin, created_at
    `;

    const admin = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('\nAdmin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Admin: ${admin.is_admin}`);
    console.log(`   Created: ${admin.created_at}`);
    console.log('\n🔐 You can now login with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
