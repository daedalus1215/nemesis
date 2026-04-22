import { User } from '../entities/user.entity';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import { Injectable } from '@nestjs/common';
import { CreateUserTransactionScript } from '../transaction-scripts/create-user-ts/create-user.transaction.script';
import { RegisterUserRequestDto } from 'src/users/app/controllers/register-user-action/dtos/register-user.request.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly createUserTransactionScript: CreateUserTransactionScript,
  ) {}

  async createUser(dto: RegisterUserRequestDto): Promise<User> {
    const user = await this.createUserTransactionScript.apply(dto);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return await this.userRepository.findByUsernameWithPassword(username);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async update(id: number, user: User): Promise<User> {
    return await this.userRepository.update(id, user);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
