import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserOutput {
  @Field()
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  profilePicture?: string;

  @Field({ nullable: true })
  isLoggedInUser?: boolean;
}
