import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RatingDto {
    @ApiProperty({
        description: 'The ID of the post being rated.',
        example: '1',
    })
    @IsNotEmpty()
    postId: string;

    @ApiProperty({
        description: 'The number of stars given to the post (1-5).',
        example: '5',
    })
    @IsNotEmpty()
    stars: string;
}