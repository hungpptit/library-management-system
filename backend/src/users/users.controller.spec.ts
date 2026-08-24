import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    login: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockResponse: any = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should call service.create', async () => {
    const dto = { email: 'test@lib.com', password: '123' };
    mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id', 1);
  });

  it('should call service.login and set access_token cookie', async () => {
    mockUsersService.login.mockResolvedValue({
      access_token: 'token-abc',
      user: { id: 1, email: 'admin@lib.com' },
    });

    const result = await controller.login({ email: 'admin@lib.com', password: '123' }, mockResponse);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'access_token',
      'token-abc',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).toEqual({ id: 1, email: 'admin@lib.com' });
  });

  it('should clear cookie on logout', () => {
    const result = controller.logout(mockResponse);
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'access_token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).toEqual({ success: true });
  });

  it('should call service.findAll', async () => {
    mockUsersService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne', async () => {
    mockUsersService.findOne.mockResolvedValue({ id: 1 });
    const result = await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should call service.update', async () => {
    mockUsersService.update.mockResolvedValue({ id: 1, display_name: 'New' });
    const result = await controller.update(1, { display_name: 'New' });
    expect(service.update).toHaveBeenCalledWith(1, { display_name: 'New' });
    expect(result.display_name).toBe('New');
  });

  it('should call service.remove', async () => {
    mockUsersService.remove.mockResolvedValue({ success: true });
    const result = await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true });
  });
});
