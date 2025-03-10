import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsInt, IsMongoId, IsOptional } from 'class-validator';

@InputType()
export class GetMessageInput {
  @Field(() => ID, { description: 'Chat Id' })
  @IsMongoId()
  chatId: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, description: 'Page number' })
  pageNo?: number;
}
