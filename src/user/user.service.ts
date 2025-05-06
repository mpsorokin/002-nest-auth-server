import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			include: {
				accounts: true
			}
		})

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`)
		}

		return user
	}

	async findByEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: { email },
			include: {
				accounts: true
			}
		})

		return user
	}

	async create() {}
}
