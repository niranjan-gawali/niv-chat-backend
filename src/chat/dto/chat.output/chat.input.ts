import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class ChatInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, description: 'Page number' })
  pageNo?: number;
}
