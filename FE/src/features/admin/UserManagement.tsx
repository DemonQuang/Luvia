import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.auth.getAdminUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (e: any) {
      setError(e.message || 'Không thể lấy danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" không? Thao tác này sẽ xóa tất cả câu chuyện đi kèm.`)) {
      return;
    }

    try {
      const res = await api.auth.deleteAdminUser(id);
      if (res.success) {
        setUsers(users.filter(u => u.id !== id));
        alert('Xóa người dùng thành công.');
      }
    } catch (e: any) {
      alert(e.message || 'Xóa người dùng thất bại.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">shield_person</span>
        <p className="text-on-surface-variant font-caption mt-4">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Quản lý người dùng</h1>
        <p className="font-body-md text-on-surface-variant">
          Quản trị viên có thể giám sát tất cả tài khoản trong hệ thống Luvia.
        </p>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/20 text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps text-xs border-b border-secondary-container/10">
                <th className="p-5 font-bold uppercase tracking-wider">Họ và tên</th>
                <th className="p-5 font-bold uppercase tracking-wider">Tên tài khoản</th>
                <th className="p-5 font-bold uppercase tracking-wider">Email</th>
                <th className="p-5 font-bold uppercase tracking-wider">Quyền hạn</th>
                <th className="p-5 font-bold uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/10 font-body-md">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-on-surface-variant">
                    Chưa có tài khoản người dùng nào đăng ký.
                  </td>
                </tr>
              ) : (
                users.map((userNode) => (
                  <tr key={userNode.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-5 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                        {userNode.fullname.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-on-surface">{userNode.fullname}</span>
                    </td>
                    <td className="p-5 text-on-surface-variant">@{userNode.username}</td>
                    <td className="p-5 text-on-surface-variant">{userNode.email}</td>
                    <td className="p-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          userNode.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {userNode.role}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {userNode.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(userNode.id, userNode.fullname)}
                          className="p-2 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-xl transition-all"
                          title="Xóa tài khoản"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;
