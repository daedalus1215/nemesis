import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from 'src/users/domain/services/users.service';
import { RegisterUserRequestDto } from './dtos/register-user.request.dto';
import { RegisterUserResponseDto } from './dtos/register-user-response.dto';
import { RegisterUserSwagger } from './register-user.swagger';
import { RegisterUserResponder } from './register-user.responder';

@Controller('users')
export class RegisterUserAction {
  constructor(
    private readonly service: UsersService,
    private readonly responder: RegisterUserResponder,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterUserSwagger()
  async register(
    @Body() registerUserDto: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    return this.responder.apply(await this.service.createUser(registerUserDto));
  }
}
