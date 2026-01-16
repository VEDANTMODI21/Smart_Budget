// Script to generate a secure JWT secret key
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');
console.log('\n' + '='.repeat(60));
console.log('🔐 Generated JWT Secret Key:');
console.log('='.repeat(60));
console.log(secret);
console.log('='.repeat(60));
console.log('\n📝 Add this to your .env file as:');
console.log(`JWT_SECRET=${secret}\n`);
