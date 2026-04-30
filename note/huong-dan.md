# Hướng dẫn: React + Vite + Ant Design + Django + MySQL

## Mục lục

1. [Chuẩn bị một lần duy nhất](#1-chuẩn-bị-một-lần-duy-nhất)
2. [8 bước tạo model mới](#2-8-bước-tạo-model-mới)
3. [Giải thích code](#3-giải-thích-code)
4. [Mỗi lần mở máy lên code](#4-mỗi-lần-mở-máy-lên-code)
5. [Checklist lỗi thường gặp](#5-checklist-lỗi-thường-gặp)

---

## 1. Chuẩn bị một lần duy nhất

### 1.1 Cài đặt công cụ

- **Python** 3.10+
- **Node.js** 18+
- **XAMPP** (MySQL)
- **VS Code**

### 1.2 Tạo database MySQL

Mở XAMPP → Start MySQL → vào http://localhost/phpmyadmin → tab SQL:

```sql
CREATE DATABASE learn_dj_react_ver2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.3 Tạo Django project

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers mysqlclient python-dotenv

django-admin startproject config .
python manage.py startapp api
```

Cấu trúc thư mục:

```
backend/
├── venv/
├── config/          ← cấu hình chính
│   ├── settings.py
│   └── urls.py
├── api/             ← app của mình
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── manage.py
```

### 1.4 Cấu hình settings.py

```python
# config/settings.py

INSTALLED_APPS = [
    # 1. Hệ thống Django có sẵn
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 2. Bên thứ 3 (third-party)
    'rest_framework',
    'corsheaders',

    # 3. App của mình
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # ĐẶT ĐẦU TIÊN
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'learn_dj_react_ver2',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```

### 1.5 Cấu hình config/urls.py

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

### 1.6 Tạo React project

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install antd axios react-router-dom
```

Tạo thư mục:

```bash
mkdir src/components src/pages src/services
```

### 1.7 Tạo src/services/api.js

```javascript
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
})

export default api
```

### 1.8 Cấu hình src/App.jsx (Router + Menu)

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Menu } from 'antd'

// import các trang ở đây
// import ProductPage from './pages/ProductPage'

const menuItems = [
    // thêm menu item ở đây
    // { key: '/products', label: <Link to="/products">Products</Link> },
]

function App() {
    return (
        <BrowserRouter>
            <Menu mode="horizontal" items={menuItems} />
            <div style={{ padding: 24 }}>
                <Routes>
                    {/* thêm Route ở đây */}
                    {/* <Route path="/products" element={<ProductPage />} /> */}
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
```

---

## 2. Eight bước tạo model mới

> Lặp lại 8 bước này mỗi khi có model mới. Ví dụ tạo model `Product`.

### Bước 1 — api/models.py

Định nghĩa bảng dữ liệu:

```python
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

**Các kiểu field thường dùng:**

| Field | Dùng cho |
|-------|----------|
| `CharField(max_length=n)` | Chuỗi ngắn (tên, tiêu đề) |
| `TextField()` | Chuỗi dài (mô tả, nội dung) |
| `IntegerField()` | Số nguyên |
| `DecimalField(max_digits, decimal_places)` | Số thập phân (giá tiền) |
| `DateField()` | Ngày |
| `DateTimeField()` | Ngày + giờ |
| `BooleanField()` | True / False |

### Bước 2 — makemigrations

Tạo file migration từ model (chưa động vào DB):

```bash
python manage.py makemigrations
```

Kết quả: tạo file `api/migrations/0001_initial.py`

### Bước 3 — migrate

Áp dụng migration vào MySQL (tạo bảng thật):

```bash
python manage.py migrate
```

### Bước 4 — api/serializers.py

Chuyển đổi object Python ↔ JSON để trả về cho React:

```python
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'   # lấy tất cả các field
```

### Bước 5 — api/views.py

Xử lý các request GET / POST / PUT / DELETE:

```python
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

### Bước 6 — api/urls.py

Đăng ký endpoint cho model:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)  # → /api/products/

urlpatterns = [
    path('', include(router.urls)),
]
```

1 dòng `register` tự tạo ra 6 URL:

| URL | Method | Làm gì |
|-----|--------|--------|
| `/api/products/` | GET | Lấy danh sách |
| `/api/products/` | POST | Tạo mới |
| `/api/products/1/` | GET | Lấy 1 record |
| `/api/products/1/` | PUT | Sửa toàn bộ |
| `/api/products/1/` | PATCH | Sửa một phần |
| `/api/products/1/` | DELETE | Xóa |

Test API: http://localhost:8000/api/products/

### Bước 7 — src/pages/ProductPage.jsx

Một file Page CRUD đầy đủ gồm 5 phần:

```jsx
import { useEffect, useState } from "react";
// useEffect = chạy code sau khi render (dùng để gọi API)
// useState  = lưu trữ dữ liệu trong component

import {
  Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space,
} from "antd";
// Table       = hiển thị dữ liệu dạng bảng
// Button      = nút bấm
// Modal       = popup
// Form        = form nhập liệu
// Input       = ô nhập text
// InputNumber = ô nhập số
// message     = thông báo nổi góc màn hình
// Popconfirm  = hộp xác nhận trước khi thực hiện hành động nguy hiểm (xóa)
// Space       = tạo khoảng cách đều giữa các element

import api from "../services/api";
// axios instance đã cấu hình baseURL trỏ về Django

export default function ProductPage() {

  // ── Phần 2: State ──────────────────────────────────────────────────────────
  const [data, setData] = useState([]);            // danh sách product từ API
  const [loading, setLoading] = useState(false);   // trạng thái đang tải
  const [isModalOpen, setIsModalOpen] = useState(false); // modal mở hay đóng
  const [editingRecord, setEditingRecord] = useState(null);
  // editingRecord = null   → chế độ Thêm mới
  // editingRecord = object → chế độ Sửa (lưu record đang sửa để lấy id)

  const [form] = Form.useForm();
  // form instance — điều khiển form từ bên ngoài:
  // form.submit()          → submit form
  // form.resetFields()     → xóa trắng form
  // form.setFieldsValue()  → đổ data vào form

  // ── Phần 3: Hàm xử lý ─────────────────────────────────────────────────────

  // Gọi API lấy danh sách product
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/"); // GET /api/products/
      setData(res.data);
    } catch {
      message.error("Không tải được dữ liệu");
    } finally {
      setLoading(false); // tắt loading dù thành công hay lỗi
    }
  };

  // Chạy fetchData 1 lần khi component load
  useEffect(() => {
    fetchData();
  }, []); // [] = chỉ chạy 1 lần, không chạy lại khi re-render

  // Mở modal ở chế độ Thêm mới
  const openAddModal = () => {
    setEditingRecord(null); // reset về null = chế độ thêm
    form.resetFields();     // xóa trắng form
    setIsModalOpen(true);
  };

  // Mở modal ở chế độ Sửa, đổ data của record vào form
  const openEditModal = (record) => {
    setEditingRecord(record);     // lưu lại record đang sửa (cần id để gọi PUT)
    form.setFieldsValue(record);  // điền data vào các ô input trong form
    setIsModalOpen(true);
  };

  // Đóng modal và reset toàn bộ trạng thái
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Thêm mới — nhận values từ Form khi submit
  const handleAdd = async (values) => {
    // values = { name: '...', price: ... } — Ant Design Form tự thu thập
    try {
      await api.post("/products/", values); // POST /api/products/
      message.success("Thêm thành công");
      handleCloseModal();
      fetchData(); // tải lại danh sách
    } catch {
      message.error("Thêm thất bại");
    }
  };

  // Cập nhật — dùng id của editingRecord để biết sửa record nào
  const handleEdit = async (values) => {
    try {
      await api.put(`/products/${editingRecord.id}/`, values); // PUT /api/products/1/
      message.success("Cập nhật thành công");
      handleCloseModal();
      fetchData();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  // Xóa record — dùng id để biết xóa record nào
  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}/`); // DELETE /api/products/1/
      message.success("Xóa thành công");
      fetchData(); // tải lại danh sách
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // ── Phần 4: Columns ────────────────────────────────────────────────────────
  const columns = [
    { title: "Tên", dataIndex: "name",  key: "name"  },
    { title: "Giá", dataIndex: "price", key: "price" },
    // title     = tên hiển thị trên header
    // dataIndex = tên field trong JSON trả về từ API
    // key       = định danh duy nhất cho cột
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        // render = hàm tùy chỉnh nội dung ô
        // _      = giá trị ô (không dùng)
        // record = toàn bộ data của hàng đó
        <Space>
          <Button type="primary" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            // Popconfirm = hộp xác nhận trước khi xóa, tránh xóa nhầm
            onConfirm={() => handleDelete(record.id)}
            // onConfirm = chạy khi bấm OK trong hộp xác nhận
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Phần 5: Giao diện ──────────────────────────────────────────────────────
  return (
    // <> </> là Fragment — bọc nhiều element mà không thêm thẻ HTML thừa
    <>
      <Button type="primary" onClick={openAddModal}>
        Thêm mới
      </Button>

      <Table
        columns={columns}
        dataSource={data}    // mảng data từ API
        rowKey="id"          // field làm key duy nhất cho mỗi hàng
        loading={loading}    // hiện spinner khi đang tải
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingRecord ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        // editingRecord có giá trị → title = 'Sửa', không có → title = 'Thêm'
        open={isModalOpen}
        onCancel={handleCloseModal}   // bấm X hoặc ra ngoài → đóng
        onOk={() => form.submit()}    // bấm OK → trigger submit form
      >
        <Form
          form={form}
          onFinish={editingRecord ? handleEdit : handleAdd}
          // onFinish chạy khi form hợp lệ và được submit
          // editingRecord có giá trị → gọi handleEdit, không có → gọi handleAdd
          layout="vertical" // label nằm trên input
        >
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            {/* name="name" → field này map với values.name khi submit */}
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

### Bước 8 — src/App.jsx

Đăng ký trang vào Router và Menu:

```jsx
// 1. Import trang
import ProductPage from './pages/ProductPage'

// 2. Thêm vào menuItems
{ key: '/products', label: <Link to="/products">Products</Link> }
// key   = định danh (đặt trùng với path cho dễ nhớ)
// label = nội dung hiển thị, dùng <Link> để chuyển trang không reload

// 3. Thêm vào Routes
<Route path="/products" element={<ProductPage />} />
// path    = URL cần khớp
// element = component render khi URL khớp
```

---

## 3. Giải thích code

### JSX là gì?

JSX = JavaScript + XML. Cho phép viết HTML trực tiếp trong JavaScript.

### Component là gì?

Hàm JavaScript trả về giao diện (JSX). Tên **phải viết hoa chữ đầu**.

| Cách gọi JS thuần | Cách gọi trong JSX |
|-------------------|--------------------|
| `ProductPage()` | `<ProductPage />` |

- `<ProductPage />` → component tự viết
- `<div>`, `<table>` → HTML tag thông thường

### useState

Lưu trữ dữ liệu trong component. Khi giá trị thay đổi, React tự render lại.

```jsx
const [data, setData] = useState([])
//     ↑       ↑              ↑
//   giá trị  hàm cập nhật  giá trị khởi đầu
```

### useEffect

Chạy code sau khi component render. Dùng để gọi API khi mở trang.

```jsx
useEffect(() => {
    fetchData()
}, [])
//  ↑
//  [] = chỉ chạy 1 lần khi component mount
```

### React Router

Web truyền thống: click link → server trả HTML mới → **reload toàn trang**

React Router: click `<Link>` → chỉ đổi URL → React tự render component tương ứng → **không reload**

```
Click <Link to="/products">
    ↓
URL đổi thành /products (không reload)
    ↓
<Routes> đọc URL → tìm <Route path="/products"> → render <ProductPage />
```

---

## 4. Mỗi lần mở máy lên code

```bash
# Bước 1: Mở XAMPP → Start MySQL

# Terminal 1 — Backend
cd g:\hoc_react_django\backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 — Frontend
cd g:\hoc_react_django\frontend
npm run dev
```

---

## 5. Checklist lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `CORS error` | Django chưa cho phép React | Kiểm tra `CORS_ALLOWED_ORIGINS` trong settings.py |
| `Connection refused` | Django chưa chạy | `python manage.py runserver` |
| `MySQL connection failed` | XAMPP chưa start | Mở XAMPP → Start MySQL |
| `Module not found` | Thiếu package | `pip install ...` hoặc `npm install ...` |
| `No migrations to apply` | Quên `makemigrations` | Chạy `makemigrations` trước rồi `migrate` |

---

## Lệnh hay dùng

```bash
# Django
python manage.py makemigrations    # tạo migration từ model
python manage.py migrate           # áp dụng vào DB
python manage.py createsuperuser   # tạo tài khoản admin
python manage.py runserver         # chạy server

# React
npm run dev      # chạy dev server
npm run build    # build production
```
