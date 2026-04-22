import { UserExistsValidator } from './validators/user-exists.validatgor';
import { IsPasswordStrongValidator } from './validators/is-password-strong.validator';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import { User } from 'src/users/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { RegisterUserRequestDto } from 'src/users/app/controllers/register-user-action/dtos/register-user.request.dto';

@Injectable()
export class CreateUserTransactionScript {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userExistsValidator: UserExistsValidator,
    private readonly isPasswordStrongValidator: IsPasswordStrongValidator,
    private readonly configService: ConfigService,
  ) {}

  async apply(createUserDto: RegisterUserRequestDto): Promise<User> {
    const { username, password } = createUserDto;

    const existingUser = await this.userRepository.findByUsername(username);

    this.userExistsValidator.apply(existingUser);
    this.isPasswordStrongValidator.apply(password);

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return await this.userRepository.create({
      username,
      password: hashedPassword,
    });
  }
}
