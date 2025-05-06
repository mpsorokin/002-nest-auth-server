import { ConflictException, Injectable } from '@nestjs/common'
import { Request } from 'express'

import { AuthMethod, User } from '../../generated/prisma'
import { UserService } from '../user/user.service'

import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}
	async register(req: Request, dto: RegisterDto) {
		const isExists = await this.userService.findByEmail(dto.email)

		if (isExists) {
			throw new ConflictException('Email already exists')
		}

		const newUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.name,
			'',
			AuthMethod.CREDENTIALS,
			false
		)

		await this.saveSession(req, newUser)
		return newUser
	}

	async login() {}

	async logout() {}

	private async saveSession(req: Request, user: User) {
		console.log('Session saved with user:', user)
	}
}
