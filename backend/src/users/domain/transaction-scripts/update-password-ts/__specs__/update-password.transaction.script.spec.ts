import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UpdatePasswordTransactionScript } from '../update-password.transaction.script';
import { IsPasswordStrongValidator } from '../../create-user-ts/validators/is-password-strong.validator';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UpdatePasswordTransactionScript', () => {
  let target: UpdatePasswordTransactionScript;
  let userRepository: jest.Mocked<UserRepository>;
  let configService: { get: jest.Mock };

  const userId = 1;
  const currentPassword = 'Current1!Pass';
  const newPassword = 'NewPass1!word';

  const makeUser = () => ({
    id: userId,
    username: 'soundfly',
    password: '$2b$12$fakehash',
  });

  const makeCommand = (
    overrides: Partial<{ currentPassword: string; newPassword: string }> = {},
  ) => ({
    userId,
    currentPassword,
    newPassword,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    // Mimic ConfigService: return the provided default when the key is unset.
    configService = {
      get: jest.fn((_key: string, defaultValue?: unknown) => defaultValue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePasswordTransactionScript,
        IsPasswordStrongValidator,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    target = module.get<UpdatePasswordTransactionScript>(
      UpdatePasswordTransactionScript,
    );
    userRepository = module.get(UserRepository);
  });

  describe('apply', () => {
    it('hashes and persists the new password on success', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      // First compare: current password matches; second: new differs.
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$newhash');

      await target.apply(makeCommand());

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        password: '$2b$12$newhash',
      });
    });

    it('uses the configured salt rounds when present', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$newhash');
      configService.get.mockReturnValue(10);

      await target.apply(makeCommand());

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('throws 404 when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(target.apply(makeCommand())).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 401 when the current password is wrong', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(target.apply(makeCommand())).rejects.toThrow(
        'Current password is incorrect',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 400 when the new password equals the current one', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        target.apply(makeCommand({ newPassword: currentPassword })),
      ).rejects.toThrow(
        'New password must be different from current password',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 400 when the new password is weak', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expect(
        target.apply(makeCommand({ newPassword: 'weak' })),
      ).rejects.toThrow('Password does not meet requirements');
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
