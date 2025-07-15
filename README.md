# Blockchain Multi-layer Product Authentication (Level 2)

## Mô tả
- Ghi nhận mọi giao dịch, thay đổi liên quan đến sản phẩm trên blockchain.
- Tích hợp smart contract kiểm tra bất thường, xác thực toàn bộ vòng đời sản phẩm.
- Frontend React kết nối Metamask, quét QR, hiển thị lịch sử, cảnh báo bất thường.

## Cấu trúc
- `contracts/ProductLifecycle.sol`: Smart contract quản lý sản phẩm, lịch sử, kiểm tra bất thường.
- `frontend/`: Ứng dụng React kết nối Metamask, giao diện người dùng.

## Hướng dẫn sử dụng

### 1. Cài đặt
```bash
cd blockchain_lv2
npm install
cd frontend
npm install
```

### 2. Chạy Ganache (hoặc Ganache GUI)
- Đảm bảo Ganache chạy ở `localhost:7545`.

### 3. Deploy smart contract
```bash
cd blockchain_lv2
npx truffle migrate --reset
```

### 4. Chạy frontend
```bash
cd frontend
npm start
```

### 5. Sử dụng
- Kết nối Metamask (chọn mạng Custom RPC: http://localhost:7545).
- Tạo sản phẩm, chuyển giao, bảo hành, sửa chữa, quét QR để xem lịch sử.
- Ứng dụng sẽ cảnh báo nếu phát hiện bất thường.

## Ghi chú
- Có thể mở rộng xác thực nhiều lớp: xác thực người dùng, mã hóa, xác thực giao dịch...
- Mọi lịch sử đều minh bạch, không thể sửa/xóa. 