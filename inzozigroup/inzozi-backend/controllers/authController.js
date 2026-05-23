import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma, { isDbConnected } from '../config/db.js';
import { ALL_ROLES, ALL_PERMISSIONS } from '../config/roles.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inzozi_group_super_secret_jwt_key_12345';

// Dynamic mock delegations stored in memory for offline mode
export let MOCK_DELEGATIONS = [];

// Hardcoded mock users updated with the full Tech Company Roles
export const MOCK_EMPLOYEES = [
  {
    id: 'mock-admin-id',
    name: 'Inzozi Admin',
    email: 'admin@inzozi.com',
    passwordHash: '$2a$10$SPs2pWhlJhrTNPzxpAB0qOcRFfTcgq4VDSQLRF2uB6Vm/Z.H.jRoW', // admin123
    role: 'sysadmin',
    title: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'
  },
  {
    id: 'mock-dev-id',
    name: 'Benit Gilbert',
    email: 'dev@inzozi.com',
    passwordHash: '$2a$10$a3fcW0JpN46EPd8cgJ2HyOYbr7/QHP.Mj4QkFdOo7Esm/k1EgNp36', // dev123
    role: 'software_engineer',
    title: 'Software Engineer (Impressa Dev)',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit'
  },
  {
    id: 'mock-manager-id',
    name: 'HR Manager',
    email: 'manager@inzozi.com',
    passwordHash: '$2a$10$fVe4ooL0bGV01iNq/m2CI.l13o4rCd/Y2g3taGAPJz3dsoOT0p1x.', // manager123
    role: 'hr_manager',
    title: 'Human Resources Director',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=manager'
  },
  {
    id: 'mock-content-id',
    name: 'Gaju E-Commerce Moderator',
    email: 'content@inzozi.com',
    passwordHash: '$2a$10$9qa.ksW92LAE3k9rrtGIAu7AJZdBA4irEwbyqY3.4cgeelWvy68vO', // content123
    role: 'content_controller',
    title: 'Impressa Content Controller',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=content'
  },
  {
    id: 'mock-marketer-id',
    name: 'Growth Marketer',
    email: 'marketer@inzozi.com',
    passwordHash: '$2a$10$kNiTrQzbLQ0hQw.TLnUgTOxwoLdIO4Cu0fP3TtMuaSUd0.eewvJFm', // marketer123
    role: 'growth_marketer',
    title: 'Digital Marketing Lead',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer'
  },
  {
    id: 'mock-support-id',
    name: 'Support Agent',
    email: 'support@inzozi.com',
    passwordHash: '$2a$10$6p2S.xpXSERByQozKsj/7ONwDLnh.s52dtJMaWwDtD9qYVXdCjRmC', // support123
    role: 'customer_support',
    title: 'Customer Experience agent',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=support'
  },
  {
    id: 'mock-pm-id',
    name: 'Product Manager',
    email: 'pm@inzozi.com',
    passwordHash: '$2a$10$npO3TrKp5689VLtwBZqxe.Xz2jb4PgOGrKN8dt.5mAAOrZQoz2ajG', // pm123
    role: 'product_manager',
    title: 'Senior Product Manager',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=pm'
  }
];

// Function to sync employees from auth.users
export const syncEmployeesFromAuth = async () => {
  const dbActive = await isDbConnected();
  if (!dbActive) {
    console.log('[Sync] Database is not active, skipping sync.');
    return;
  }

  try {
    // 1. Fetch all users from Supabase auth.users schema
    const authUsers = await prisma.$queryRaw`
      SELECT id, email, encrypted_password, raw_user_meta_data, created_at
      FROM auth.users;
    `;

    if (!authUsers || authUsers.length === 0) {
      console.log('[Sync] No users found in auth.users.');
      return;
    }

    // 2. Sync each user into Employee table
    for (const u of authUsers) {
      const email = u.email;
      if (!email) continue;
      const id = u.id;
      const metadata = u.raw_user_meta_data || {};
      const name = metadata.name || metadata.full_name || email.split('@')[0];
      const avatar = metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
      
      // Default roles / title mapping
      let roleCode = metadata.role || 'software_engineer';
      if (email.toLowerCase() === 'byiringirobenitg@gmail.com') {
        roleCode = 'sysadmin'; // Make the owner/creator an admin by default
      }
      
      const dbRole = await prisma.role.findFirst({
        where: { code: roleCode }
      });
      const roleId = dbRole ? dbRole.id : null;

      // Sync user details
      await prisma.employee.upsert({
        where: { email },
        update: {
          name,
          password: u.encrypted_password || '', // sync the encrypted password directly
          avatar,
          isActive: true
        },
        create: {
          id, // use the same UUID as auth.users
          email,
          name,
          password: u.encrypted_password || '',
          roleId,
          title: metadata.title || (roleCode === 'sysadmin' ? 'System Administrator' : 'Software Engineer'),
          avatar,
          isActive: true,
          createdAt: u.created_at ? new Date(u.created_at) : new Date()
        }
      });
    }
    console.log(`[Sync] Successfully synchronized ${authUsers.length} employees from auth.users.`);
  } catch (err) {
    console.error('❌ Failed to sync employees from auth.users:', err.message);
  }
};

// Helper to resolve dynamic effective roles and permissions
export const resolveEffectiveUser = async (employee) => {
  const dbActive = await isDbConnected();
  let primaryRole = null;
  let activeDelegation = null;
  const effectivePermissions = new Set();
  
  if (dbActive) {
    try {
      // 1. Fetch employee and primary role with its permissions
      const dbEmp = await prisma.employee.findUnique({
        where: { id: employee.id },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      });
      
      if (dbEmp && dbEmp.role) {
        primaryRole = dbEmp.role;
        dbEmp.role.permissions.forEach(rp => {
          if (rp.permission) {
            effectivePermissions.add(rp.permission.code);
          }
        });
      }
      
      // 2. Fetch active delegations matching current date
      const now = new Date();
      const delegation = await prisma.delegation.findFirst({
        where: {
          employeeId: employee.id,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          targetRole: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          },
          authorizer: true
        }
      });
      
      if (delegation && delegation.targetRole) {
        activeDelegation = {
          id: delegation.id,
          targetRoleCode: delegation.targetRole.code,
          targetRoleName: delegation.targetRole.name,
          reason: delegation.reason,
          endDate: delegation.endDate,
          authorizerName: delegation.authorizer.name
        };
        
        delegation.targetRole.permissions.forEach(rp => {
          if (rp.permission) {
            effectivePermissions.add(rp.permission.code);
          }
        });
      }
    } catch (err) {
      console.warn('[AuthController] DB error resolving permissions, using memory:', err.message);
    }
  }
  
  // Fallback to Mock Mode
  if (!primaryRole) {
    const mockEmp = MOCK_EMPLOYEES.find(
      u => u.id === employee.id || u.email.toLowerCase() === employee.email.toLowerCase()
    );
    const mockUserRoleCode = mockEmp ? mockEmp.role : 'software_engineer';
    
    // Get mock role configuration
    const mockRoleConfig = ALL_ROLES.find(r => r.code === mockUserRoleCode);
    if (mockRoleConfig) {
      primaryRole = {
        code: mockRoleConfig.code,
        name: mockRoleConfig.name,
        isTechnical: mockRoleConfig.isTechnical
      };
      mockRoleConfig.permissions.forEach(p => effectivePermissions.add(p));
    }
    
    // Check in-memory MOCK_DELEGATIONS
    const now = new Date();
    const mockDelegation = MOCK_DELEGATIONS.find(d => 
      d.employeeId === employee.id &&
      d.isActive &&
      new Date(d.startDate) <= now &&
      new Date(d.endDate) >= now
    );
    
    if (mockDelegation) {
      const delegatedRoleConfig = ALL_ROLES.find(r => r.code === mockDelegation.targetRoleCode || r.id === mockDelegation.targetRoleId);
      const targetCode = delegatedRoleConfig ? delegatedRoleConfig.code : mockDelegation.targetRoleCode;
      const targetName = delegatedRoleConfig ? delegatedRoleConfig.name : 'Unknown Role';
      
      const authorizer = MOCK_EMPLOYEES.find(u => u.id === mockDelegation.authorizerId) || { name: 'Admin (Mock)' };
      
      activeDelegation = {
        id: mockDelegation.id,
        targetRoleCode: targetCode,
        targetRoleName: targetName,
        reason: mockDelegation.reason,
        endDate: mockDelegation.endDate,
        authorizerName: authorizer.name
      };
      
      if (delegatedRoleConfig) {
        delegatedRoleConfig.permissions.forEach(p => effectivePermissions.add(p));
      }
    }
  }
  
  return {
    primaryRole: primaryRole ? (primaryRole.code || primaryRole.name) : 'software_engineer',
    roleName: primaryRole ? primaryRole.name : 'Software Engineer',
    activeDelegation,
    permissions: Array.from(effectivePermissions)
  };
};

// Helper to sign JWT
const generateToken = (user, resolvedData) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: resolvedData.primaryRole,
      roleName: resolvedData.roleName,
      permissions: resolvedData.permissions,
      activeDelegation: resolvedData.activeDelegation
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      // Synchronize employees from Supabase auth.users
      await syncEmployeesFromAuth();

      const user = await prisma.employee.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const resolved = await resolveEffectiveUser(user);
        return res.json({
          token: generateToken(user, resolved),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: resolved.primaryRole,
            roleName: resolved.roleName,
            title: user.title,
            avatar: user.avatar,
            permissions: resolved.permissions,
            activeDelegation: resolved.activeDelegation,
            dbMode: 'production'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (dbError) {
      console.warn('[AuthController] DB Query error, falling back to mock authentication:', dbError.message);
    }
  }

  // Fallback Mock authentication if database is not active
  console.log('[AuthController] Operating in DB-Disconnected Mock Mode');
  const mockUser = MOCK_EMPLOYEES.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (mockUser) {
    const passMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (passMatch) {
      const resolved = await resolveEffectiveUser(mockUser);
      return res.json({
        token: generateToken(mockUser, resolved),
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: mockUser.title,
          avatar: mockUser.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'mocked'
        }
      });
    }
  }

  return res.status(401).json({ error: 'Invalid email or password' });
};

// Register new user (employees)
export const register = async (req, res) => {
  const { name, email, password, role, title } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please fill out all required fields (name, email, password)' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const exists = await prisma.employee.findUnique({ where: { email } });
      if (exists) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

      // Resolve roleId if standard role is supplied
      const dbRole = await prisma.role.findFirst({
        where: { code: role || 'software_engineer' }
      });

      const user = await prisma.employee.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: dbRole ? dbRole.id : null,
          title: title || 'Software Engineer',
          avatar
        }
      });

      const resolved = await resolveEffectiveUser(user);

      if (req.io) {
        req.io.emit('employee_updated', {
          action: 'created',
          employee: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: resolved.primaryRole,
            roleName: resolved.roleName,
            title: user.title,
            avatar: user.avatar,
            isActive: true
          }
        });
      }

      return res.status(201).json({
        token: generateToken(user, resolved),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: user.title,
          avatar: user.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'production'
        }
      });
    } catch (err) {
      console.error('[AuthController] Error saving user to database:', err.message);
      return res.status(500).json({ error: 'Failed to create user on database server' });
    }
  }

  // Fallback Mock registration if database is not active
  console.log('[AuthController] Operating in DB-Disconnected Mock Registration Mode');
  try {
    const exists = MOCK_EMPLOYEES.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    const newId = `mock-emp-${Date.now()}`;

    const newEmployee = {
      id: newId,
      name,
      email,
      passwordHash: hashedPassword,
      role: role || 'software_engineer',
      title: title || 'Software Engineer',
      avatar
    };

    MOCK_EMPLOYEES.push(newEmployee);

    const resolved = await resolveEffectiveUser(newEmployee);

    if (req.io) {
      req.io.emit('employee_updated', {
        action: 'created',
        employee: {
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: newEmployee.title,
          avatar: newEmployee.avatar,
          isActive: true
        }
      });
    }

    return res.status(201).json({
      token: generateToken(newEmployee, resolved),
      user: {
        id: newEmployee.id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: resolved.primaryRole,
        roleName: resolved.roleName,
        title: newEmployee.title,
        avatar: newEmployee.avatar,
        permissions: resolved.permissions,
        activeDelegation: resolved.activeDelegation,
        dbMode: 'mocked'
      }
    });
  } catch (err) {
    console.error('[AuthController] Error saving user to mock roster:', err.message);
    return res.status(500).json({ error: 'Failed to create user on mock server' });
  }
};

// Get current logged-in employee profile
export const getProfile = async (req, res) => {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const user = await prisma.employee.findUnique({ where: { id: req.user.id } });
      if (user) {
        const resolved = await resolveEffectiveUser(user);
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: user.title,
          avatar: user.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'production'
        });
      }
    } catch (err) {
      console.warn('[AuthController] DB error during getProfile:', err.message);
    }
  }

  // Fallback
  const mockUser = MOCK_EMPLOYEES.find(u => u.id === req.user.id);
  if (mockUser) {
    const resolved = await resolveEffectiveUser(mockUser);
    return res.json({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: resolved.primaryRole,
      roleName: resolved.roleName,
      title: mockUser.title,
      avatar: mockUser.avatar,
      permissions: resolved.permissions,
      activeDelegation: resolved.activeDelegation,
      dbMode: 'mocked'
    });
  }

  // If not found in mocks but token is valid, return req.user decodes
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    dbMode: 'mocked_unverified'
  });
};

// Get all employees (directory)
export const getEmployees = async (req, res) => {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      // Synchronize employees from Supabase auth.users
      await syncEmployeesFromAuth();

      const users = await prisma.employee.findMany({
        include: { role: true },
        orderBy: { name: 'asc' }
      });
      const formatted = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ? u.role.code : 'software_engineer',
        roleName: u.role ? u.role.name : 'Software Engineer',
        title: u.title,
        avatar: u.avatar,
        isActive: u.isActive
      }));
      return res.json(formatted);
    } catch (err) {
      console.warn('[AuthController] DB error listing employees, falling back to mock:', err.message);
    }
  }

  // Mock Mode
  const formattedMocks = MOCK_EMPLOYEES.map(u => {
    const roleConfig = ALL_ROLES.find(r => r.code === u.role);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      roleName: roleConfig ? roleConfig.name : 'Software Engineer',
      title: u.title,
      avatar: u.avatar,
      isActive: true
    };
  });
  return res.json(formattedMocks);
};

// Update employee role and title
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { role, title } = req.body;

  // Check for manage_users permission
  const userPermissions = req.user.permissions || [];
  if (!userPermissions.includes('manage_users')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to manage employee roles.' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      // Find the role first to get its ID
      const dbRole = await prisma.role.findFirst({
        where: { code: role }
      });

      if (!dbRole && role) {
        return res.status(404).json({ error: `Role '${role}' not found.` });
      }

      const updated = await prisma.employee.update({
        where: { id },
        data: {
          roleId: dbRole ? dbRole.id : undefined,
          title: title !== undefined ? title : undefined
        },
        include: { role: true }
      });

      // Synchronize back to auth.users raw_user_meta_data to keep Supabase auth metadata in sync
      if (role || title) {
        try {
          const metaUpdates = {};
          if (role) metaUpdates.role = role;
          if (title) metaUpdates.title = title;
          
          await prisma.$executeRawUnsafe(
            'UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || $1::jsonb WHERE id = $2::uuid',
            JSON.stringify(metaUpdates),
            id
          );
        } catch (metaErr) {
          console.warn(`[AuthController] Failed to update auth.users metadata:`, metaErr.message);
        }
      }

      const resolved = await resolveEffectiveUser(updated);
      const employeeData = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: resolved.primaryRole,
        roleName: resolved.roleName,
        title: updated.title,
        avatar: updated.avatar,
        isActive: updated.isActive
      };

      if (req.io) {
        req.io.emit('employee_updated', {
          action: 'updated',
          employee: employeeData
        });
      }

      return res.json({
        success: true,
        message: 'Employee role and title updated successfully.',
        employee: employeeData
      });
    } catch (err) {
      console.error('[AuthController] DB error updating employee:', err.message);
      return res.status(500).json({ error: 'Failed to update employee on database server.' });
    }
  }

  // Mock Mode Fallback
  const employeeIndex = MOCK_EMPLOYEES.findIndex(e => e.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found in mock registry.' });
  }

  const updatedEmployee = {
    ...MOCK_EMPLOYEES[employeeIndex],
    role: role !== undefined ? role : MOCK_EMPLOYEES[employeeIndex].role,
    title: title !== undefined ? title : MOCK_EMPLOYEES[employeeIndex].title
  };

  MOCK_EMPLOYEES[employeeIndex] = updatedEmployee;

  const resolved = await resolveEffectiveUser(updatedEmployee);
  const employeeData = {
    id: updatedEmployee.id,
    name: updatedEmployee.name,
    email: updatedEmployee.email,
    role: resolved.primaryRole,
    roleName: resolved.roleName,
    title: updatedEmployee.title,
    avatar: updatedEmployee.avatar,
    isActive: true
  };

  if (req.io) {
    req.io.emit('employee_updated', {
      action: 'updated',
      employee: employeeData
    });
  }

  return res.json({
    success: true,
    message: 'Employee updated successfully in mock store.',
    employee: employeeData
  });
};
