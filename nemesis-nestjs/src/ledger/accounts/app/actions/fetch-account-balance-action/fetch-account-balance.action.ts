import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../../shared/application/protected-action-options';
import { FetchAccountBalanceResponseDto } from './account-balance.response.dto';
import { AccountBalanceService } from '../../../domain/services/account-balance.service';
import { FetchAccountBalanceSwagger } from './fetch-account-balance.swagger';

@Controller('accounts')
export class FetchAccountBalanceAction {
  constructor(private readonly accountBalanceService: AccountBalanceService) {}

  @Get(':accountId/balance')
  @ProtectedAction({
    tag: 'Account',
    summary: 'Get account balance',
  })
  @FetchAccountBalanceSwagger()
  async handle(
    @Param('accountId', ParseIntPipe) accountId: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<FetchAccountBalanceResponseDto> {
    const balance = await this.accountBalanceService.getValidatedAccountBalance(
      accountId,
      user.userId,
    );

    return {
      accountId,
      balance,
      success: true,
    };
  }
}
