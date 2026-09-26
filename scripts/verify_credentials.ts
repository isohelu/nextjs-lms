import { userRepository } from '../src/lib/repositories/userRepository'
import { comparePassword } from '../src/lib/auth/session'

async function run() {
  console.log('Testing Next.js Login Credentials Verification...')
  const testAccounts = [
    { email: 'admin@mentor.test', pass: 'password123' },
    { email: 'admin@mentor.test', pass: 'password' },
    { email: 'admin@mentorlms.com', pass: 'password123' },
    { email: 'admin@admin.com', pass: 'password123' },
    { email: 'instructor@mentor.test', pass: 'password123' },
    { email: 'david@mentor.test', pass: 'password123' },
    { email: 'student@mentor.test', pass: 'password123' },
    { email: 'student@mentor.test', pass: 'password' },
  ]

  let allPassed = true
  for (const acc of testAccounts) {
    const user = userRepository.findByEmail(acc.email)
    if (!user) {
      console.log(`[FAIL] User ${acc.email} NOT FOUND in database!`)
      allPassed = false
      continue
    }
    const matched = await comparePassword(acc.pass, user.password || '')
    console.log(`[${matched ? 'PASS' : 'FAIL'}] ${acc.email} with '${acc.pass}' -> role: ${user.role}, matched: ${matched}`)
    if (!matched) allPassed = false
  }

  if (allPassed) {
    console.log('\n>>> ALL 8 CREDENTIAL CHECKS PASSED PERFECTLY! <<<')
  } else {
    console.log('\n>>> SOME CREDENTIAL CHECKS FAILED! <<<')
  }
}

run()
