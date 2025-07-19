import React, { useState, useEffect } from 'react';
import ProductLifecycle from "../contracts/ProductLifecycle.json";

export default function ContractInfo() {
  const [contractInfo, setContractInfo] = useState(null);

  useEffect(() => {
    const getContractInfo = () => {
      try {
        const networkId = '5777';
        const network = ProductLifecycle.networks[networkId];
        
        if (network) {
          setContractInfo({
            address: network.address,
            transactionHash: network.transactionHash,
            networkId: networkId,
            deployed: true
          });
        } else {
          setContractInfo({ 
            error: 'Contract chưa được deploy trên network 5777',
            deployed: false
          });
        }
      } catch (error) {
        setContractInfo({ 
          error: 'Lỗi khi đọc thông tin contract',
          deployed: false
        });
      }
    };

    getContractInfo();
  }, []);

  if (!contractInfo) {
    return (
      <div style={{
        background: '#e8f4fd',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>
        <h4 style={{margin: '0 0 12px 0', color: '#0c5460'}}>📋 Contract Information</h4>
        <div>Đang tải thông tin contract...</div>
      </div>
    );
  }

  if (!contractInfo.deployed) {
    return (
      <div style={{
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>
        <h4 style={{margin: '0 0 12px 0', color: '#721c24'}}>❌ Contract Information</h4>
        <div style={{color:'#721c24', marginBottom:'12px'}}>{contractInfo.error}</div>
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '13px'
        }}>
          <h5 style={{margin: '0 0 8px 0', color: '#856404'}}>🔧 Để deploy contract:</h5>
          <ol style={{margin: 0, paddingLeft: '20px'}}>
            <li>Chạy: <code>npm run deploy</code></li>
            <li>Hoặc: <code>npx truffle migrate --reset</code></li>
            <li>Sau đó chạy: <code>npm run update-contract</code></li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#e8f4fd',
      border: '1px solid #bee5eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      fontSize: '14px'
    }}>
      <h4 style={{margin: '0 0 12px 0', color: '#0c5460'}}>📋 Contract Information</h4>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px'}}>
        <div><strong>Contract Address:</strong></div>
        <div style={{fontFamily: 'monospace', fontSize: '12px'}}>{contractInfo.address}</div>
        
        <div><strong>Network ID:</strong></div>
        <div>5777 (Ganache)</div>
        
        <div><strong>RPC URL:</strong></div>
        <div>http://127.0.0.1:7545</div>
        
        <div><strong>Chain ID:</strong></div>
        <div>0x1691 (5777 in hex)</div>
        
        <div><strong>Status:</strong></div>
        <div style={{color: '#059669', fontWeight: '600'}}>✅ Deployed</div>
      </div>
      
      <div style={{
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '6px',
        padding: '8px',
        marginTop: '12px',
        fontSize: '12px'
      }}>
        <strong>🔗 Transaction:</strong> <span style={{fontFamily: 'monospace'}}>{contractInfo.transactionHash}</span>
      </div>
      
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '12px'
      }}>
        <h5 style={{margin: '0 0 8px 0', color: '#856404'}}>🔧 Setup Instructions:</h5>
        <ol style={{margin: 0, paddingLeft: '20px', fontSize: '13px'}}>
          <li>Make sure Ganache is running on port 7545</li>
          <li>In Metamask, add network Ganache with Chain ID: 0x1691</li>
          <li>Connect Metamask to Ganache network</li>
          <li>Import account from Ganache to Metamask</li>
          <li>Refresh this page</li>
        </ol>
      </div>
      
      <div style={{
        background: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '6px',
        padding: '8px',
        marginTop: '12px',
        fontSize: '12px'
      }}>
        <strong>💡 Tip:</strong> Contract address được lấy tự động từ ABI. 
        Nếu deploy lại contract, chạy <code>npm run update-contract</code> để cập nhật.
      </div>
    </div>
  );
} 