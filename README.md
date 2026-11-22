# Graduation Network Invitation

Thiệp mời lễ tốt nghiệp thuần HTML, CSS và JavaScript theo concept `ROUTER → SWITCH → SERVER → CLIENT`.

## Chạy trực tiếp

Mở `index.html` trong trình duyệt. Không cần npm, build hoặc backend.

## Cấu hình

Chỉnh tất cả dữ liệu cá nhân trong object `CONFIG` ở đầu `script.js`:

- `graduateName`, `major`, `majorEnglish`
- ngày/giờ, trường, cơ sở và địa chỉ
- số điện thoại, Zalo, Google Maps
- đường dẫn ảnh và nhạc
- timeline sự kiện

Hai ảnh profile hiện có đã được lấy từ ảnh thật của người tốt nghiệp.

Nhạc nền dùng file `assets/music.mp3` và sẽ loop sau khi khách bấm nút **Nhạc nền**. Trình duyệt không autoplay; chạy website qua Live Preview, GitHub Pages hoặc HTTPS. Nếu file MP3 không tải được, trang dùng Web Audio fallback.

## Firebase lời chúc

Trang dùng Cloud Firestore để đồng bộ lời chúc giữa các thiết bị. Khi config còn trống, trang tự fallback sang `localStorage` để không bị lỗi.

### 1. Tạo project và web app

1. Mở `https://console.firebase.google.com/` và chọn **Add project**.
2. Có thể tắt Google Analytics cho trang nhỏ này.
3. Trong **Project overview**, chọn biểu tượng `</>` để thêm **Web app**.
4. Đặt nickname, ví dụ `graduation-invitation`, rồi bấm **Register app**.
5. Chọn tab **Use a config snippet / CDN** và copy object `firebaseConfig`.

### 2. Bật Cloud Firestore

1. Vào **Build → Firestore Database**.
2. Bấm **Create database**.
3. Chọn region gần Việt Nam, ví dụ `asia-southeast1` nếu có.
4. Chọn chế độ **Production mode**, tạo database rồi sang tab **Rules**.

Dán rules sau:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /graduation-wishes/{wishId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['source', 'payload', 'createdAt'])
        && request.resource.data.source is string
        && request.resource.data.source.size() >= 1
        && request.resource.data.source.size() <= 40
        && request.resource.data.payload is string
        && request.resource.data.payload.size() >= 1
        && request.resource.data.payload.size() <= 280
        && request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

Nếu đổi `wishesCollection` trong CONFIG, đổi tên collection tương ứng trong rules.

### 3. Dán config vào code

Mở đầu `script.js`, tìm `firebase:` trong `CONFIG` và điền 6 giá trị từ Firebase Console. Ví dụ:

```js
firebase: {
  apiKey: "AIza...",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
  wishesCollection: "graduation-wishes"
}
```

Web config không phải secret, nhưng nên vào **Google Cloud Console → APIs & Services → Credentials** để giới hạn API key theo domain nếu đã deploy. Lưu ý website phải chạy qua HTTP(S) hoặc deploy trên GitHub Pages/Vercel; tránh kiểm tra Firebase bằng `file://`.

### 4. Kiểm tra

1. Deploy hoặc chạy Live Preview.
2. Nhập tên và gửi một lời chúc.
3. Mở website trên điện thoại/trình duyệt khác; lời chúc phải xuất hiện cho cả hai.
4. Nếu form báo lưu trên thiết bị, kiểm tra `apiKey`, `projectId`, `appId`, rules và internet.

## Deploy

### GitHub Pages

1. Tạo repository và đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào `Settings → Pages`.
3. Chọn `Deploy from a branch`, nhánh `main`, thư mục `/ (root)`.

### Vercel

1. Tạo project từ repository GitHub.
2. Framework Preset: `Other`.
3. Build Command để trống.
4. Output Directory để trống hoặc `.`.

## Kiểm tra tính năng

- Guest personalization và connection handshake
- Network boot sequence khoảng 1.5 giây
- Countdown timezone `Asia/Ho_Chi_Minh`
- Google Calendar UTC dates và file `.ics`
- Phone, Zalo và Google Maps
- Firebase Firestore realtime lời chúc, LocalStorage fallback
- Web Share API và clipboard fallback
- Music controller / equalizer
- `prefers-reduced-motion`, focus states và mobile 360–430px
