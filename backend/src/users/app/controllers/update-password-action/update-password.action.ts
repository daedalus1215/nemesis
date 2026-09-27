import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UsersService } from '../../../domain/services/users.service';
import { ProtectedAction } from 'src/shared/application/protected-action-options';
import {
  AuthUser,
  GetAuthUser,
} from 'src/auth/app/decorators/get-auth-user.decorator';
import { UpdatePasswordSwagger } from './update-password.swagger';
import { UpdatePasswordRequestDto } from './update-password.request.dto';
import { UpdatePasswordCommand } from '../../../domain/transaction-scripts/update-password-ts/update-password.command';

@Controller('users')
export class UpdatePasswordAction {
  constructor(private readonly usersService: UsersService) {}

  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ProtectedAction({
    tag: 'User',
    summary: "Update the signed-in user's password",
  })
  @UpdatePasswordSwagger()
  async updatePassword(
    @Body() dto: UpdatePasswordRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<{ success: boolean }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation password do not match',
      );
    }

    const command: UpdatePasswordCommand = {
      userId: user.userId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    };
    await this.usersService.updatePassword(command);
    return { success: true };
  }
}
