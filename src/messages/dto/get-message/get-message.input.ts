import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsOptional } from 'class-validator';

@InputType()
export class GetMessageInput {
  @Field(() => ID, { description: 'Chat Id' })
  @IsMongoId()
  chatId: string;

  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'message id',
  })
  @IsMongoId()
  cursor: string;
}
