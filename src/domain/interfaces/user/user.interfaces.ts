import { User } from "@prisma/client";
import { CreateUserDTO, LoginDTO } from "../../dtos/auth.dto";

export interface IUserRepository {
  createUser(data: CreateUserDTO): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
}
