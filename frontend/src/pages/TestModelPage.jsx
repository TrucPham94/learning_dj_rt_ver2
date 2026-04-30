import { useEffect, useState } from "react";
import { Table, message } from "antd";
import api from "../services/api";

export default function TestModelPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/test-models/");
      setData(res.data);
    } catch {
      message.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Ngày cập nhật", dataIndex: "update_date", key: "update_date" },
  ];

  return (
    <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
  );
}
