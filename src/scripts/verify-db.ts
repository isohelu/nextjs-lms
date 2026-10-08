import db from '../lib/db'

console.log('--- ALL USERS IN DB ---')
const users = db.prepare('SELECT id, name, email, role, password, status FROM users').all()
console.log(users)
