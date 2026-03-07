import { IsString, IsEmail, MinLength, IsInt, IsOptional } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  mot_de_passe?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;
}