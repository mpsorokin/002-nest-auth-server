import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	Validate
} from 'class-validator'

import { IsPasswordsMatchingConstraint } from '../../libs/common/decorators/is-password-matching.decorator'

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email: string

	@IsString()
	@IsNotEmpty()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	password: string

	@IsString()
	@IsNotEmpty()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	@Validate(IsPasswordsMatchingConstraint, {
		message: 'Password must be equal'
	})
	passwordRepeat: string
}
