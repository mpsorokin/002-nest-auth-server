import { Injectable } from '@nestjs/common'

import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	async register(dto: RegisterDto) {}

	async login() {}

	async logout() {}

	private async saveSession() {}
}
