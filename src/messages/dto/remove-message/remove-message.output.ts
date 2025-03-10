import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@ObjectType()
export class RemoveMessageOutput {
  @Field(() => ID, { description: 'message id' })
  @IsMongoId()
  _id: string;

  @Field(() => String, { description: 'message content' })
  message: string = 'Message removed successfully !!!';
}
