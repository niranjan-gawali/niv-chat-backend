import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity/user.entity';

const getCurrentUserByContext = (context: ExecutionContext): User | null => {
  if (context.getType() === 'http') {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user ?? null;
  } else if (context.getType<GqlContextType>() === 'graphql') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return gqlContext.req.user ?? null;
  }
  return null; // Ensure function always returns a value
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
