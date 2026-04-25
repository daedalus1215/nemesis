import { Controller, Get } from '@nestjs/common';
import { UsersService } from 'src/users/domain/services/users.service';
import { FetchUserResponder } from './fetch-user.responder';
import { FetchUserResponseDto } from './fetch-user.response.dto';
import { GetUsersSwagger } from './get-user.swagger';
import { ProtectedAction } from 'src/shared/application/protected-action-options';

@Controller('users')
export class FetchUserAction {
  constructor(
    private readonly service: UsersService,
    private readonly responder: FetchUserResponder,
  ) {}

  @Get()
  @GetUsersSwagger()
  @ProtectedAction({
    tag: 'User',
    summary: 'Fetch all users',
  })
  async getUsers(): Promise<FetchUserResponseDto[]> {
    return this.responder.apply(await this.service.getUsers());
  }
}
