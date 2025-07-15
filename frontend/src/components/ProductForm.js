import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ProductForm({ contract, account, onProductCreated }) {
  const [productId, setProductId] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQRValue] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowQR(false);
    if (!productId || !productInfo) {
      setError("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }
    setLoading(true);
    try {
      await contract.methods.createProduct(productId, productInfo).send({ from: account });
      setSuccess("Tạo sản phẩm thành công!");
      setQRValue(productId);
      setShowQR(true);
      setProductId("");
      setProductInfo("");
      if (onProductCreated) onProductCreated(productId);
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
                <div style={{textAlign:'center', opacity: idx===0?1:0.4}} title={role.desc}>
                  <div style={{background:role.color,color:'#fff',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontWeight:'bold',fontSize:18,border:idx===0?'2px solid #222':'none'}}>{idx+1}</div>
                  <div style={{marginTop:4}}><b>{role.label}</b><br/><span style={{fontSize:12}}>{role.desc}</span></div>
                </div>
                {idx<roleFlow.length-1 && <div style={{fontSize:24,opacity:0.4}}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={handleCreate}>
        <h3>Tạo sản phẩm mới</h3>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:8}}>
          <input className="" placeholder="Mã sản phẩm" value={productId} onChange={e => setProductId(e.target.value)} type="text" />
          <input className="" placeholder="Thông tin sản phẩm" value={productInfo} onChange={e => setProductInfo(e.target.value)} type="text" />
          <button type="submit" disabled={loading}>{loading ? "Đang tạo..." : "Tạo sản phẩm"}</button>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        {showQR && qrValue && (
          <div style={{marginTop:12, textAlign:'center'}}>
            <div><b>Mã QR sản phẩm:</b></div>
            <QRCodeCanvas value={qrValue} size={128} />
            <div style={{fontSize:13, color:'#888', marginTop:4}}>{qrValue}</div>
          </div>
        )}
      </form>
    </>
  );
} 