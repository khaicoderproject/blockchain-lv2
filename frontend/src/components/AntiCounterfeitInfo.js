import React, { useState, useEffect } from "react";

export default function AntiCounterfeitInfo({ contract, account }) {
  const [productId, setProductId] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkProduct = async (e) => {
    if (e) e.preventDefault();
    if (!productId.trim()) {
      setError("Vui lòng nhập mã sản phẩm");
      return;
    }

    setLoading(true);
    setError("");
    setProductInfo(null);

    try {
      const product = await contract.methods.getProduct(productId).call();
      const isSuspicious = await contract.methods.isProductSuspicious(productId).call();
      const suspiciousReason = await contract.methods.getSuspiciousReason(productId).call();
      
      setProductInfo({
        productId: product[0],
        info: product[1],
        currentOwner: product[2],
        historyCount: product[3],
        isSuspicious: product[4],
        suspiciousReason: product[5],
        contractSuspicious: isSuspicious,
        contractReason: suspiciousReason
      });
    } catch (err) {
      setError("Sản phẩm không tồn tại hoặc có lỗi: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="card" style={{marginBottom: 16, padding: 16}}>
      <h3>🔍 Xác thực chống giả mạo</h3>
      <div style={{background:'#f0f9ff', padding:'12px', borderRadius:'6px', marginBottom:'12px', fontSize:'14px'}}>
        <strong>Hệ thống phát hiện giả mạo:</strong><br/>
        • Kiểm tra hoạt động bất thường (quá nhiều giao dịch trong thời gian ngắn)<br/>
        • Phát hiện chuyển giao đáng ngờ (quá nhiều lần trong 1 giờ)<br/>
        • Cảnh báo bảo hành sớm (quá sớm sau khi chuyển giao)<br/>
        • Theo dõi sửa chữa bất thường (quá nhiều lần trong 1 ngày)<br/>
        • Ghi nhận mọi hoạt động trên blockchain (không thể sửa/xóa)
      </div>
      <div style={{background:'#fff3cd', padding:'12px', borderRadius:'6px', marginBottom:'12px', fontSize:'13px', border:'1px solid #ffeaa7'}}>
        <strong>🛡️ Giới hạn bảo mật mới:</strong><br/>
        • <b>Rate Limiting:</b> Tối thiểu 10 giây giữa các action<br/>
        • <b>Warranty Limit:</b> Tối đa 2 lần bảo hành trong 5 phút<br/>
        • <b>Repair Limit:</b> Tối đa 2 lần sửa chữa trong 5 phút, 3 lần/ngày<br/>
        • <b>Activity Limit:</b> Tối đa 20 hoạt động trong 1 giờ<br/>
        • <b>Spam Protection:</b> Tối thiểu 30 giây giữa các action để tránh spam
      </div>

      <form onSubmit={checkProduct} style={{display:'flex', gap:8, marginBottom:12}}>
        <input 
          placeholder="Nhập mã sản phẩm để kiểm tra" 
          value={productId} 
          onChange={e => setProductId(e.target.value)}
          style={{flex:1, padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Đang kiểm tra..." : "🔍 Kiểm tra"}
        </button>
      </form>

      {error && (
        <div style={{background:'#fef2f2', color:'#dc2626', padding:'8px 12px', borderRadius:'6px', marginBottom:'12px'}}>
          ❌ {error}
        </div>
      )}

      {productInfo && (
        <div style={{background:'#f8fafc', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
          <h4 style={{margin:'0 0 12px 0', color:'#1e293b'}}>📋 Thông tin sản phẩm</h4>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
            <div>
              <strong>Mã sản phẩm:</strong> {productInfo.productId}
            </div>
            <div>
              <strong>Thông tin:</strong> {productInfo.info}
            </div>
            <div>
              <strong>Chủ sở hữu hiện tại:</strong> 
              <span style={{fontFamily:'monospace', marginLeft:'4px'}}>
                {productInfo.currentOwner?.slice(0,6)+'...'+productInfo.currentOwner?.slice(-4)}
              </span>
            </div>
            <div>
              <strong>Số lịch sử:</strong> {productInfo.historyCount} records
            </div>
          </div>

          <div style={{
            background: productInfo.isSuspicious || productInfo.contractSuspicious ? '#fef2f2' : '#d1fae5',
            color: productInfo.isSuspicious || productInfo.contractSuspicious ? '#dc2626' : '#065f46',
            padding:'12px',
            borderRadius:'6px',
            border: `2px solid ${productInfo.isSuspicious || productInfo.contractSuspicious ? '#fecaca' : '#a7f3d0'}`
          }}>
            <div style={{fontWeight:'600', marginBottom:'8px'}}>
              {productInfo.isSuspicious || productInfo.contractSuspicious ? '⚠️ CẢNH BÁO: Sản phẩm đáng ngờ!' : '✅ Sản phẩm bình thường'}
            </div>
            
            {(productInfo.isSuspicious || productInfo.contractSuspicious) && (
              <div style={{fontSize:'14px'}}>
                <strong>Lý do:</strong><br/>
                {productInfo.suspiciousReason && <div>• {productInfo.suspiciousReason}</div>}
                {productInfo.contractReason && <div>• {productInfo.contractReason}</div>}
              </div>
            )}
            
            {!(productInfo.isSuspicious || productInfo.contractSuspicious) && (
              <div style={{fontSize:'14px'}}>
                Sản phẩm này chưa có dấu hiệu bất thường. Lịch sử giao dịch hợp lệ.
              </div>
            )}
          </div>

          <div style={{marginTop:'12px', fontSize:'13px', color:'#64748b'}}>
            <strong>🔒 Bảo mật:</strong> Thông tin này được lưu trữ trên blockchain Ethereum, 
            không thể bị sửa đổi hoặc xóa bỏ. Mọi giao dịch đều được ghi nhận vĩnh viễn.
          </div>
        </div>
      )}
    </div>
  );
} 