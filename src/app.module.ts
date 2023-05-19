import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [AuthModule, CartModule, OrderModule, DbModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
