import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserBasicOutput {
  @Field()
  _id: string;

  @Field()
  email: string;

  @Field()
  username: string;
}
