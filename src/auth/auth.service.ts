import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import { Request, Response } from 'express'

import { AuthMethod, User } from '../../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'
import { UserService } from '../user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ProviderService } from './provider/provider.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly providerService: ProviderService,
		private readonly prismaService: PrismaService
	) {}
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

		return this.saveSession(req, user)
	}

	async extractProfileFromCode(req: Request, provider: string, code: string) {
		const providerInstance = this.providerService.findByService(provider)

		const profile = await providerInstance?.findUserByCode(code)

		if (!profile) {
			throw new NotFoundException('User not found')
		}

		const account = await this.prismaService.account.findFirst({
			where: {
				id: profile.id,
				provider: profile.provider
			}
		})

		let user = account?.userId
			? await this.userService.findById(account.userId)
			: null

		if (user) {
			return this.saveSession(req, user)
		}

		user = await this.userService.create(
			profile.email,
			'',
			profile.name,
			profile.picture,
			AuthMethod[profile.provider.toUpperCase()],
			true
		)

		if (!account) {
			await this.prismaService.account.create({
				data: {
					userId: user.id,
					type: 'oauth',
					provider: profile.provider,
					accessToken: profile.access_token,
					refreshToken: profile.refresh_token,
					expiresAt: profile.expires_at || 0
				}
			})
		}

		return this.saveSession(req, user)
	}

	async logout(req: Request, res: Response): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException('Unable to delete session')
					)
				}

				res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
				resolve()
			})
		})
	}

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
