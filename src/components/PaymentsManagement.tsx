import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Trash2, Edit, CopyPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { usePagination } from '../hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const emptyPayment = {
  student_id: '',
  amount: '',
  type: 'rent',
  due_date: '',
  status: 'pending',
  notes: '',
  receiptUrl: '',
};

export function PaymentsManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyPayment });
  const [bulkRows, setBulkRows] = useState([{ ...emptyPayment }]);
  /* Removed unused file state & handler */

  // Receipt Modal State
  const [viewingPayment, setViewingPayment] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    const res = await axios.get('/api/payments');
    setPayments(res.data);
  };

  const fetchStudents = async () => {
    const res = await axios.get('/api/students');
    setStudents(res.data);
  };

  const openModal = (payment: any = null) => {
    if (payment) {
      setEditingId(payment.id);
      // Ensure we get the ID string whether it's populated or not
      const studentId = payment.student && typeof payment.student === 'object'
        ? payment.student._id
        : payment.student;

      setFormData({
        student_id: studentId || '',
        amount: String(payment.amount),
        type: payment.type,
        due_date: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '', // Handle different date formats if needed
        status: payment.status,
        notes: payment.notes || '',
        receiptUrl: payment.receiptUrl || '',
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyPayment });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const modalContent = document.getElementById('payment-modal-content');

    if (!formData.student_id || !formData.amount || !formData.due_date) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing fields',
        text: 'Student, amount, and due date are required.',
        confirmButtonColor: '#001F3F',
        target: modalContent || 'body'
      });
      return;
    }

    const payload = {
      student: formData.student_id, // Match backend expectation "student"
      amount: Number(formData.amount),
      type: formData.type,
      dueDate: formData.due_date, // Match backend expectation "dueDate"
      status: formData.status,
      notes: formData.notes,
      receiptUrl: formData.receiptUrl
    };

    try {
      if (editingId) {
        await axios.put(`/api/payments/${editingId}`, payload);
        setIsModalOpen(false);
        await Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: 'Payment record updated.',
          confirmButtonColor: '#001F3F'
        });
      } else {
        await axios.post('/api/payments', payload);
        setIsModalOpen(false);
        await Swal.fire({
          icon: 'success',
          title: 'Created',
          text: 'Payment recorded.',
          confirmButtonColor: '#001F3F'
        });
      }
      fetchPayments();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: (e as any).response?.data?.message || 'Operation failed.',
        confirmButtonColor: '#d33',
        target: modalContent || 'body'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: 'Delete?',
      text: 'Confirm deletion?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`/api/payments/${id}`);
        fetchPayments();
        Swal.fire('Deleted', '', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete payment.', 'error');
      }
    }
  };

  const openBulkModal = () => {
    setBulkRows([{ ...emptyPayment }]);
    setIsBulkModalOpen(true);
  };

  const updateBulkRow = (idx: number, field: string, value: string) => {
    setBulkRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const addBulkRow = () => setBulkRows((rows) => [...rows, { ...emptyPayment }]);

  const removeBulkRow = (idx: number) => {
    if (bulkRows.length === 1) return;
    setBulkRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleBulkSubmit = async () => {
    const invalid = bulkRows.some(
      (row) => !row.student_id || !row.amount || !row.due_date
    );

    if (invalid) {
      Swal.fire('Missing fields', 'Every row needs student, amount, and due date.', 'warning');
      return;
    }

    const payload = {
      payments: bulkRows.map((row) => ({
        ...row,
        student_id: Number(row.student_id),
        amount: Number(row.amount),
      })),
    };

    try {
      await axios.post('/api/payments/bulk', payload);
      Swal.fire('Success', 'Bulk payments recorded.', 'success');
      setIsBulkModalOpen(false);
      fetchPayments();
    } catch (error) {
      Swal.fire('Error', 'Failed to save bulk payments.', 'error');
    }
  };

  const summary = {
    total: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    pending: payments.filter((p) => p.status === 'pending').length,
    overdue: payments.filter((p) => p.status === 'overdue').length,
    awaitingApproval: payments.filter((p) => p.status === 'submitted').length,
  };

  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(payments, 10);
  const currentPayments = currentData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[#001F3F] text-2xl font-bold">Payments</h2>
        <div className="flex gap-2">
          <Button
            onClick={openBulkModal}
            variant="outline"
            className="border-[#001F3F] text-[#001F3F]"
          >
            <CopyPlus className="mr-2 h-4 w-4" /> Bulk Add
          </Button>
          <Button
            onClick={() => openModal()}
            className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200]"
          >
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl text-[#001F3F]">
            {currencyFormatter.format(summary.total)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Pending Records</p>
          <p className="text-2xl text-orange-600">{summary.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Overdue Records</p>
          <p className="text-2xl text-red-600">{summary.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Awaiting Approval</p>
          <p className="text-2xl text-green-600">{summary.awaitingApproval}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Proof</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentPayments.map((p: any) => (
              <tr key={p.id}>
                <td className="px-6 py-4">{p.student?.name || 'Unknown'}</td>
                <td className="px-6 py-4">{currencyFormatter.format(Number(p.amount || 0))}</td>
                <td className="px-6 py-4 capitalize">{p.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '--'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {p.receiptUrl ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => window.open(p.receiptUrl, '_blank')}
                      >
                        View Receipt
                      </Button>
                    </div>
                  ) : p.status === 'paid' ? (
                    <span className="text-xs text-red-500 italic">No receipt</span>
                  ) : (
                    <span className="text-gray-400 text-xs">--</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${p.status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : p.status === 'paid'
                        ? 'bg-blue-100 text-blue-800'
                        : p.status === 'submitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : p.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setViewingPayment(p);
                      setIsReceiptModalOpen(true);
                    }}
                    title="View Receipt / Update Status"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(p._id || p.id)}
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {maxPage > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => { e.preventDefault(); prev(); }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: maxPage }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={(e) => { e.preventDefault(); jump(i + 1); }}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => { e.preventDefault(); next(); }}
                    className={currentPage === maxPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Single payment modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent id="payment-modal-content" className="bg-white z-[100] border-2 border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Payment' : 'New Payment'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the payment details below.' : 'Enter the payment details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Student</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Amount (PHP)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="submitted">Submitted (Review)</option>
                <option value="paid">Paid</option>
                <option value="verified">Verified</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional remarks about this payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#001F3F] text-white hover:bg-[#003366]">
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Add Payments</DialogTitle>
            <DialogDescription>
              Add multiple payment records at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {bulkRows.map((row, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3 relative">
                {bulkRows.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-xs text-red-500"
                    onClick={() => removeBulkRow(idx)}
                  >
                    Remove
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Student</Label>
                    <select
                      className="w-full border rounded p-2"
                      value={row.student_id}
                      onChange={(e) => updateBulkRow(idx, 'student_id', e.target.value)}
                    >
                      <option value="">Select Student</option>
                      {students.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Amount (PHP)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateBulkRow(idx, 'amount', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full border rounded p-2"
                      value={row.type}
                      onChange={(e) => updateBulkRow(idx, 'type', e.target.value)}
                    >
                      <option value="rent">Rent</option>
                      <option value="utilities">Utilities</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={row.due_date}
                      onChange={(e) => updateBulkRow(idx, 'due_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      className="w-full border rounded p-2"
                      value={row.status}
                      onChange={(e) => updateBulkRow(idx, 'status', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={row.notes}
                    onChange={(e) => updateBulkRow(idx, 'notes', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addBulkRow}>
              Add Another Payment
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleBulkSubmit} className="bg-[#001F3F]">
              Save Bulk Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Student Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center pb-2 border-b">Student receipt</DialogTitle>
            <DialogDescription className="sr-only">View and verify student payment receipt</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center p-4 min-h-[300px]">
            {viewingPayment?.receiptUrl ? (
              <div className="w-full relative border rounded-lg overflow-hidden">
                <img
                  src={viewingPayment.receiptUrl}
                  alt="Receipt"
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
                <a
                  href={viewingPayment.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
                >
                  Open Original
                </a>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No uploaded receipt yet
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-center gap-2 sm:justify-center">
            <Button
              className="bg-[#001F3F] hover:bg-[#003366] text-white min-w-[100px]"
              onClick={async () => {
                if (!viewingPayment) return;
                try {
                  await axios.patch(`/api/payments/${viewingPayment._id || viewingPayment.id}`, { status: 'paid' });
                  setIsReceiptModalOpen(false);
                  fetchPayments();
                  Swal.fire('Updated', 'Payment marked as Paid.', 'success');
                } catch (e) {
                  console.error(e);
                  Swal.fire('Error', 'Failed to update status.', 'error');
                }
              }}
            >
              Paid
            </Button>
            <Button
              className="bg-[#001F3F] hover:bg-[#003366] text-white min-w-[100px]"
              onClick={() => setIsReceiptModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}