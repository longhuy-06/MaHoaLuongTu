export const markdownContent = `
# System Documentation

Đây là tài liệu phân tích thiết kế cho hệ thống **Quantum Key Distribution (BB84)**.

*Lưu ý: Ứng dụng mô phỏng trực tiếp này được viết bằng React + Node.js (Môi trường Web Sandboxed). Các thiết kế dưới đây dành cho báo cáo xây dựng hệ thống nền tảng Backend Spring Boot + MySQL.*

---

## 1. Use Case Diagram
Hệ thống có 2 Actors chính: Người dùng (User) và Kẻ tấn công (Eve - mô phỏng).

- **User**:
  - Cấu hình độ dài chuỗi bit.
  - Bắt đầu mô phỏng sinh khóa.
  - Mã hóa tin nhắn (AES).
  - Giải mã tin nhắn.
- **Eve** (Actor ẩn do người dùng cấu hình):
  - Can thiệp (Đo lường photon).
  - Gửi photon giả mạo cho Bob.

---

## 2. Activity Diagram (Quá trình trao đổi khóa)

1. **Bắt đầu**: Alice sinh ra $n$ bit ngẫu nhiên.
2. Alice sinh ra $n$ cơ sở (basis) ngẫu nhiên (+ hoặc x).
3. Alice mã hóa bit thành Photon và gửi qua kênh lượng tử.
4. **Kiểm tra Eve**:
   - Nếu Eve = TRUE: Eve sinh basis ngẫu nhiên, đo photon và gửi kết quả đo được cho Bob.
   - Nếu Eve = FALSE: Photon truyền thẳng đến Bob nguyên vẹn.
5. Bob sinh ra $n$ basis ngẫu nhiên và tiến hành đo photon nhận được.
6. Alice và Bob so sánh basis công khai (Kênh cổ điển).
7. Loại bỏ các bit có basis không khớp.
8. Tính toán tỷ lệ lỗi (QBER) trên các bit giữ lại.
9. **Kết luận**:
   - QBER > 0: Phát hiện nghe lén $\\rightarrow$ Hủy khóa.
   - QBER = 0: Khóa hợp lệ $\\rightarrow$ Chuyển thành AES Key.

---

## 3. Sequence Diagram (Giao thức BB84)

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Eve
    participant Bob
    
    Alice->>Alice: Sinh bit và basis ngẫu nhiên
    Alice->>Eve: Gửi Photon (Kênh lượng tử)
    
    alt Có nghe lén
        Eve->>Eve: Đo photon với basis ngẫu nhiên
        Eve->>Bob: Chuyển tiếp photon giả mạo
    else Không nghe lén
        Eve->>Bob: Chuyển tiếp nguyên thủy
    end
    
    Bob->>Bob: Đo photon với basis ngẫu nhiên
    Alice->>Bob: Gửi danh sách Alice Basis (Kênh cổ điển)
    Bob->>Alice: Gửi danh sách Bob Basis (Kênh cổ điển)
    Alice->>Alice: Xóa bit khác basis
    Bob->>Bob: Xóa bit khác basis
    Alice->>Bob: Trao đổi chuỗi bit kiểm tra (Trích mẫu)
    Bob->>Bob: Tính toán QBER
    
    alt QBER > 0
        Bob-->>Alice: Cảnh báo phát hiện Eve! Hủy khóa.
    else QBER == 0
        Bob-->>Alice: Khóa an toàn. Sinh Shared Secret Key.
    end
\`\`\`

---

## 4. Class Diagram & Database Design (MySQL)

Hệ thống lưu lại các phiên giao dịch khóa dùng cho mục đích kiểm toán (Audit).

\`\`\`mermaid
classDiagram
    class SimulationSession {
        +Long id
        +Integer bitLength
        +Boolean evePresent
        +Double qber
        +Boolean isSafe
        +String finalAesKeyHash
        +LocalDateTime createdAt
        +doSimulation()
    }
    
    class PhotonStep {
        +Long id
        +Long sessionId
        +Integer stepIndex
        +Integer aliceBit
        +String aliceBasis
        +String alicePhoton
        +String bobBasis
        +Integer bobBit
        +Boolean isMatch
    }
    
    SimulationSession "1" *-- "many" PhotonStep : contains
\`\`\`

### Cấu trúc bảng MySQL:
1. Bảng \`simulation_session\`
   - \`id\` (BIGINT, PK, AUTO_INCREMENT)
   - \`bit_length\` (INT)
   - \`eve_present\` (BOOLEAN)
   - \`qber\` (DOUBLE)
   - \`is_safe\` (BOOLEAN)
   - \`key_hash\` (VARCHAR(255))
   - \`created_at\` (TIMESTAMP)

2. Bảng \`photon_step\`
   - \`id\` (BIGINT, PK, AUTO_INCREMENT)
   - \`session_id\` (BIGINT, FK)
   - \`step_index\` (INT)
   - \`alice_bit\` (TINYINT)
   - \`alice_basis\` (VARCHAR(1))
   - \`alice_photon\` (VARCHAR(1))
   - \`bob_basis\` (VARCHAR(1))
   - \`bob_bit\` (TINYINT)
   - \`is_match\` (BOOLEAN)

---

## 5. API Design (Spring Boot REST)

- **POST /api/qkd/simulate**
  - **Request Body**: \`{ "numBits": 50, "evePresent": true }\`
  - **Response**: Trả về toàn bộ danh sách \`steps\`, QBER, và \`isSafe\`.
- **POST /api/crypto/encrypt**
  - **Request Body**: \`{ "message": "hello", "key": "aes_key_hex" }\`
  - **Response**: \`{ "ciphertext": "U2FsdGVkX..." }\`
- **POST /api/crypto/decrypt**
  - **Request Body**: \`{ "ciphertext": "U2FsdGVkX...", "key": "aes_key_hex" }\`
  - **Response**: \`{ "plaintext": "hello" }\`

---

## 6. Hướng dẫn chạy đồ án (Kiến trúc chuẩn)
1. **Database**: Cài đặt MySQL, tạo database \`qkd_bb84\`.
2. **Backend**: 
   - Khởi tạo Spring Boot project (Web, JPA, MySQL Driver).
   - Thêm câu hình \`application.properties\` kết nối DB.
   - Implement các Controller và Service xử lý Request.
   - Chạy ứng dụng trên cổng \`8080\`.
3. **Frontend**:
   - Sử dụng Vite + React.
   - Fetch API đến \`http://localhost:8080\`.
   - \`npm run dev\` để xem trên localhost.
`;
