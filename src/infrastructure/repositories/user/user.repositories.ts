import { PrismaClient, User } from "@prisma/client";
import { PrismaService } from "../../../domain/services/prisma/prisma.services";

import { CreateUserDTO } from "../../../domain/dtos/auth.dto";
import bcrypt from 'bcryptjs'
import { IUserRepository } from "../../../domain/interfaces/user/user.interfaces";
import { Injectable } from "../../../decorators/injectable";

@Injectable()
export class UserRepository implements IUserRepository{
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
