// Test MongoDB connection script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart-budget';

console.log('🧪 Testing MongoDB Connection...\n');
console.log(`📡 URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}\n`);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(async () => {
  console.log('✅ MongoDB connected successfully!');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  
  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\n📁 Collections (${collections.length}):`);
  if (collections.length > 0) {
    collections.forEach(c => {
      console.log(`   - ${c.name}`);
    });
  } else {
    console.log('   (none - will be created when you add data)');
  }
  
  // Test write operation
  console.log('\n🧪 Testing write operation...');
  const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
  const testDoc = new TestModel({ test: 'connection test' });
  await testDoc.save();
  console.log('✅ Write test successful!');
  
  // Clean up
  await TestModel.deleteOne({ _id: testDoc._id });
  console.log('🧹 Test document cleaned up');
  
  console.log('\n✅ All tests passed! Your MongoDB connection is working.\n');
  process.exit(0);
})
.catch((error) => {
  console.error('\n❌ MongoDB connection failed!\n');
  console.error('Error:', error.message);
  
  if (error.name === 'MongoServerSelectionError') {
    console.error('\n💡 Possible solutions:');
    console.error('   1. Start local MongoDB service');
    console.error('   2. Use MongoDB Atlas (see MONGODB_ATLAS_SETUP.md)');
    console.error('   3. Check MONGODB_URI in .env file');
    console.error('   4. Verify network/firewall settings');
  }
  
  process.exit(1);
});
