import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUsernameTransactionScript } from '../update-username.transaction.script';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('UpdateUsernameTransactionScript', () => {
  let target: UpdateUsernameTransactionScript;
  let userRepository: jest.Mocked<UserRepository>;

  const userId = 1;
  const currentUsername = 'soundfly';
  const currentPassword = 'Current1!Pass';

  const makeUser = (overrides: Partial<{ id: number; username: string }> = {}) => ({
    id: userId,
    username: currentUsername,
    password: '$2b$12$fakehash',
    ...overrides,
  });

  const makeCommand = (
    overrides: Partial<{ newUsername: string; currentPassword: string }> = {},
  ) => ({
    userId,
    newUsername: 'newname',
    currentPassword,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUsernameTransactionScript,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    target = module.get<UpdateUsernameTransactionScript>(
      UpdateUsernameTransactionScript,
    );
    userRepository = module.get(UserRepository);
  });

  describe('apply', () => {
    it('updates the username and returns the projection on success', async () => {
      const user = makeUser();
      const updatedUser = makeUser({ username: 'newname' });
      userRepository.findById.mockResolvedValue(user);
      userRepository.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await target.apply(makeCommand());

      expect(result).toEqual({ id: '1', username: 'newname' });
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        username: 'newname',
      });
    });

    it('trims the new username before persisting', async () => {
      const user = makeUser();
      const updatedUser = makeUser({ username: 'newname' });
      userRepository.findById.mockResolvedValue(user);
      userRepository.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await target.apply(
        makeCommand({ newUsername: '  newname  ' }),
      );

      expect(result).toEqual({ id: '1', username: 'newname' });
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        username: 'newname',
      });
    });

    it('throws 404 when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(target.apply(makeCommand())).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 400 when the trimmed name is shorter than 3 characters', async () => {
      userRepository.findById.mockResolvedValue(makeUser());

      await expect(
        target.apply(makeCommand({ newUsername: 'ab' })),
      ).rejects.toThrow('Username must be between 3 and 20 characters');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 400 when the trimmed name is longer than 20 characters', async () => {
      userRepository.findById.mockResolvedValue(makeUser());

      await expect(
        target.apply(
          makeCommand({ newUsername: 'a'.repeat(21) }),
        ),
      ).rejects.toThrow('Username must be between 3 and 20 characters');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 400 when the new name equals the current username', async () => {
      userRepository.findById.mockResolvedValue(makeUser());

      await expect(
        target.apply(makeCommand({ newUsername: currentUsername })),
      ).rejects.toThrow(
        'New username must be different from current username',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('throws 409 when another user already has the name', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      userRepository.findByUsername.mockResolvedValue(
        makeUser({ id: 2, username: 'newname' }),
      );

      await expect(target.apply(makeCommand())).rejects.toThrow(
        'Username already exists',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('does not conflict when the name is only held by the same user', async () => {
      const user = makeUser();
      const updatedUser = makeUser({ username: 'newname' });
      userRepository.findById.mockResolvedValue(user);
      // Case-insensitive storage can surface the caller's own row here.
      userRepository.findByUsername.mockResolvedValue(
        makeUser({ username: 'newname' }),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await target.apply(makeCommand());

      expect(result).toEqual({ id: '1', username: 'newname' });
    });

    it('throws 401 when the current password is wrong', async () => {
      userRepository.findById.mockResolvedValue(makeUser());
      userRepository.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(target.apply(makeCommand())).rejects.toThrow(
        'Current password is incorrect',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
