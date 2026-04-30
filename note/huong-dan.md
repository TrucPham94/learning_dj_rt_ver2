# Hướng dẫn: React + Vite + Ant Design + Django + MySQL

## Mục lục

1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Database: MySQL với XAMPP](#2-database-mysql-với-xampp)
3. [Backend: Django](#3-backend-django)
4. [Frontend: React + Vite + Ant Design](#4-frontend-react--vite--ant-design)
5. [Kết nối Frontend ↔ Backend](#5-kết-nối-frontend--backend)
6. [Luồng làm việc thực tế](#6-luồng-làm-việc-thực-tế)

---

## 1. Chuẩn bị môi trường ✅

### Cài đặt cần thiết

- **Python** 3.10+
- **Node.js** 18+
- **XAMPP**
- **VS Code**

### Kiểm tra cài đặt

```bash
python --version
node --version
npm --version
```

---

## 2. Database: MySQL với XAMPP ✅

### Khởi động MySQL

1. Mở **XAMPP Control Panel**
2. Bấm **Start** ở hàng **MySQL**
3. Truy cập phpMyAdmin: http://localhost/phpmyadmin

### Tạo database

```sql
CREATE DATABASE learn_dj_react_ver2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 3. Backend: Django ✅

### 3.1 Tạo virtual environment và cài packages

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install django djangorestframework django-cors-headers mysqlclient python-dotenv
```

### 3.2 Tạo Django project và app

```bash
django-admin startproject config .
python manage.py startapp api
```

Cấu trúc thư mục sau khi tạo:

```
backend/
├── venv/
├── config/          ← cấu hình chính (settings, urls...)
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/             ← app của mình
│   ├── models.py
│   ├── views.py
│   └── urls.py
└── manage.py
```

### 3.3 Cấu hình settings.py

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
    'corsheaders.middleware.CorsMiddleware',   # đặt ĐẦU TIÊN
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database MySQL
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

# Cho phép React gọi API
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```

### 3.4 Tạo Model

```python
# api/models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3.5 Tạo Serializer

```python
# api/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
```

### 3.6 Tạo View

```python
# api/views.py
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

### 3.7 Cấu hình URL

```python
# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

### 3.8 Chạy Django server

```bash
python manage.py runserver
```

Test API: http://localhost:8000/api/products/

---

## 4. Frontend: React + Vite + Ant Design ✅

### 4.1 Tạo project

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install antd axios
```

### 4.2 Cấu trúc thư mục

```
frontend/src/
├── components/       ← component tái sử dụng
├── pages/            ← các trang
├── services/
│   └── api.js        ← cấu hình axios
├── App.jsx
└── main.jsx
```

### 4.3 src/services/api.js

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export default api;
```

### 4.4 src/pages/ProductPage.jsx

```jsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message } from "antd";
import api from "../services/api";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      message.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary">Sửa</Button>
          <Button danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      rowKey="id"
      loading={loading}
    />
  );
}
```

### 4.5 src/App.jsx

```jsx
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Quản lý sản phẩm</h1>
      <ProductPage />
    </div>
  );
}

export default App;
```

### 4.6 Chạy React

```bash
npm run dev
```

Truy cập: http://localhost:5173

---

## 5. Kết nối Frontend ↔ Backend ✅

### Luồng dữ liệu

```
React (localhost:5173)
    ↓  axios.get('/products/')
Django (localhost:8000/api/products/)
    ↓  ORM query
MySQL (localhost:3306) — database: learn_dj_react_ver2
```

### Checklist khi gặp lỗi

| Lỗi                       | Nguyên nhân                | Giải pháp                                |
| ------------------------- | -------------------------- | ---------------------------------------- |
| `CORS error`              | Django chưa cho phép React | Kiểm tra `CORS_ALLOWED_ORIGINS`          |
| `Connection refused`      | Django chưa chạy           | `python manage.py runserver`             |
| `MySQL connection failed` | XAMPP chưa start           | Mở XAMPP, Start MySQL                    |
| `Module not found`        | Thiếu package              | `pip install ...` hoặc `npm install ...` |

---

## 6. Luồng làm việc thực tế

### Mỗi lần mở máy lên code

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

### Quy trình thêm tính năng mới

1. **Tạo / sửa Model** → `makemigrations` → `migrate`
2. **Tạo / sửa Serializer**
3. **Tạo / sửa View**
4. **Đăng ký URL**
5. **Gọi API từ React (axios)**
6. **Hiển thị bằng Ant Design component**

---

## Các lệnh quan trọng

```bash
# Django
python manage.py makemigrations       # tạo file migration từ model
python manage.py migrate              # áp dụng migration vào DB
python manage.py createsuperuser      # tạo tài khoản admin
python manage.py runserver            # chạy server

# React / Vite
npm run dev       # chạy dev server
npm run build     # build production
```

## Tài liệu tham khảo

- Django REST Framework: https://www.django-rest-framework.org
- Ant Design: https://ant.design/components/overview
- Vite: https://vitejs.dev/guide
