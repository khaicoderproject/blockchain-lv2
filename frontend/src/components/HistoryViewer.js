import React, { useState } from "react";
import QrReader from "react-qr-reader";

export default function HistoryViewer({ contract, account }) {
  const [productId, setProductId] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scan, setScan] = useState(false);
  const [warning, setWarning] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [showWarranty, setShowWarranty] = useState(false);
  const [warrantyNote, setWarrantyNote] = useState("");
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [warrantyError, setWarrantyError] = useState("");
  const [warrantySuccess, setWarrantySuccess] = useState("");
  const [userRole, setUserRole] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [warrantyCenters, setWarrantyCenters] = useState([]);
  const [selectedWarranty, setSelectedWarranty] = useState("");

  // Lấy role và kiểm tra chủ sở hữu
  React.useEffect(() => {
    const fetchRoleAndOwner = async () => {
      if (contract && account && productId) {
        try {
          const r = await contract.methods.roles(account).call();
          setUserRole(Number(r));
          const p = await contract.methods.products(productId).call();
          setIsOwner(p.currentOwner && p.currentOwner.toLowerCase() === account.toLowerCase());
        } catch {}
      }
    };
    fetchRoleAndOwner();
  }, [contract, account, productId]);

  // Tìm tất cả địa chỉ Warranty Center trong hệ thống (demo)
  React.useEffect(() => {
    const fetchWarrantyCenters = async () => {
      if (contract) {
        try {
          const events = await contract.getPastEvents('RoleGranted', { fromBlock: 0, toBlock: 'latest' });
          const addrs = [...new Set(events.filter(e => Number(e.returnValues.role) === 4).map(e => e.returnValues.user))];
          // Kiểm tra lại role hiện tại qua contract.roles[address]
          const validAddrs = [];
          for (let addr of addrs) {
            try {
              const r = await contract.methods.roles(addr).call();
              if (Number(r) === 4) validAddrs.push(addr);
            } catch {}
          }
          setWarrantyCenters(validAddrs);
          setSelectedWarranty(validAddrs[0] || "");
        } catch {}
      }
    };
    fetchWarrantyCenters();
  }, [contract]);

  // Thêm log debug
  React.useEffect(() => {
    console.log('DEBUG:', { userRole, isOwner, warrantyCenters, account, productId });
  }, [userRole, isOwner, warrantyCenters, account, productId]);

  const handleGetHistory = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setWarning("");
    setHistory([]);
    if (!productId) {
      setError("Vui lòng nhập hoặc quét mã sản phẩm.");
      return;
    }
    setLoading(true);
    try {
      const len = await contract.methods.getProductHistoryLength(productId).call();
      let his = [];
      let abnormal = false;
      for (let i = 0; i < len; i++) {
        const rec = await contract.methods.getProductHistoryRecord(productId, i).call();
        his.push(rec);
        if (rec[0] === "Transferred" && (rec[4] === "0x0000000000000000000000000000000000000000" || rec[4] === rec[1])) {
          abnormal = true;
        }
      }
      setHistory(his);
      if (abnormal) setWarning("Cảnh báo: Phát hiện chuyển giao bất thường!");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleScan = (data) => {
    if (data) {
      setProductId(data);
      setScan(false);
    }
  };

  const handleSendWarranty = async (e) => {
    e.preventDefault();
    setWarrantyError("");
    setWarrantySuccess("");
    setWarrantyLoading(true);
    try {
      await contract.methods.transferProduct(productId, selectedWarranty, warrantyNote).send({ from: account });
      setWarrantySuccess("Đã gửi sản phẩm cho Trung tâm bảo hành!");
      setShowWarranty(false);
      setWarrantyNote("");
      setTimeout(()=>handleGetHistory(), 1000);
    } catch (err) {
      let message = "Transaction failed";
      if (err && err.message) {
        const match = err.message.match(/revert\\s(.+?)([\"'])/);
        if (match && match[1]) message = match[1];
        else message = err.message;
      }
      setWarrantyError(message);
    }
    setWarrantyLoading(false);
  };

  return (
    <div>
      <h3>Lịch sử sản phẩm & cảnh báo</h3>
      <div style={{background:'#f0f4ff',padding:8,marginBottom:8,borderRadius:4,fontSize:14}}>
        <b>Hướng dẫn cho Customer:</b> Bạn có thể nhập hoặc quét mã sản phẩm để xác thực nguồn gốc, kiểm tra lịch sử chuyển giao, và phát hiện bất thường.<br/>
        Nếu sản phẩm có vấn đề, hãy chuyển cho Trung tâm bảo hành để được hỗ trợ.
      </div>
      {/* Nút gửi bảo hành cho Customer là chủ sở hữu */}
      {userRole === 3 && isOwner && (
        <div style={{marginBottom:12}}>
          {warrantyCenters.length === 0 ? (
            <div style={{background:'#fff3cd',color:'#856404',padding:8,borderRadius:4,marginBottom:8}}>
              <b>Không có Trung tâm bảo hành hợp lệ!</b><br/>
              Vui lòng yêu cầu admin phân quyền một ví làm Warranty Center để có thể gửi bảo hành.
            </div>
          ) : (
            <>
              <button onClick={()=>setShowWarranty(v=>!v)} style={{background:'#f59e42',color:'#fff',padding:'8px 16px',border:'none',borderRadius:4,fontWeight:600}}>
                {showWarranty ? "Hủy" : "Gửi bảo hành"}
              </button>
              {showWarranty && (
                <form onSubmit={handleSendWarranty} style={{marginTop:8,background:'#fff7e6',padding:12,borderRadius:6}}>
                  <div><b>Gửi sản phẩm cho Trung tâm bảo hành:</b></div>
                  <div style={{fontSize:13,margin:'8px 0'}}>Chọn Warranty Center:
                    <select value={selectedWarranty} onChange={e=>setSelectedWarranty(e.target.value)} style={{marginLeft:8}}>
                      {warrantyCenters.map(addr => (
                        <option key={addr} value={addr}>{addr}</option>
                      ))}
                    </select>
                  </div>
                  <input placeholder="Ghi chú (lý do bảo hành)" value={warrantyNote} onChange={e=>setWarrantyNote(e.target.value)} style={{width:'100%',marginBottom:8}} />
                  <button type="submit" disabled={warrantyLoading || !selectedWarranty}>{warrantyLoading ? "Đang gửi..." : "Xác nhận gửi bảo hành"}</button>
                  {warrantyError && <div className="error">{warrantyError}</div>}
                  {warrantySuccess && <div className="success">{warrantySuccess}</div>}
                </form>
              )}
            </>
          )}
        </div>
      )}
      <form onSubmit={handleGetHistory} style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:8}}>
        <input placeholder="Mã sản phẩm" value={productId} onChange={e => setProductId(e.target.value)} type="text" />
        <button type="button" onClick={() => setScan(!scan)}>{scan ? "Tắt quét QR" : "Quét QR"}</button>
        <button type="submit" disabled={loading}>{loading ? "Đang truy vấn..." : "Xem lịch sử"}</button>
        {history.length > 0 && (
          <button type="button" style={{background:viewMode==="table"?"#2563eb":"#e0e7ff", color:viewMode==="table"?"#fff":"#2563eb"}} onClick={()=>setViewMode(viewMode==="table"?"timeline":"table")}>{viewMode==="table"?"Xem timeline":"Xem bảng"}</button>
        )}
      </form>
      {scan && <div style={{marginTop:8}}><QrReader delay={300} onError={console.error} onScan={handleScan} style={{ width: '300px' }} /></div>}
      {error && <div className="error">{error}</div>}
      {warning && <div className="warning">{warning}</div>}
      {history && history.length > 0 && viewMode==="table" && (
        <table className="table-history">
          <thead><tr><th>Hành động</th><th>Người thực hiện</th><th>Thời gian</th><th>Ghi chú</th><th>Chủ sở hữu mới</th></tr></thead>
          <tbody>
            {history.map((rec, idx) => (
              <tr key={idx}>
                <td style={{fontWeight:700, color:rec[0]==='Created'?'#059669':rec[0]==='Transferred'?'#2563eb':rec[0]==='Warranty'?'#f59e42':rec[0]==='Repair'?'#f43f5e':'#222', textAlign:'center'}}>
                  {rec[0]==='Created'? '🟢': rec[0]==='Transferred'? '🔄': rec[0]==='Warranty'? '🛠️': rec[0]==='Repair'? '🔧':'❓'} {rec[0]}
                </td>
                <td title={rec[1]} style={{fontFamily:'monospace', cursor:'pointer'}}>{rec[1]?.slice(0,6)+'...'+rec[1]?.slice(-4)}</td>
                <td>{new Date(Number(rec[2])*1000).toLocaleString()}</td>
                <td style={{fontStyle:'italic'}}>{rec[3]}</td>
                <td title={rec[4]} style={{fontFamily:'monospace', cursor:'pointer'}}>{rec[4]?.slice(0,6)+'...'+rec[4]?.slice(-4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {history && history.length > 0 && viewMode==="timeline" && (
        <div className="timeline-view">
          <div style={{background:'#f8fafc', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
            <h4 style={{margin:'0 0 16px 0', color:'#1e293b'}}>Timeline View</h4>
            {warning && <div className="warning" style={{marginBottom:'12px'}}>{warning}</div>}
            <div style={{position:'relative'}}>
              {history.map((rec, idx) => (
                <div key={idx} style={{
                  display:'flex',
                  alignItems:'flex-start',
                  marginBottom:'16px',
                  position:'relative'
                }}>
                  <div style={{
                    width:'12px',
                    height:'12px',
                    borderRadius:'50%',
                    background:rec[0]==='Created'?'#059669':rec[0]==='Transferred'?'#2563eb':rec[0]==='Warranty'?'#f59e42':rec[0]==='Repair'?'#f43f5e':'#64748b',
                    marginTop:'4px',
                    marginRight:'12px',
                    flexShrink:0
                  }} />
                  {idx < history.length - 1 && (
                    <div style={{
                      position:'absolute',
                      left:'5px',
                      top:'16px',
                      width:'2px',
                      height:'calc(100% - 8px)',
                      background:'#e2e8f0'
                    }} />
                  )}
                  <div style={{flex:1}}>
                    <div style={{
                      fontWeight:'600',
                      color:rec[0]==='Created'?'#059669':rec[0]==='Transferred'?'#2563eb':rec[0]==='Warranty'?'#f59e42':rec[0]==='Repair'?'#f43f5e':'#64748b',
                      marginBottom:'4px'
                    }}>
                      {rec[0]==='Created'? '🟢': rec[0]==='Transferred'? '🔄': rec[0]==='Warranty'? '🛠️': rec[0]==='Repair'? '🔧':'❓'} {rec[0]}
                    </div>
                    <div style={{fontSize:'14px', color:'#64748b', marginBottom:'4px'}}>
                      <strong>Actor:</strong> {rec[1]?.slice(0,6)+'...'+rec[1]?.slice(-4)}
                    </div>
                    <div style={{fontSize:'14px', color:'#64748b', marginBottom:'4px'}}>
                      <strong>Time:</strong> {new Date(Number(rec[2])*1000).toLocaleString()}
                    </div>
                    {rec[3] && (
                      <div style={{fontSize:'14px', color:'#64748b', marginBottom:'4px', fontStyle:'italic'}}>
                        <strong>Note:</strong> {rec[3]}
                      </div>
                    )}
                    {rec[4] && rec[4] !== "0x0000000000000000000000000000000000000000" && (
                      <div style={{fontSize:'14px', color:'#64748b'}}>
                        <strong>New Owner:</strong> {rec[4]?.slice(0,6)+'...'+rec[4]?.slice(-4)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {history && history.length === 0 && !loading && (
        <div style={{color:'#888',marginTop:12,fontSize:15}}>Chưa có lịch sử cho sản phẩm này hoặc chưa nhập mã sản phẩm.</div>
      )}
    </div>
  );
} 