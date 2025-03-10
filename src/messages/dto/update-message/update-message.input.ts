import { IsMongoId } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateMessageInput {
  @Field(() => ID)
  @IsMongoId()
  _id: string;

  @Field(() => String)
  content: string;
}
