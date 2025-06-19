import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateWalletDto {
    @IsNotEmpty()
    @ApiProperty({
        description: 'The creator ID of the wallet.',
        example: '60b3b7c5b1e1d7f6c0d6a8f6',
    })
    creatorId: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The balance of the wallet.',
        example: 0,
    })
    balance: number;

}