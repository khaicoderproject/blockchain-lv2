# Blockchain Multi-layer Product Authentication System (Level 2)

## 🎯 Mô tả
Hệ thống xác thực sản phẩm đa lớp sử dụng blockchain Ethereum với các tính năng:
- **Ghi nhận toàn bộ vòng đời sản phẩm** trên blockchain (không thể sửa/xóa)
- **Phân quyền đa vai trò**: Manufacturer, Dealer, Customer, Warranty Center
- **Phát hiện giả mạo thông minh** với rate limiting và spam protection
- **Giao diện React** kết nối Metamask, quản lý vai trò, xem lịch sử chi tiết
- **Cảnh báo bất thường** real-time với lý do cụ thể

## 🏗️ Cấu trúc dự án

### Smart Contracts
- `contracts/ProductLifecycle.sol`: Contract chính quản lý:
  - Tạo và chuyển giao sản phẩm
  - Phân quyền vai trò (Role-based access control)
  - Ghi nhận bảo hành và sửa chữa
  - Phát hiện hoạt động bất thường
  - Lưu trữ lịch sử đầy đủ

### Frontend Components
- `frontend/src/components/`: Các component React
  - `RoleManager.js`: Quản lý phân quyền vai trò
  - `AntiCounterfeitInfo.js`: Xác thực chống giả mạo
  - `WarrantyForm.js`: Ghi nhận bảo hành
  - `RepairForm.js`: Ghi nhận sửa chữa
  - `HistoryViewer.js`: Xem lịch sử sản phẩm
  - `ContractInfo.js`: Thông tin contract

## 📜 Scripts tiện ích
```bash
# Deploy contract và cập nhật frontend
npm run deploy

# Chỉ deploy contract
npm run deploy-contract

# Chỉ cập nhật contract info cho frontend
npm run update-contract

# Kiểm tra trạng thái contract
npm run check-status
```

## 🔧 Cài đặt và Deploy

### 1. Cài đặt dependencies
```bash
cd blockchain_lv2
npm install
cd frontend
npm install
```

### 2. Khởi động Ganache
- Chạy Ganache GUI hoặc CLI
- Đảm bảo chạy ở `localhost:7545`
- Tạo ít nhất 4-5 accounts để test các vai trò khác nhau

### 3. Deploy smart contract
```bash
cd blockchain_lv2
npx truffle migrate --reset
```

### 4. Cập nhật thông tin contract cho frontend
```bash
npm run update-contract
```

### 5. (Tùy chọn) Deploy nhanh với script
```bash
# Deploy và cập nhật contract info trong 1 lệnh
npm run deploy
```

### 6. Khởi động frontend
```bash
cd frontend
npm start
```

### 7. Cấu hình Metamask
- Kết nối Metamask với mạng Custom RPC: `http://localhost:7545`
- Import các private keys từ Ganache vào Metamask
- Chuyển đổi giữa các accounts để test các vai trò khác nhau

## 🎮 Hướng dẫn sử dụng

### 👥 Hệ thống vai trò

#### 1. **Manufacturer (Nhà sản xuất)**
- Tạo sản phẩm mới
- Chuyển giao cho Dealer hoặc Customer
- Phân quyền cho các accounts khác

#### 2. **Dealer (Đại lý/Cửa hàng)**
- Nhận sản phẩm từ Manufacturer
- Chuyển giao cho Dealer khác hoặc Customer

#### 3. **Customer (Khách hàng)**
- Nhận sản phẩm từ Dealer
- Chuyển giao cho Warranty Center khi cần bảo hành

#### 4. **Warranty Center (Trung tâm bảo hành)**
- Ghi nhận bảo hành và sửa chữa
- Phải là chủ sở hữu sản phẩm

### 🛡️ Hệ thống bảo mật

#### Rate Limiting
- **Tối thiểu 10 giây** giữa các action
- **Tối đa 20 hoạt động** trong 1 giờ
- **Tối thiểu 30 giây** giữa các action để tránh spam

#### Giới hạn theo chức năng
- **Bảo hành**: Tối đa 2 lần trong 5 phút
- **Sửa chữa**: Tối đa 2 lần trong 5 phút, 3 lần/ngày
- **Chuyển giao**: Tối đa 10 lần trong 1 giờ

#### Phát hiện bất thường
- Hoạt động quá nhanh (spam)
- Bảo hành quá sớm sau chuyển giao (< 1 giờ)
- Sửa chữa quá nhiều lần
- Chuyển giao bất thường

### 📋 Quy trình sử dụng

#### 1. Thiết lập ban đầu
1. Deploy contract
2. Phân quyền cho các accounts (sử dụng RoleManager)
3. Tạo sản phẩm đầu tiên

#### 2. Demo vòng đời sản phẩm
1. **Manufacturer** tạo sản phẩm
2. **Manufacturer** chuyển cho **Dealer**
3. **Dealer** chuyển cho **Customer**
4. **Customer** chuyển cho **Warranty Center**
5. **Warranty Center** ghi nhận bảo hành/sửa chữa

#### 3. Kiểm tra bảo mật
- Thử spam các action để xem cảnh báo
- Kiểm tra lịch sử sản phẩm
- Xem thông tin chống giả mạo

## 🛠️ Tính năng kỹ thuật

### Smart Contract Features
- **Event logging**: Ghi nhận mọi hoạt động
- **Role-based access control**: Phân quyền chi tiết
- **Anti-counterfeit detection**: Phát hiện bất thường
- **Rate limiting**: Chống spam
- **History tracking**: Lưu trữ đầy đủ lịch sử

### Frontend Features
- **Metamask integration**: Kết nối ví
- **Real-time updates**: Cập nhật trạng thái
- **Role management**: Giao diện phân quyền
- **History visualization**: Xem lịch sử dạng bảng/timeline
- **Error handling**: Thông báo lỗi chi tiết

## 🚨 Xử lý lỗi thường gặp

### Lỗi kết nối
- Kiểm tra Ganache đang chạy
- Kiểm tra Metamask kết nối đúng mạng
- Restart Ganache nếu cần

### Lỗi quyền
- Kiểm tra account có đúng vai trò không
- Kiểm tra account có phải chủ sở hữu sản phẩm không
- Sử dụng RoleManager để phân quyền

### Lỗi rate limiting
- Đợi ít nhất 10 giây giữa các action
- Không spam các chức năng
- Tuân thủ giới hạn bảo mật

## 📝 Ghi chú
- Mọi lịch sử đều được lưu trữ trên blockchain, không thể sửa/xóa
- Hệ thống phát hiện giả mạo hoạt động real-time
- Có thể mở rộng thêm các lớp bảo mật khác
- Demo-friendly với các giới hạn hợp lý 