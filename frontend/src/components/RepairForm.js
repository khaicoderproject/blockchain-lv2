import React, { useState } from "react";

export default function RepairForm({ contract, account }) {
  const [productId, setProductId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRepair = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!productId) {
      setError("Vui lòng nhập mã sản phẩm.");
      return;
    }
    setLoading(true);
    try {
      // Thử với gas limit cao hơn và gas price
      const result = await contract.methods.repairProduct(productId, note || "").send({ 
        from: account,
        gas: 500000, // Tăng gas limit
        gasPrice: '20000000000' // 20 Gwei
      });
      
      console.log("Repair transaction:", result);
      setSuccess("Ghi nhận sửa chữa thành công! Transaction: " + result.transactionHash);
      setProductId("");
      setNote("");
    } catch (err) {
      console.error("Repair error:", err);
      let errorMsg = "Lỗi: ";
      
      if (err.message.includes("Only contract owner")) {
        errorMsg += "Chỉ owner mới có quyền này!";
      } else if (err.message.includes("Your role is not allowed")) {
        errorMsg += "Bạn không có vai trò Trung tâm bảo hành!";
      } else if (err.message.includes("You are not the product owner")) {
        errorMsg += "Bạn không phải chủ sở hữu sản phẩm này!";
      } else if (err.message.includes("Product does not exist")) {
        errorMsg += "Sản phẩm không tồn tại!";
      } else if (err.message.includes("User denied")) {
        errorMsg += "Người dùng từ chối giao dịch!";
      } else if (err.message.includes("insufficient funds")) {
        errorMsg += "Không đủ ETH để trả gas!";
      } else if (err.message.includes("Action too frequent")) {
        errorMsg += "Hành động quá nhanh! Vui lòng đợi ít nhất 10 giây giữa các lần thực hiện.";
      } else if (err.message.includes("Internal JSON-RPC error") || err.message.includes("connection")) {
        errorMsg += "Lỗi kết nối blockchain. Vui lòng kiểm tra Ganache và thử lại!";
      } else if (err.message.includes("gas")) {
        errorMsg += "Lỗi gas. Vui lòng thử lại với gas limit cao hơn!";
      } else {
        errorMsg += err.message;
      }
      
      setError(errorMsg);
    }
    setLoading(false);
  };

  const roleFlow = [
    { label: 'Manufacturer', desc: 'Tạo sản phẩm', color: '#4f8cff' },
    { label: 'Dealer', desc: 'Nhận & phân phối', color: '#ffb84f' },
    { label: 'Customer', desc: 'Sở hữu, xác thực', color: '#4fcf7f' },
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
                <div style={{textAlign:'center', opacity: idx===3?1:0.4}} title={role.desc}>
                  <div style={{background:role.color,color:'#fff',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontWeight:'bold',fontSize:18,border:idx===3?'2px solid #222':'none'}}>{idx+1}</div>
                  <div style={{marginTop:4}}><b>{role.label}</b><br/><span style={{fontSize:12}}>{role.desc}</span></div>
                </div>
                {idx<roleFlow.length-1 && <div style={{fontSize:24,opacity:0.4}}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={handleRepair}>
        <h3>Ghi nhận sửa chữa</h3>
        <div style={{background:'#f0f4ff',padding:8,marginBottom:8,borderRadius:4,fontSize:14}}>
          <b>Flow sửa chữa:</b> Bạn phải là <b>chủ sở hữu sản phẩm</b> và có vai trò <b>Trung tâm bảo hành</b> mới ghi nhận sửa chữa được.<br/>
          Nếu không đúng, hệ thống sẽ báo lỗi cụ thể.
        </div>
        <div style={{background:'#fff3cd',padding:8,marginBottom:8,borderRadius:4,fontSize:13,border:'1px solid #ffeaa7'}}>
          <b>⚠️ Giới hạn bảo mật:</b><br/>
          • Tối thiểu <b>10 giây</b> giữa các action<br/>
          • Tối đa <b>2 lần sửa chữa</b> trong 5 phút<br/>
          • Tối đa <b>3 lần sửa chữa</b> trong 1 ngày<br/>
          • Tối đa <b>20 hoạt động</b> trong 1 giờ<br/>
          • Tối thiểu <b>30 giây</b> giữa các action để tránh spam
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:8}}>
          <input placeholder="Mã sản phẩm" value={productId} onChange={e => setProductId(e.target.value)} type="text" />
          <input placeholder="Ghi chú (tuỳ chọn)" value={note} onChange={e => setNote(e.target.value)} type="text" />
          <button type="submit" disabled={loading}>{loading ? "Đang ghi..." : "Ghi nhận sửa chữa"}</button>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </>
  );
} 