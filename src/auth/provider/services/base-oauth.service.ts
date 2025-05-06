import { Injectable } from '@nestjs/common'

import { TypeBaseProviderOptions } from './types/base-provider.options.types'

@Injectable()
export class BaseOauthService {
	private BASE_URL: string = ''

	constructor(private readonly options: TypeBaseProviderOptions) {}

	set baseUrl(value: string) {
		this.BASE_URL = value
	}

	get name() {
		return this.options.name
	}

	get access_url() {
		return this.options.access_url
	}
}
