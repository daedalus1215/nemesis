import { Injectable } from '@nestjs/common';
import { PaymentApplication } from '../../entities/payment-application.entity';
import { PaymentApplicationRepository } from '../../../infra/repositories/payment-application.repository';

@Injectable()
export class CreatePaymentApplicationTransactionScript {
  constructor(
    private readonly paymentApplicationRepository: PaymentApplicationRepository,
  ) {}

  async execute(
    paymentId: number,
    invoiceId: number,
    appliedAmount: number,
  ): Promise<PaymentApplication> {
    return await this.paymentApplicationRepository.create({
      paymentId,
      invoiceId,
      appliedAmount,
    });
  }
}
