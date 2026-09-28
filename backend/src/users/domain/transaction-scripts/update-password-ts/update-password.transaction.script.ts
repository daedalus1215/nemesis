import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import { IsPasswordStrongValidator } from '../create-user-ts/validators/is-password-strong.validator';
import { UpdatePasswordCommand } from './update-password.command';

/**
 * Transaction script for changing the signed-in user's password.
 * Verifies the current password, enforces the same strength rules as
 * registration, and hashes with the configured salt rounds.
 *
 * A wrong current password is a 400 (bad input), not a 401: the session
 * itself is valid, and the frontend's global 401 handler would otherwise
 * clear the token and bounce the user to the login page.
 */
@Injectable()
export class UpdatePasswordTransactionScript {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly isPasswordStrongValidator: IsPasswordStrongValidator,
    private readonly configService: ConfigService,
  ) {}

  async apply(command: UpdatePasswordCommand): Promise<void> {
    const { userId, currentPassword, newPassword } = command;

    const currentUser = await this.userRepository.findByIdWithPassword(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      currentUser.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    this.isPasswordStrongValidator.apply(newPassword);

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
}
