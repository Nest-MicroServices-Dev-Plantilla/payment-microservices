import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";


export class PaymentSessionDTO{

    @IsString()
    orderId: string;

    @IsString()
    currency: string;
    
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each:true })
    @Type(()=> PaymentSessionItemDTO )
    items: PaymentSessionItemDTO[];


}

export class PaymentSessionItemDTO{
    @IsString()
    name: string;
    
    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity:number;
}