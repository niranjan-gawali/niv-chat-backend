import { InputType, Field } from '@nestjs/graphql';
import { IsMongoId, IsOptional } from 'class-validator';

@InputType()
export class ChatInput {
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'chat id',
  })
  @IsMongoId()
  cursor?: string;
}
