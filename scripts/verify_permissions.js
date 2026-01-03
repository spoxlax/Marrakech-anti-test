const mongoose = require('mongoose');
const resolvers = require('../app/services/auth/resolvers');
const User = require('../app/services/auth/models/User');
const Profile = require('../app/services/auth/models/Profile');

const { getEffectivePermissions, canAssignPermissions } = resolvers;

const MONGO_URI = 'mongodb://localhost:27017/tourism-auth-test';

async function runTests() {
  try {
    console.log('Connecting to Test Database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Cleanup
    await User.deleteMany({});
    await Profile.deleteMany({});

    console.log('--- Test 1: Admin Permissions ---');
    const admin = new User({
      firstName: 'Admin', lastName: 'User', email: 'admin@test.com',
      password: 'hash', role: 'admin'
    });
    await admin.save();
    
    const adminPerms = await getEffectivePermissions(admin);
    console.log('Admin Perms:', adminPerms);
    if (!adminPerms.includes('*')) throw new Error('Admin should have * permission');

    console.log('--- Test 2: Vendor Permissions ---');
    const vendor = new User({
      firstName: 'Vendor', lastName: 'User', email: 'vendor@test.com',
      password: 'hash', role: 'vendor'
    });
    await vendor.save();
    
    const vendorPerms = await getEffectivePermissions(vendor);
    console.log('Vendor Perms:', vendorPerms);
    if (!vendorPerms.includes('*')) throw new Error('Vendor should have * permission');

    console.log('--- Test 3: Employee Inheritance (Simple) ---');
    // Create a profile for the vendor's employee
    const empProfile = new Profile({
      name: 'Agent',
      permissions: ['activities:view', 'bookings:create'],
      ownerId: vendor._id
    });
    await empProfile.save();

    const employee = new User({
      firstName: 'Emp', lastName: 'Loyee', email: 'emp@test.com',
      password: 'hash', role: 'employee',
      parentId: vendor._id,
      profileId: empProfile._id
    });
    await employee.save();

    const empPerms = await getEffectivePermissions(employee);
    console.log('Employee Perms (Parent is Vendor *):', empPerms);
    // Vendor has *, so employee should get all profile permissions
    if (!empPerms.includes('activities:view') || !empPerms.includes('bookings:create')) {
      throw new Error('Employee should inherit profile permissions when parent is Vendor');
    }

    console.log('--- Test 4: Nested Employee Inheritance (Vertical) ---');
    // Scenario: Admin -> Manager (Employee with limited perms) -> Agent (Employee)
    // Actually, the system seems to support 1 level of parent (parentId).
    // If an employee can have employees, we need to test that.
    // The schema allows it.
    
    // Let's say Vendor creates a Manager.
    const managerProfile = new Profile({
      name: 'Manager',
      permissions: ['activities:view', 'activities:create', 'employees:create'],
      ownerId: vendor._id
    });
    await managerProfile.save();

    const manager = new User({
      firstName: 'Manager', lastName: 'User', email: 'manager@test.com',
      password: 'hash', role: 'employee',
      parentId: vendor._id,
      profileId: managerProfile._id
    });
    await manager.save();

    // Now Manager creates an Agent.
    // Note: The system currently might not support Employee creating Employee fully in UI, but backend schema supports parentId.
    // The `createEmployee` resolver checks `['admin', 'vendor'].includes(user.role)`.
    // So Employees CANNOT create employees currently.
    // Verify this restriction in resolver code:
    // `if (!user || !['admin', 'vendor'].includes(user.role)) { throw new Error('Forbidden'); }`
    // So vertical inheritance is strictly 1 level deep (Admin/Vendor -> Employee).
    // So we don't need to test Manager -> Agent.
    
    console.log('Skipping Nested Inheritance (Not supported by createEmployee resolver).');

    console.log('--- Test 5: Privilege Escalation Prevention ---');
    // Check if `canAssignPermissions` prevents assigning permissions the actor doesn't have.
    
    // Case A: Vendor (who has *) assigning anything -> Should allow
    const resultA = await canAssignPermissions(vendor, ['random:permission']);
    console.log('Vendor assigning random permission:', resultA);
    if (resultA !== true) throw new Error('Vendor should be able to assign any permission');

    // Case B: Employee (Manager) trying to assign permissions
    // Manager has ['activities:view', 'activities:create', 'employees:create']
    // Manager tries to assign 'activities:delete' (which they don't have)
    const resultB = await canAssignPermissions(manager, ['activities:delete']);
    console.log('Manager assigning forbidden permission:', resultB);
    if (resultB !== false) throw new Error('Manager should NOT be able to assign permissions they do not have');

    // Case C: Manager assigning allowed permissions
    const resultC = await canAssignPermissions(manager, ['activities:create']);
    console.log('Manager assigning allowed permission:', resultC);
    if (resultC !== true) throw new Error('Manager should be able to assign permissions they have');

    console.log('--- All Tests Passed ---');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

runTests();
