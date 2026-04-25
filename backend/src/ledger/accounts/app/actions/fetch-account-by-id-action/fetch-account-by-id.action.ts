import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from 'src/auth/app/decorators/get-auth-user.decorator';
import { FetchAccountByIdResponseDto } from './fetch-account-by-id.response.dto';
import { AccountService } from 'src/ledger/accounts/domain/services/account-service/account.service';
import { ProtectedAction } from 'src/shared/application/protected-action-options';
import { FetchAccountByIdSwagger } from './fetch-account-by-id.swagger';

@Controller('accounts')
export class FetchUserAccountByIdAction {
  constructor(private readonly accountService: AccountService) {}

  @Get('detail/:accountId')
  @ProtectedAction({
    tag: 'Account',
    summary: 'Get user account by id',
  })
  @FetchAccountByIdSwagger()
  async handle(
    @Param('accountId', ParseIntPipe) accountId: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<FetchAccountByIdResponseDto> {
    const account = await this.accountService.getAccountById(
      accountId,
      user.userId,
    );
    //@TODO: Move to a Responder.
    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType,
      isDefault: account.isDefault,
      createdAt: account.createdAt,
    };
  }
}
