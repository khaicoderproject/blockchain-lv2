# Hệ Thống Xác Thực Sản Phẩm Blockchain - Tổng Quan & Hướng Dẫn Cài Đặt

## 1. Tổng quan
Hệ thống xác thực sản phẩm sử dụng blockchain, multi-layer authentication, phân quyền vai trò (role), ghi nhận lịch sử bất biến, cảnh báo bất thường, tích hợp Metamask và giao diện hiện đại.

- **Smart contract:** Quản lý sản phẩm, lịch sử, role, cảnh báo.
- **Frontend:** React, kết nối Metamask, hiển thị lịch sử, cảnh báo, phân quyền.
- **Multi-layer:** Xác thực ví, role, giao dịch, logic bất thường.

## 2. Yêu cầu
- Node.js >= 14
- Ganache (hoặc mạng Ethereum testnet)
- Metamask (trên trình duyệt)
- Truffle (hoặc Hardhat)
- Yarn hoặc npm

## 3. Cài đặt & chạy demo

### 3.1. Backend & Smart contract
```bash
cd blockchain_lv2
npm install
# Deploy smart contract (dùng Ganache)
truffle migrate --reset
# hoặc nếu dùng Hardhat:
# npx hardhat run scripts/deploy.js --network localhost
```
- Lưu lại địa chỉ contract và ABI (copy vào frontend/src/contracts/ProductLifecycle.json nếu cần)

### 3.2. Frontend
```bash
cd frontend
npm install
npm start
# hoặc
yarn install
yarn start
```
- Truy cập: http://localhost:3000
- Kết nối Metamask, chọn đúng network (Ganache hoặc testnet đã deploy contract).

### 3.3. Phân quyền role
- Đăng nhập ví admin (owner), vào mục “Quản lý vai trò”, gán role cho các ví khác (Manufacturer, Dealer, Customer, Warranty Center).

### 3.4. Demo quy trình
1. **Admin** gán role cho các ví.
2. **Manufacturer** tạo sản phẩm.
3. **Dealer** nhận sản phẩm từ Manufacturer, chuyển cho Customer.
4. **Customer** kiểm tra lịch sử, gửi bảo hành nếu cần.
5. **Warranty Center** nhận sản phẩm, ghi nhận bảo hành/sửa chữa.
6. **Mọi người** có thể kiểm tra lịch sử sản phẩm, phát hiện bất thường.

## 4. File cần thiết
- `contracts/ProductLifecycle.sol` (Smart contract)
- `frontend/src/contracts/ProductLifecycle.json` (ABI contract)
- `frontend/package.json`, `backend/package.json` (cài đặt thư viện)
- `README_FLOW_DETAIL.md` (flow chi tiết)

## 5. Liên hệ & hỗ trợ
Nếu gặp lỗi hoặc cần hỗ trợ, hãy liên hệ admin dự án hoặc kiểm tra lại các bước cài đặt ở trên. 