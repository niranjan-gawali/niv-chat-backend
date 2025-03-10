import { Request } from 'express';
import { User } from 'src/users/entities/user.entity/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: User;
}
