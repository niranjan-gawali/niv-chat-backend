import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateChatInput } from '../create-chat.input/create-chat.input';
import { IsMongoId } from 'class-validator';

@InputType()
export class UpdateChatInput extends PartialType(CreateChatInput) {
  @Field(() => ID)
  @IsMongoId()
  _id: string;
}
