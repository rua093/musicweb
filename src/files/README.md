# Files Module - Upload File Management

## Tổng quan

Module này cung cấp các API để upload và quản lý file (audio tracks, images) trong hệ thống music web.

## Cấu trúc thư mục

```
public/
├── tracks/     # Lưu trữ file nhạc (.mp3, .wav, .ogg, etc.)
└── images/     # Lưu trữ hình ảnh (.jpg, .png, .gif, etc.)
```

## API Endpoints

### 1. Upload File

**POST** `/api/v1/files/upload`

Upload file với authentication.

**Headers:**

- `Authorization: Bearer <token>`
- `target_type: tracks|images`

**Body (multipart/form-data):**

- `fileUpload`: File cần upload

**Response:**

```json
{
  "success": true,
  "url": "/public/tracks/song-1703123456789.mp3",
  "filename": "song-1703123456789.mp3",
  "originalname": "my-song.mp3",
  "size": 5242880,
  "mimetype": "audio/mpeg"
}
```

### 2. Upload Track File

**POST** `/api/v1/files/upload-track`

Upload file nhạc cụ thể.

**Headers:**

- `Authorization: Bearer <token>`

**Body (multipart/form-data):**

- `fileUpload`: File audio

### 3. Upload Image File

**POST** `/api/v1/files/upload-image`

Upload file hình ảnh cụ thể.

**Headers:**

- `Authorization: Bearer <token>`

**Body (multipart/form-data):**

- `fileUpload`: File image

### 4. Get User Files

**GET** `/api/v1/files/my-files?type=tracks`

Lấy danh sách file của user.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `type` (optional): tracks|images

### 5. Get File Statistics

**GET** `/api/v1/files/stats`

Lấy thống kê file của user.

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "total": 10,
  "tracks": 5,
  "images": 5
}
```

### 6. Get File by ID

**GET** `/api/v1/files/:id`

Lấy thông tin file theo ID.

**Headers:**

- `Authorization: Bearer <token>`

### 7. Delete File

**DELETE** `/api/v1/files/:id`

Xóa file theo ID.

**Headers:**

- `Authorization: Bearer <token>`

## File Validation

### Audio Files (tracks)

- **Định dạng**: mp3, wav, ogg, aac, m4a, aiff, flac, opus, 3gp, mid, midi
- **Kích thước tối đa**: 50MB

### Image Files (images)

- **Định dạng**: jpg, jpeg, png, gif, webp
- **Kích thước tối đa**: 50MB

## Database Schema

### FileEntity

```typescript
{
  id: number;
  url: string; // Đường dẫn file
  type: string; // tracks|images
  user: User; // User sở hữu file
  created_at: Date; // Thời gian tạo
}
```

## Error Handling

- **400**: File không hợp lệ (type, size)
- **401**: Chưa authenticate
- **404**: File không tồn tại
- **500**: Lỗi server

## Usage Examples

### Upload Track File

```bash
curl -X POST http://localhost:3000/api/v1/files/upload-track \
  -H "Authorization: Bearer <token>" \
  -F "fileUpload=@song.mp3"
```

### Upload Image File

```bash
curl -X POST http://localhost:3000/api/v1/files/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "fileUpload=@cover.jpg"
```

### Get User Files

```bash
curl -X GET "http://localhost:3000/api/v1/files/my-files?type=tracks" \
  -H "Authorization: Bearer <token>"
```
