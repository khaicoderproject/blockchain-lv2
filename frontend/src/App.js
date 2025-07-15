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
import "./index.css";

const ROLE_LABELS = [
  "None",
  "Nhà sản xuất",
  "Đại lý/Cửa hàng",
  "Khách hàng",
  "Trung tâm bảo hành"
];

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
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = ProductLifecycle.networks[networkId];
          if (deployedNetwork) {
            const instance = new web3Instance.eth.Contract(
              ProductLifecycle.abi,
              deployedNetwork.address
            );
            setContract(instance);
            setStatus("Đã kết nối contract trên mạng " + networkId);
            // Lấy role hiện tại
            const r = await instance.methods.roles(accounts[0]).call();
            setRole(Number(r));
          } else {
            setStatus("Chưa deploy contract trên mạng này. Hãy migrate lại!");
          }
        } catch (err) {
          setStatus("Lỗi khi lấy tài khoản từ Metamask: " + err.message);
        }
      } else {
        setStatus("Vui lòng cài đặt Metamask!");
      }
    };
    init();
  }, []);

  return (
    <div className="app-container">
      <h2 style={{textAlign:'center', marginBottom: 8}}>Xác thực đa lớp sản phẩm bằng Blockchain</h2>
      <div className="status-bar">{status}</div>
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