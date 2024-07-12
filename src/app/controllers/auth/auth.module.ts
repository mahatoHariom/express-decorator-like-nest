
import { Module } from "../../../decorators/module";
import { AuthService } from "../../../domain/services/auth/auth.services";
import { UserRepository } from "../../../infrastructure/repositories/user/user.repositories";
import { AuthController } from "./auth.controllers";

@Module({
  controllers: [AuthController],
  providers: [AuthService,UserRepository],
})
export class AuthModule {}
