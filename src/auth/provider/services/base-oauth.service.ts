import { Injectable } from '@nestjs/common'

import { TypeBaseProviderOptions } from './types/base-provider.options.types'
import { TypeUserInfo } from './types/user-info.types'

@Injectable()
export class BaseOauthService {
	private BASE_URL: string = ''

	constructor(private readonly options: TypeBaseProviderOptions) {}

	protected extractUserInfo(data: any): Promise<TypeUserInfo> {
		return {
			...data,
			provider: this.options.name
		}
	}

	getAuthUrl(): string {
		const query = new URLSearchParams({
			response_type: 'code',
			client_id: this.options.client_id,
			redirect_uri: this.getRedirectUrl(),
			scope: (this.options.scopes ?? []).join(' '),
			access_type: 'offline',
			prompt: 'select_account'
		})

		return `${this.options.authorize_url}?${query}`
	}

	async findUserByCode(code: string): Promise<TypeUserInfo> {
		const { client_id, client_secret } = this.options

		const tokenQuery = new URLSearchParams({
			client_id,
			client_secret,
			redirect_uri: this.getRedirectUrl(),
			grant_type: 'authorization_code'
		})

		const tokenRequest = await fetch(this.options.access_url, {
			method: 'POST',
			body: tokenQuery,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
	}

	getRedirectUrl(): string {
		return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`
	}

	set baseUrl(value: string) {
		this.BASE_URL = value
	}

	get name() {
		return this.options.name
	}

	get access_url() {
		return this.options.access_url
	}

	get profile_url() {
		return this.options.profile_url
	}

	get scopes() {
		return this.options.scopes
	}
}
