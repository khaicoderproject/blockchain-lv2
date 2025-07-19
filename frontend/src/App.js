import React, { useState, useEffect } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import ProductLifecycle from "./contracts/ProductLifecycle.json";
import ProductForm from "./components/ProductForm";
import TransferForm from "./components/TransferForm";
import WarrantyForm from "./components/WarrantyForm";
import RepairForm from "./components/RepairForm";
import HistoryViewer from "./components/HistoryViewer";
import RoleManager from "./components/RoleManager";
import ContractInfo from "./components/ContractInfo";
import "./index.css";

const ROLE_LABELS = [
  "None",
  "Nhà sản xuất",
  "Đại lý/Cửa hàng",
  "Khách hàng",
  "Trung tâm bảo hành"
];

// Contract address cứng - cập nhật sau khi deploy
const CONTRACT_ADDRESS = "0x2a3d836D824fc45Abd3dCa9124E9bb69b80D1b46";
const NETWORK_ID = 5777;

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [status, setStatus] = useState("Đang kết nối Metamask...");
  const [role, setRole] = useState(0);
  useEffect(() => {
    const init = async () => {
      setStatus("Đang kiểm tra Metamask...");
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        try {
          const accounts = await web3Instance.eth.requestAccounts();
          setAccount(accounts[0]);
          setStatus("Đã kết nối: " + accounts[0]);
        } catch (err) {
          console.error("Error:", err);
          setStatus("Lỗi khi lấy tài khoản từ Metamask: " + err.message);
        }
      } else {
        setStatus("Vui lòng cài đặt Metamask!");
      }
    };
    init();
  }, []);

  // Load contract khi web3 và account đã sẵn sàng
  useEffect(() => {
    const loadContract = async () => {
      if (!web3 || !account) return;

      try {
        const networkId = await web3.eth.net.getId();
        console.log("Current Network ID:", networkId);
        
        if (networkId !== NETWORK_ID) {
          setStatus(`Sai network. Cần network ${NETWORK_ID} (Ganache), hiện tại: ${networkId}`);
          return;
        }
        
        console.log("Creating contract instance with address:", CONTRACT_ADDRESS);
        const instance = new web3.eth.Contract(
          ProductLifecycle.abi,
          CONTRACT_ADDRESS
        );
        
        // Test contract connection với timeout
        try {
          const ownerPromise = instance.methods.owner().call();
          const owner = await Promise.race([
            ownerPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Contract call timeout')), 10000)
            )
          ]);
          
          console.log("Contract owner:", owner);
          
          setContract(instance);
          setStatus("Đã kết nối contract thành công!");
          
          // Lấy role hiện tại
          const r = await instance.methods.roles(account).call();
          setRole(Number(r));
          console.log("User role:", Number(r));
        } catch (contractError) {
          console.error("Contract test failed:", contractError);
          
          // Thử kết nối trực tiếp với Ganache
          try {
            console.log("Trying direct Ganache connection...");
            const directWeb3 = new Web3('http://127.0.0.1:7545');
            const directInstance = new directWeb3.eth.Contract(
              ProductLifecycle.abi,
              CONTRACT_ADDRESS
            );
            
            const owner = await directInstance.methods.owner().call();
            console.log("Direct connection owner:", owner);
            
            setContract(directInstance);
            setStatus("Đã kết nối contract qua Ganache trực tiếp!");
            
            const r = await directInstance.methods.roles(account).call();
            setRole(Number(r));
            console.log("User role (direct):", Number(r));
          } catch (directError) {
            console.error("Direct connection also failed:", directError);
            setStatus("Lỗi khi test contract: " + contractError.message + " | Direct: " + directError.message);
          }
        }
      } catch (err) {
        console.error("Contract loading error:", err);
        setStatus("Lỗi khi load contract: " + err.message);
      }
    };

    loadContract();
  }, [web3, account]);

  return (
    <div className="app-container">
      <h2 style={{textAlign:'center', marginBottom: 8}}>Xác thực đa lớp sản phẩm bằng Blockchain</h2>
      <div className="status-bar">{status}</div>
      
      <ContractInfo />
      
      {contract && account ? (
        <>
          <RoleManager contract={contract} account={account} />
          <div style={{marginBottom:12}}><b>Vai trò hiện tại:</b> <span style={{color:'#2563eb', fontWeight:600}}>{ROLE_LABELS[role]}</span></div>
          {role === 1 && <div className="card"><ProductForm contract={contract} account={account} /></div>}
          {(role === 1 || role === 2) && <div className="card"><TransferForm contract={contract} account={account} /></div>}
          {role === 4 && <div className="card"><WarrantyForm contract={contract} account={account} /></div>}
          {role === 4 && <div className="card"><RepairForm contract={contract} account={account} /></div>}
          <div className="card"><HistoryViewer contract={contract} account={account} /></div>
        </>
      ) : (
        <div style={{margin:'32px 0', color:'#888', textAlign:'center'}}>Đang kết nối hoặc chưa sẵn sàng...</div>
      )}
      <div style={{marginTop:32, fontSize:13, color:'#888', textAlign:'center'}}>
        <b>Hệ thống ghi nhận mọi giao dịch, bảo hành, sửa chữa lên blockchain.<br/>Lịch sử minh bạch, không thể sửa/xóa. Smart contract tự động cảnh báo bất thường.</b>
      </div>
    </div>
  );
}

export default App; 