import { Body, Controller, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { UsersService } from '../../../domain/services/users.service';
import { ProtectedAction } from 'src/shared/application/protected-action-options';
import {
  AuthUser,
  GetAuthUser,
} from 'src/auth/app/decorators/get-auth-user.decorator';
import { UpdateUsernameSwagger } from './update-username.swagger';
import { UpdateUsernameRequestDto } from './update-username.request.dto';
import { UpdateUsernameResponseDto } from './update-username.response.dto';
import { UpdateUsernameCommand } from '../../../domain/transaction-scripts/update-username-ts/update-username.command';

@Controller('users')
export class UpdateUsernameAction {
  constructor(private readonly usersService: UsersService) {}

  @Put('username')
  @HttpCode(HttpStatus.OK)
  @ProtectedAction({
    tag: 'User',
    summary: "Update the signed-in user's username",
  })
  @UpdateUsernameSwagger()
  async updateUsername(
    @Body() dto: UpdateUsernameRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<UpdateUsernameResponseDto> {
    const command: UpdateUsernameCommand = {
      userId: user.userId,
      newUsername: dto.newUsername,
      currentPassword: dto.currentPassword,
    };
    return await this.usersService.updateUsername(command);
  }
}
