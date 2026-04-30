import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
} from "antd";

import api from "../services/api";

export default function ProductPage() {
  // ── Phần 2: State ──────────────────────────────────────────────────────────
  const [data, setData] = useState([]); // danh sách product từ API
  const [loading, setLoading] = useState(false); // trạng thái đang tải
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
    form.resetFields(); // xóa trắng form
    setIsModalOpen(true);
  };

  // Mở modal ở chế độ Sửa, đổ data của record vào form
  const openEditModal = (record) => {
    setEditingRecord(record); // lưu lại record đang sửa (cần id để gọi PUT)
    form.setFieldsValue(record); // điền data vào các ô input trong form
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
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price" },
    // title     = tên hiển thị trên header
    // dataIndex = tên field trong JSON trả về từ API
    // key       = định danh duy nhất cho cột
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
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
        dataSource={data} // mảng data từ API
        rowKey="id" // field làm key duy nhất cho mỗi hàng
        loading={loading} // hiện spinner khi đang tải
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingRecord ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        // editingRecord có giá trị → title = 'Sửa', không có → title = 'Thêm'
        open={isModalOpen}
        onCancel={handleCloseModal} // bấm X hoặc ra ngoài → đóng
        onOk={() => form.submit()} // bấm OK → trigger submit form
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
