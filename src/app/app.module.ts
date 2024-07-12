
import { Module } from "../decorators/module";
import { PrismaService } from "../domain/services/prisma/prisma.services";
import { AuthModule } from "./controllers/auth/auth.module";
@Module({
  imports: [AuthModule],
  globalProviders:[PrismaService]
 
})
export class AppModule {}
