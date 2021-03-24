import test from 'ava'
import Accounts from '../modules/accounts.js'

test('REGISTER: register and log in with a valid details', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', 'snowj@gmail.com')
	  const login = await account.login('snowj', 'password')
		test.is(login, true, 'login failed')
	} catch(err) {
		console.log(err.message)
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER: register with duplicate username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', 'snowj@gmail.com')
		await account.register('snowj', 'password', 'snowj@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "snowj" already in use', 'incorrect error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER: register with duplicate email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', 'snowj@gmail.com')
		await account.register('lant', 'parola', 'snowj@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'email address "snowj@gmail.com" already in use', 'incorrect error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER: error - blank username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('', 'password', 'snowj@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER: error - blank password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', '', 'snowj@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER: error - blank email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', '')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN: login with valid username and password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.testSetup()
		const login = await account.login('snewj', 'p455w0rd')
		test.is(login, true, 'unable to log in')
	} catch(err) {
		test.fail('error thrown')
		console.log(err)
	} finally {
		account.close()
	}
})

test('LOGIN: incorrect username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', 'snowj@gmail.com')
		await account.login('sanst', 'password')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "sanst" is incorrect', 'incorrect error thrown')
	} finally {
		account.close()
	}
})

test('LOGIN: incorrect password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('snowj', 'password', 'snowj@gmail.com')
		await account.login('snowj', 'parola')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'incorrect password for user "snowj"', 'incorrect error thrown')
	} finally {
		account.close()
	}
})

test('GET: get ther user\'s id by username', async test => {
	test.plan(1)
	const account = await new Accounts()
	account.testSetup()
	try {
		test.deepEqual(await account.getUserId('snewj'), 1)
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('GET: inexisting username', async test => {
	test.plan(1)
	const account = await new Accounts()
	account.testSetup()
	try {
		await account.getUserId('ivanov')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Inexisting username', 'incorrect error thrown')
	} finally {
		account.close()
	}
})
