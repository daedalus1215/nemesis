import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { TransferBetweenUsersDto } from '../transfer-between-internal-accounts-action/transfer-between-internal-accounts.request.dto';
import { TransferBetweenExternalAccountsResponseDto } from './transfer-between-external-accounts.response.dto';
import { TransferBetweenExternalAccountsSwagger } from './transfer-between-external-accounts.swagger';
import { PaymentService } from 'src/payments/domain/services/payment.service';

@Controller('accounts')
export class TransferBetweenExternalAccountsAction {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('transfer')
  @ProtectedAction({
    tag: 'Account',
    summary: 'Transfer between users default accounts',
  })
  @TransferBetweenExternalAccountsSwagger()
  async handle(
    @Body() transferDto: TransferBetweenUsersDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<TransferBetweenExternalAccountsResponseDto> {
    const result = await this.paymentService.transferBetweenUsers(
      user.userId,
      transferDto.toUserId,
      transferDto.amount,
      user.userId,
      transferDto.description,
    );

    return {
      transactionId: result.paymentId,
      fromAccountId: result.fromAccountId,
      toAccountId: result.toAccountId,
      amount: transferDto.amount,
      description: transferDto.description,
      success: result.success,
    };
  }
}
