import { Injectable } from '@nestjs/common';
import { Account } from '../../../domain/entities/account.entity';
import { FetchUserAccountsResponseDto } from './fetch-user-accounts.response.dto';

@Injectable()
export class FetchUserAccountsResponder {
  public apply(
    accounts: (Account & { balance: number })[],
  ): FetchUserAccountsResponseDto {
    return {
      accounts,
      success: true,
    };
  }
}
