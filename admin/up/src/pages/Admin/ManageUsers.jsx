import { useMemo, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { toastMessage } from '../../utils/toastMessage'

const initialUsers = [
  { id: 1, name: 'Arjun Mehra', email: 'arjun@example.com', role: 'student', status: 'active' },
  { id: 2, name: 'Sneha Kapoor', email: 'sneha@example.com', role: 'instructor', status: 'active' },
  { id: 3, name: 'Rahul Verma', email: 'rahul@example.com', role: 'admin', status: 'active' },
  { id: 4, name: 'Priya Nanda', email: 'priya@example.com', role: 'student', status: 'suspended' },
]

const ManageUsers = () => {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      [user.name, user.email, user.role, user.status].some((field) =>
        field.toLowerCase().includes(search.toLowerCase()),
      ),
    )
  }, [users, search])

  const handleStatusToggle = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
          : user,
      ),
    )
    toastMessage.success('User status updated')
  }

  const handleDelete = (userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    setSelectedUser(null)
    toastMessage.success('User removed successfully')
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Admin / users</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Manage users</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Search, review, update, and moderate platform users from one dashboard.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <Input
            name="userSearch"
            placeholder="Search users by name, role or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <Card className="overflow-hidden rounded-[28px] bg-white/80 p-0 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-200">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setSelectedUser(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                    No users matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Delete user"
        showFooter
        confirmText="Delete User"
        confirmVariant="danger"
        onConfirm={() => handleDelete(selectedUser?.id)}
      >
        <p className="text-sm leading-7 text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">{selectedUser?.name}</span>? This action
          is intended for UI flow demonstration and can be connected to the backend later.
        </p>
      </Modal>
    </div>
  )
}

export default ManageUsers