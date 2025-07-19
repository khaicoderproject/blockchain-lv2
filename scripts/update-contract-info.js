const fs = require('fs');
const path = require('path');

// Đường dẫn file
const buildContractPath = path.join(__dirname, '../build/contracts/ProductLifecycle.json');
const frontendContractPath = path.join(__dirname, '../frontend/src/contracts/ProductLifecycle.json');

try {
  // Đọc file build
  const buildContract = JSON.parse(fs.readFileSync(buildContractPath, 'utf8'));
  
  // Kiểm tra networks
  if (!buildContract.networks || !buildContract.networks['5777']) {
    console.error('❌ Contract chưa được deploy trên network 5777!');
    console.log('Hãy chạy: npx truffle migrate --reset');
    process.exit(1);
  }
  
  const contractAddress = buildContract.networks['5777'].address;
  console.log('✅ Contract Address:', contractAddress);
  
  // Copy toàn bộ file build sang frontend
  fs.writeFileSync(frontendContractPath, JSON.stringify(buildContract, null, 2));
  console.log('✅ Đã cập nhật contract info sang frontend');
  
  // Tạo file contract-info.json để dễ truy cập
  const contractInfo = {
    address: contractAddress,
    networkId: '5777',
    deployedAt: new Date().toISOString(),
    transactionHash: buildContract.networks['5777'].transactionHash
  };
  
  const contractInfoPath = path.join(__dirname, '../contract-info.json');
  fs.writeFileSync(contractInfoPath, JSON.stringify(contractInfo, null, 2));
  console.log('✅ Đã tạo file contract-info.json');
  
  console.log('\n🎉 Cập nhật thành công!');
  console.log('📋 Thông tin contract:');
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Network: 5777 (Ganache)`);
  console.log(`   Transaction: ${buildContract.networks['5777'].transactionHash}`);
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
} 