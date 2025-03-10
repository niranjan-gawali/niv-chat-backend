import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@ObjectType()
export class CreateMessageOutput {
  @Field(() => ID, { description: 'message id' })
  @IsMongoId()
  _id: string;

  @Field(() => String, { description: 'message content' })
  content: string;

  @Field(() => Date, { description: 'Message creation date', nullable: true })
  createdAt?: Date;

  @Field(() => Date, { description: 'Message update date', nullable: true })
  updatedAt?: Date;
}
