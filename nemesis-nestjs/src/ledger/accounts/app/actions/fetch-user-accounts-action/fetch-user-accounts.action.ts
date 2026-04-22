import { Controller, Get } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../../shared/application/protected-action-options';
import { FetchUserAccountsResponseDto } from './fetch-user-accounts.response.dto';
import { FetchUserAccountsSwagger } from './fetch-user-accounts.swagger';
import { FetchUserAccountsResponder } from './fetch-user-accounts.responder';
import { AccountBalanceService } from 'src/ledger/accounts/domain/services/account-balance.service';

@Controller('accounts')
export class GetUserAccountsAction {
  constructor(
    private readonly accountBalanceService: AccountBalanceService,
    private readonly responder: FetchUserAccountsResponder,
  ) {}

  @Get()
  @ProtectedAction({
    tag: 'Account',
    summary: 'Get user accounts',
  })
  @FetchUserAccountsSwagger()
  async handle(
    @GetAuthUser() user: AuthUser,
  ): Promise<FetchUserAccountsResponseDto> {
    return this.responder.apply(
      await this.accountBalanceService.getAccountsWithBalances(user.userId),
    );
  }
}
