import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { FetchProfileResponseDto } from './fetch-profile.response.dto';
import { FetchProfileSwagger } from './fetch-profile.swagger';
import { FetchProfileResponder } from './fetch-profile.responder';
import { ProtectedAction } from 'src/shared/application/protected-action-options';

@Controller('users')
export class FetchProfileAction {
  constructor(private readonly responder: FetchProfileResponder) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ProtectedAction({
    tag: 'User',
    summary: 'Fetch profile',
  })
  @FetchProfileSwagger()
  async getProfile(@Req() req): Promise<FetchProfileResponseDto> {
    return this.responder.toDto(req.user);
  }
}
