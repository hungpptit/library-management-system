import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;
    guard = new AuthGuard(jwtService);
  });

  const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const request = { headers };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should authenticate successfully using cookie token', async () => {
    const context = createMockContext({
      cookie: 'access_token=valid-cookie-token; session_id=123',
    });
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 1,
      email: 'admin@library.com',
      role: 'admin',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-cookie-token', {
      secret: 'library-secret-key-12345',
    });
  });

  it('should authenticate successfully using Authorization Bearer header', async () => {
    const context = createMockContext({
      authorization: 'Bearer valid-bearer-token',
    });
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 2,
      email: 'reader@library.com',
      role: 'reader',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-bearer-token', {
      secret: 'library-secret-key-12345',
    });
  });

  it('should throw UnauthorizedException if no token is found', async () => {
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not found'),
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const context = createMockContext({
      authorization: 'Bearer invalid-token',
    });
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });
});
