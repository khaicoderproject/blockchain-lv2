import React from "react";

const ICONS = {
  Created: "🟢",
  Transferred: "🔄",
  Warranty: "🛠️",
  Repair: "🔧"
};
const COLORS = {
  Created: "#059669",
  Transferred: "#2563eb",
  Warranty: "#f59e42",
  Repair: "#f43f5e"
};

function shorten(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function HistoryTimeline({ history, warning }) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{marginTop:16, marginBottom:8}}>
      <h4 style={{marginBottom:8}}>Timeline lịch sử sản phẩm</h4>
      {warning && (
        <div style={{background:'#fff3cd',color:'#856404',padding:8,borderRadius:4,marginBottom:8,border:'1px solid #ffe58f'}}>
          <b>⚠️ {warning}</b>
        </div>
      )}
      <div style={{borderLeft:'4px solid #a5b4fc', paddingLeft:30, position:'relative'}}>
        {history.map((rec, idx) => (
          <div key={idx} style={{marginBottom:28, position:'relative', minHeight:48}}>
            <span style={{position:'absolute', left:-44, top:0, fontSize:32, background:'#fff', borderRadius:'50%', border:`2px solid ${COLORS[rec[0]]||'#888'}`, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px #e0e7ff'}}>{ICONS[rec[0]] || "❓"}</span>
            <div style={{color:COLORS[rec[0]] || '#222', fontWeight:700, fontSize:17, marginBottom:2}}>{rec[0]}</div>
            <div style={{fontSize:13, color:'#555'}}>Người thực hiện: <b title={rec[1]} style={{cursor:'pointer'}}>{shorten(rec[1])}</b></div>
            <div style={{fontSize:13, color:'#555'}}>Thời gian: {new Date(Number(rec[2])*1000).toLocaleString()}</div>
            {rec[3] && <div style={{fontSize:13, color:'#555'}}>Ghi chú: <span style={{fontStyle:'italic'}}>{rec[3]}</span></div>}
            <div style={{fontSize:13, color:'#555'}}>Chủ sở hữu mới: <b title={rec[4]} style={{cursor:'pointer'}}>{shorten(rec[4])}</b></div>
          </div>
        ))}
        {/* Đường timeline dọc */}
        <div style={{position:'absolute', left:-24, top:0, bottom:0, width:0, borderLeft:'2px dashed #a5b4fc', zIndex:0}}></div>
      </div>
    </div>
  );
} 