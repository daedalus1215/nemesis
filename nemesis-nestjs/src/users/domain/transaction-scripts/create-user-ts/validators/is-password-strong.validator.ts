import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class IsPasswordStrongValidator {
  apply(password: string): void {
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
        password,
      )
    ) {
      throw new BadRequestException(
        'Password does not meet requirements. It must be at least 8 characters long and' +
          'contain at least one uppercase letter,' +
          'one lowercase letter,' +
          'one number,' +
          'and one special character.',
      );
    }
  }
}
