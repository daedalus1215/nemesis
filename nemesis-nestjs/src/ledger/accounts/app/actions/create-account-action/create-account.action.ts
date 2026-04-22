import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountRequestDto } from './create-account.request.dto';
import { AccountResponseDto } from './create-account.response.dto';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../../shared/application/protected-action-options';
import { CreateAccountSwagger } from './create-account.swagger';
import { AccountService } from 'src/ledger/accounts/domain/services/account-service/account.service';

@Controller('accounts')
export class CreateAccountAction {
  constructor(private readonly service: AccountService) {}

  @Post()
  @ProtectedAction({
    tag: 'Account',
    summary: 'Create an account',
  })
  @CreateAccountSwagger()
  async handle(
    @Body() createAccountDto: CreateAccountRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<AccountResponseDto> {
    const result = await this.service.createAccountForUser(
      user.userId,
      createAccountDto.name,
      createAccountDto.accountType,
    );

    return {
      id: result.accountId,
      name: createAccountDto.name,
      accountType: createAccountDto.accountType,
      isDefault: result.isDefault,
      success: true,
    };
  }
}
