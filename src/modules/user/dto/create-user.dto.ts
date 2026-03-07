import { IsString, IsEmail, MinLength, IsInt } from "class-validator";

export class CreateUserDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  mot_de_passe!: string;

  @IsInt()
  roleId!: number;
}