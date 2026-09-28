import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import { UpdateUsernameCommand } from './update-username.command';
import { UpdateUsernameResponseDto } from 'src/users/app/controllers/update-username-action/update-username.response.dto';

/**
 * Transaction script for changing the signed-in user's username.
 * Verifies the current password, then enforces format and uniqueness
 * before persisting the change.
 */
@Injectable()
export class UpdateUsernameTransactionScript {
  constructor(private readonly userRepository: UserRepository) {}

  async apply(
    command: UpdateUsernameCommand,
  ): Promise<UpdateUsernameResponseDto> {
    const { userId, newUsername, currentPassword } = command;

    const currentUser = await this.userRepository.findByIdWithPassword(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const trimmedUsername = newUsername.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      throw new BadRequestException(
        'Username must be between 3 and 20 characters',
      );
    }

    if (currentUser.username === trimmedUsername) {
      throw new BadRequestException(
        'New username must be different from current username',
      );
    }

    const existingUser =
      await this.userRepository.findByUsername(trimmedUsername);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already exists');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const updatedUser = await this.userRepository.update(userId, {
      username: trimmedUsername,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: updatedUser.id.toString(),
      username: updatedUser.username,
    };
  }
}
