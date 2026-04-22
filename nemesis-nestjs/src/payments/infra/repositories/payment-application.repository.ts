import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentApplication } from '../../domain/entities/payment-application.entity';

@Injectable()
export class PaymentApplicationRepository {
  constructor(
    @InjectRepository(PaymentApplication)
    private readonly repository: Repository<PaymentApplication>,
  ) {}

  async create(data: Partial<PaymentApplication>): Promise<PaymentApplication> {
    const paymentApplication = this.repository.create(data);
    return this.repository.save(paymentApplication);
  }

  async findByPaymentId(paymentId: number): Promise<PaymentApplication[]> {
    return this.repository.find({
      where: { paymentId },
    });
  }

  async findByInvoiceId(invoiceId: number): Promise<PaymentApplication[]> {
    return this.repository.find({
      where: { invoiceId },
    });
  }
}
