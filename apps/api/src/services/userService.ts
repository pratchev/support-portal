import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { hashPassword, comparePassword } from '@/utils/helpers';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  role?: string;
  authProvider?: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
}

class UserService {
  async createUser(input: CreateUserInput) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const userData: any = {
        email: input.email,
        name: input.name,
        role: input.role as any || 'USER',
        authProvider: input.authProvider as any || 'LOCAL',
      };
      
      if (input.password) {
        userData.password = await hashPassword(input.password);
      }
      
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });
      
      logger.info(`User created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUsers(role?: string, page: number = 1, limit: number = 20) {
    const where = role ? { role: role as any } : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        authProvider: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
        },
      });
      
      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }
    
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    
    logger.info(`User authenticated: ${user.email}`);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async getAgents() {
    return prisma.user.findMany({
      where: {
        role: { in: ['AGENT', 'ADMIN'] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const userService = new UserService();
