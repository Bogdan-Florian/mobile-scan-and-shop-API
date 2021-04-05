import Base64 from 'Base64'

export function extractCredentials(token) {
	console.log('checkAuth')
	if(token === undefined) throw new Error('no auth header')
	const [type, hash] = token.split(' ')
	console.log(`${type} : ${hash}`)
	if(type !== 'Basic') throw new Error('wrong auth type')
	const str = Base64.atob(hash)
	console.log(str)
	if(str.indexOf(':') === -1) throw new Error('invalid auth format')
	const [username, password] = str.split(':')
	console.log(username)
	console.log(password)
	return { username, password }
}
