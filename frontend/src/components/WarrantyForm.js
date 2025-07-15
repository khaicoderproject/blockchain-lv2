import React, { useState } from "react";

export default function WarrantyForm({ contract, account }) {
  const [productId, setProductId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleWarranty = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!productId) {
      setError("Vui lòng nhập mã sản phẩm.");
      return;
    }
    setLoading(true);
    try {
      await contract.methods.warrantyProduct(productId, note || "").send({ from: account });
      setSuccess("Ghi nhận bảo hành thành công!");
      setProductId("");
      setNote("");
    } catch (err) {
      setError(err.message);
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
      <form onSubmit={handleWarranty}>
        <h3>Ghi nhận bảo hành</h3>
        <div style={{background:'#f0f4ff',padding:8,marginBottom:8,borderRadius:4,fontSize:14}}>
          <b>Flow bảo hành:</b> Bạn phải là <b>chủ sở hữu sản phẩm</b> và có vai trò <b>Trung tâm bảo hành</b> mới ghi nhận bảo hành được.<br/>
          Nếu không đúng, hệ thống sẽ báo lỗi cụ thể.
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:8}}>
          <input placeholder="Mã sản phẩm" value={productId} onChange={e => setProductId(e.target.value)} type="text" />
          <input placeholder="Ghi chú (tuỳ chọn)" value={note} onChange={e => setNote(e.target.value)} type="text" />
          <button type="submit" disabled={loading}>{loading ? "Đang ghi..." : "Ghi nhận bảo hành"}</button>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </>
  );
} 