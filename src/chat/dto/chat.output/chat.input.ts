import { InputType, Field } from '@nestjs/graphql';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

@InputType()
export class ChatInput {
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'chat id',
  })
  @IsMongoId()
  cursor?: string;

  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description: 'search parameter',
  })
  @IsString()
  searchParam?: string;
}
