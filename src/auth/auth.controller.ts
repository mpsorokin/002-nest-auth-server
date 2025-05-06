import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req
} from '@nestjs/common'
import { Request } from 'express'

import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.OK)
	register(@Req() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto)
	}
}
