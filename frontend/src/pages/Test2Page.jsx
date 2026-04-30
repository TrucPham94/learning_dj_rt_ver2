import { useEffect, useState } from "react";
import { Table, message } from "antd";
import api from "../services/api";

export default function Test2Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/test2/");
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
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Value", dataIndex: "value", key: "value" },
  ];

  return (
    <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
  );
}
