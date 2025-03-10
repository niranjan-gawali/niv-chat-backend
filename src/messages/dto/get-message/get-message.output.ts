import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';
import { UserOutput } from 'src/users/dto/user.output/user.output';

@ObjectType()
export class GetMessageOutput {
  @Field(() => ID, { description: 'message id' })
  @IsMongoId()
  _id: string;

  @Field(() => String, { description: 'message content' })
  content: string;

  @Field(() => Date, { description: 'Message creation date', nullable: true })
  createdAt?: Date;

  @Field(() => Date, { description: 'Message update date', nullable: true })
  updatedAt?: Date;

  @Field(() => UserOutput, { nullable: true })
  senderUser?: UserOutput;
}
