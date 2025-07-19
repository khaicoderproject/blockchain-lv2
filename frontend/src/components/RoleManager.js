import React, { useState, useEffect } from "react";

const ROLE_LABELS = [
  "None",
  "Nhà sản xuất",
  "Đại lý/Cửa hàng",
  "Khách hàng",
  "Trung tâm bảo hành"
];

export default function RoleManager({ contract, account }) {
  const [myRole, setMyRole] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [target, setTarget] = useState("");
  const [role, setRole] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [contractOwner, setContractOwner] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      if (!contract || !account) return;
      try {
        const owner = await contract.methods.owner().call();
        setContractOwner(owner);
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        const r = await contract.methods.roles(account).call();
        setMyRole(Number(r));
        console.log("Role check:", { owner, account, isOwner: owner.toLowerCase() === account.toLowerCase(), role: Number(r) });
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    fetchRole();
  }, [contract, account]);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!contract || !account) return;
      // Chỉ owner mới xem được toàn bộ danh sách role
      const owner = await contract.methods.owner().call();
      if (owner.toLowerCase() !== account.toLowerCase()) return;
      // Giả sử contract có sự kiện RoleGranted, ta sẽ quét event để lấy danh sách address đã được gán role
      try {
        const events = await contract.getPastEvents('RoleGranted', { fromBlock: 0, toBlock: 'latest' });
        // Lấy unique address
        const addresses = [...new Set(events.map(e => e.returnValues.user))];
        const roles = await Promise.all(addresses.map(async addr => {
          const r = await contract.methods.roles(addr).call();
          return { address: addr, role: Number(r) };
        }));
        setRoleList(roles);
      } catch (e) {
        setRoleList([]);
      }
    };
    fetchRoles();
  }, [contract, account]);

  const handleGrant = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    
    if (!target || target.trim() === "") {
      setMsg("Lỗi: Vui lòng nhập địa chỉ!");
      setLoading(false);
      return;
    }
    
    if (!target.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMsg("Lỗi: Địa chỉ không hợp lệ!");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Granting role:", { target, role, account });
      
      const result = await contract.methods.grantRole(target, role).send({ 
        from: account,
        gas: 2000000
      });
      
      console.log("Transaction result:", result);
      setMsg("✅ Phân quyền thành công! Transaction: " + result.transactionHash);
      
      // Refresh role list
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error("Grant role error:", err);
      let errorMsg = "Lỗi: ";
      
      if (err.message.includes("Only contract owner")) {
        errorMsg += "Chỉ owner mới có quyền phân quyền!";
      } else if (err.message.includes("Invalid role")) {
        errorMsg += "Role không hợp lệ!";
      } else if (err.message.includes("User denied")) {
        errorMsg += "Người dùng từ chối giao dịch!";
      } else if (err.message.includes("insufficient funds")) {
        errorMsg += "Không đủ ETH để trả gas!";
      } else {
        errorMsg += err.message;
      }
      
      setMsg(errorMsg);
    }
    setLoading(false);
  };

  // Demo: Danh sách role mẫu (có thể lấy từ props hoặc hardcode cho demo)
  const DEMO_ROLES = [
    { label: 'Manufacturer', desc: 'Tạo sản phẩm, chuyển cho Dealer', color: '#4f8cff', demo: 'Ví admin, tạo sản phẩm' },
    { label: 'Dealer', desc: 'Nhận sản phẩm từ Manufacturer, chuyển cho Customer', color: '#ffb84f', demo: 'Ví đại lý/cửa hàng, nhận/chuyển sản phẩm' },
    { label: 'Customer', desc: 'Nhận sản phẩm từ Dealer, xác thực, bảo hành', color: '#4fcf7f', demo: 'Ví khách hàng, xác thực sản phẩm' },
    { label: 'Warranty Center', desc: 'Nhận sản phẩm từ Customer để bảo hành/sửa chữa', color: '#cf4fff', demo: 'Ví trung tâm bảo hành, ghi nhận bảo hành/sửa chữa' }
  ];

  return (
    <>
      <div className="card" style={{marginBottom:16, padding:16}}>
        <h3>DEMO: Danh sách vai trò & hướng dẫn</h3>
        <table style={{width:'100%', marginTop:8, fontSize:14, background:'#fff', borderRadius:4}}>
          <thead><tr style={{background:'#e3e8ff'}}><th>Role</th><th>Chức năng</th><th>Ghi chú demo</th></tr></thead>
          <tbody>
            {DEMO_ROLES.map((r, idx) => (
              <tr key={r.label}>
                <td style={{color:r.color, fontWeight:600}}>{r.label}</td>
                <td>{r.desc}</td>
                <td>{r.demo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:8, color:'#888', fontSize:13}}>
          <b>Lưu ý:</b> Để demo, admin hãy phân quyền các ví Metamask khác nhau cho từng vai trò, sau đó đăng nhập bằng từng ví để thực hiện các chức năng tương ứng.<br/>
          Nếu chưa có ví mẫu, hãy tạo nhiều account trên Metamask và phân quyền tại đây.
        </div>
      </div>
      <div className="card" style={{marginBottom:16, padding:16}}>
        <h3>Danh sách các address đã được gán role</h3>
        <div style={{color:'#888', fontSize:13, marginBottom:6}}>
          Danh sách này giúp bạn biết ví nào đang giữ vai trò gì để thực hiện giao dịch demo giữa các role. (Tự động cập nhật khi phân quyền mới)
        </div>
        <table style={{width:'100%', marginTop:6, fontSize:14, background:'#fff', borderRadius:4}}>
          <thead><tr style={{background:'#e3e8ff'}}><th>Address</th><th>Role</th></tr></thead>
          <tbody>
            {roleList.length === 0 && <tr><td colSpan={2} style={{color:'#888'}}>Chưa có address nào được gán role.</td></tr>}
            {roleList.map((r, idx) => (
              <tr key={r.address}>
                <td style={{fontFamily:'monospace'}}>{r.address}</td>
                <td>{ROLE_LABELS[r.role]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{marginBottom:16, padding:16}}>
        <h3>Quản lý vai trò</h3>
        <div><b>Địa chỉ của bạn:</b> {account}</div>
        <div><b>Vai trò hiện tại:</b> <span style={{color:'#2563eb', fontWeight:600}}>{ROLE_LABELS[myRole]}</span></div>
        <div><b>Contract Owner:</b> <span style={{fontFamily:'monospace'}}>{contractOwner}</span></div>
        {isOwner ? (
          <>
            <div style={{background:'#d1fae5', color:'#065f46', padding:'8px 12px', borderRadius:'6px', marginBottom:'12px', fontSize:'14px'}}>
              ✅ <strong>Bạn là Owner!</strong> Bạn có quyền phân quyền cho các tài khoản khác.
            </div>
            <form onSubmit={handleGrant} style={{marginTop:12, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center'}}>
              <input 
                placeholder="Địa chỉ tài khoản (0x...)" 
                value={target} 
                onChange={e => setTarget(e.target.value)} 
                type="text" 
                style={{minWidth:'300px'}}
              />
              <select value={role} onChange={e => setRole(Number(e.target.value))}>
                <option value={1}>Nhà sản xuất</option>
                <option value={2}>Đại lý/Cửa hàng</option>
                <option value={3}>Khách hàng</option>
                <option value={4}>Trung tâm bảo hành</option>
              </select>
              <button 
                type="submit" 
                disabled={loading || !target.trim()}
                style={{
                  background: loading || !target.trim() ? '#ccc' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: loading || !target.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? "⏳ Đang phân quyền..." : "🚀 Phân quyền"}
              </button>
            </form>
          </>
        ) : (
          <div style={{background:'#fef3c7', color:'#92400e', padding:'8px 12px', borderRadius:'6px', marginTop:'12px', fontSize:'14px'}}>
            ⚠️ <strong>Bạn không phải Owner!</strong> Chỉ owner mới có quyền phân quyền. 
            <br/>Owner hiện tại: <span style={{fontFamily:'monospace'}}>{contractOwner}</span>
          </div>
        )}
        {msg && <div style={{marginTop:8, padding:'8px 12px', borderRadius:'6px', background: msg.includes('✅') ? '#d1fae5' : '#fef2f2', color: msg.includes('✅') ? '#065f46' : '#dc2626'}}>{msg}</div>}
      </div>
    </>
  );
} 