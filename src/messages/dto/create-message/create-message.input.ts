import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field(() => ID, { description: 'Chat Id' })
  @IsMongoId()
  chatId: string;

  // @Field(() => ID, { description: 'Sender Id' })
  // @IsMongoId()
  // senderId: string;

  @Field(() => String, { description: 'message content' })
  content: string;
}
