import { Module } from '@nestjs/common';
import { UsersService } from './domain/services/users.service';
import { FetchProfileAction } from './app/controllers/fetch-profile-action/fetch-profile.action';
import { User } from './domain/entities/user.entity';
import { RegisterUserAction } from './app/controllers/register-user-action/register-user.action';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/user.repository';
import { FetchProfileResponder } from './app/controllers/fetch-profile-action/fetch-profile.responder';
import { RegisterUserResponder } from './app/controllers/register-user-action/register-user.responder';
import { CreateUserTransactionScript } from './domain/transaction-scripts/create-user-ts/create-user.transaction.script';
import { UserExistsValidator } from './domain/transaction-scripts/create-user-ts/validators/user-exists.validatgor';
import { IsPasswordStrongValidator } from './domain/transaction-scripts/create-user-ts/validators/is-password-strong.validator';
import { ConfigModule } from '@nestjs/config';
import { UserAggregator } from './domain/user.aggregator';
import { FetchUserResponder } from './app/controllers/fetch-user-action/fetch-user.responder';
import { FetchUserAction } from './app/controllers/fetch-user-action/fetch-user.action';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [
    UsersService,
    UserRepository,
    FetchProfileResponder,
    FetchUserResponder,
    RegisterUserResponder,
    CreateUserTransactionScript,
    UserExistsValidator,
    IsPasswordStrongValidator,
    UserAggregator,
  ],
  controllers: [FetchProfileAction, FetchUserAction, RegisterUserAction],
  exports: [UserAggregator],
})
export class UsersModule {}
