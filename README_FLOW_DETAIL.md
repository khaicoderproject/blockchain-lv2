# Chi tiết Flow Hoạt Động Hệ Thống Xác Thực Sản Phẩm Blockchain

## 1. Vai trò (Role)
- **Manufacturer (Nhà sản xuất):** Tạo sản phẩm mới, chuyển giao cho Dealer.
- **Dealer (Đại lý/Cửa hàng):** Nhận sản phẩm từ Manufacturer, chuyển cho Customer.
- **Customer (Khách hàng):** Nhận sản phẩm, kiểm tra lịch sử, gửi bảo hành.
- **Warranty Center (Trung tâm bảo hành):** Nhận sản phẩm từ Customer để bảo hành/sửa chữa, ghi nhận lịch sử.

---

## 2. Quy trình sản phẩm

### 2.1. Tạo sản phẩm
- **Ai:** Manufacturer
- **Hành động:** Nhập mã sản phẩm, thông tin sản phẩm → Gửi lên blockchain.
- **Kết quả:** Sản phẩm được ghi nhận, lịch sử có event “Created”.

### 2.2. Chuyển giao sản phẩm
- **Ai:** Manufacturer → Dealer, Dealer → Customer, Customer → Warranty Center
- **Hành động:** Nhập mã sản phẩm, địa chỉ ví người nhận, ghi chú (nếu có) → Gửi lên blockchain.
- **Kết quả:** Lịch sử ghi nhận event “Transferred”, cập nhật chủ sở hữu mới.

### 2.3. Kiểm tra lịch sử sản phẩm
- **Ai:** Mọi vai trò
- **Hành động:** Nhập hoặc quét mã sản phẩm → Xem bảng/timeline lịch sử.
- **Kết quả:** Hiển thị toàn bộ event (Created, Transferred, Warranty, Repair), cảnh báo nếu phát hiện chuyển giao bất thường.

### 2.4. Gửi bảo hành/sửa chữa
- **Ai:** Customer (gửi), Warranty Center (ghi nhận)
- **Hành động:** Customer chuyển sản phẩm cho Warranty Center, Warranty Center ghi nhận bảo hành/sửa chữa.
- **Kết quả:** Lịch sử có event “Warranty” hoặc “Repair”.

### 2.5. Quản lý vai trò
- **Ai:** Owner (admin)
- **Hành động:** Gán role cho các ví Metamask khác nhau.
- **Kết quả:** Các ví có thể thực hiện chức năng tương ứng.

---

## 3. Multi-layer Authentication
- **Layer 1:** Xác thực ví Metamask (user phải đăng nhập ví).
- **Layer 2:** Phân quyền role (chỉ đúng vai trò mới thực hiện được chức năng).
- **Layer 3:** Xác thực giao dịch blockchain (Metamask ký xác nhận).
- **Layer 4:** Kiểm tra bất thường (logic contract, cảnh báo trên frontend).

---

## 4. Lịch sử & Cảnh báo
- **Lịch sử:** Mọi event đều ghi lại, không thể sửa/xóa.
- **Cảnh báo:** Nếu phát hiện chuyển giao bất thường (ví dụ: chuyển cho chính mình, chuyển cho địa chỉ 0x0), sẽ hiển thị cảnh báo trên UI. 