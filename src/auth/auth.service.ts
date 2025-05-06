import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { verify } from 'argon2'
import { Request } from 'express'

import { AuthMethod, User } from '../../generated/prisma'
import { UserService } from '../user/user.service'

import { LoginDto } from './dto/login.dto'
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

		return this.saveSession(req, newUser)
	}

	async login(req: Request, dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await verify(user.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Incorrect password')
		}
	}

	async logout() {}

	private async saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException('Unable to save session')
					)
				}

				resolve({ user })
			})
		})
	}
}
