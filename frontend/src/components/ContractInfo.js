import React from 'react';

export default function ContractInfo() {
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
        <div style={{fontFamily: 'monospace', fontSize: '12px'}}>0x2a3d836D824fc45Abd3dCa9124E9bb69b80D1b46</div>
        
        <div><strong>Network ID:</strong></div>
        <div>5777 (Ganache)</div>
        
        <div><strong>RPC URL:</strong></div>
        <div>http://127.0.0.1:7545</div>
        
        <div><strong>Chain ID:</strong></div>
        <div>0x1691 (5777 in hex)</div>
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
        <strong>💡 Tip:</strong> If you see "Returned values aren't valid" error, 
        it means the contract address or network is incorrect. 
        Make sure you're connected to the right network and the contract is deployed.
      </div>
    </div>
  );
} 