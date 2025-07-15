import React, { useState, useEffect } from "react";

export default function TransferForm({ contract, account, userRole: userRoleProp }) {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState(userRoleProp || 2); // default Dealer

  useEffect(() => {
    const fetchRole = async () => {
      if (contract && account) {
        try {
          const r = await contract.methods.roles(account).call();
          setUserRole(Number(r));
        } catch {}
      }
    };
    if (!userRoleProp) fetchRole();
  }, [contract, account, userRoleProp]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!productId || !to) {
      setError("Vui lòng nhập mã sản phẩm và địa chỉ người nhận.");
      return;
    }
    setLoading(true);
    try {
      await contract.methods.transferProduct(productId, to, note || "").send({ from: account });
      setSuccess("Chuyển giao thành công!");
      setProductId("");
      setTo("");
      setNote("");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const roleFlow = [
    { label: 'Manufacturer', desc: 'Tạo sản phẩm', color: '#4f8cff' },
    { label: 'Dealer', desc: 'Chuyển giao', color: '#ffb84f' },
    { label: 'Customer', desc: 'Sở hữu, xác thực, gửi bảo hành', color: '#4fcf7f' },
    { label: 'Warranty Center', desc: 'Bảo hành, sửa chữa', color: '#cf4fff' }
  ];
  return (
    <>
      <div style={{marginBottom:16}}>
        <div style={{background:'#e3e8ff',padding:12,borderRadius:8,marginBottom:8}}>
          <b>Product Lifecycle Flow:</b>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:8}}>
            {roleFlow.map((role, idx) => (
              <React.Fragment key={role.label}>
                <div style={{textAlign:'center', opacity: userRole===3? (idx===2?1:0.4) : (idx===1?1:0.4)}} title={role.desc}>
                  <div style={{background:role.color,color:'#fff',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontWeight:'bold',fontSize:18,border:(userRole===3&&idx===2)||(userRole!==3&&idx===1)?'2px solid #222':'none'}}>{idx+1}</div>
                  <div style={{marginTop:4}}><b>{role.label}</b><br/><span style={{fontSize:12}}>{role.desc}</span></div>
                </div>
                {idx<roleFlow.length-1 && <div style={{fontSize:24,opacity:0.4}}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        {userRole===3 && (
          <div style={{background:'#f0f4ff',padding:8,marginBottom:8,borderRadius:4,fontSize:14}}>
            <b>Hướng dẫn cho Customer:</b> Bạn chỉ có thể chuyển sản phẩm cho <b>Trung tâm bảo hành</b> để bảo hành.<br/>
            Vui lòng nhập đúng địa chỉ ví của Warranty Center.
          </div>
        )}
      </div>
      <form onSubmit={handleTransfer}>
        <h3>Chuyển giao sản phẩm</h3>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:8}}>
          <input placeholder="Mã sản phẩm" value={productId} onChange={e => setProductId(e.target.value)} type="text" />
          <input placeholder="Địa chỉ người nhận" value={to} onChange={e => setTo(e.target.value)} type="text" />
          <input placeholder="Ghi chú (tuỳ chọn)" value={note} onChange={e => setNote(e.target.value)} type="text" />
          <button type="submit" disabled={loading}>{loading ? "Đang chuyển..." : "Chuyển giao"}</button>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </>
  );
} 