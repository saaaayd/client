import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

interface Payment {
  id: number;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue' | 'verified';
  due_date: string;
  receipt_url?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

export function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/payments', {
        params: { student_id: user.id },
      });
      setPayments(res.data);
    } catch (error) {
      console.error('Error loading payments', error);
    }
  };

  const handleFileChange = (paymentId: number, file: File | null) => {
    setFiles((prev) => ({ ...prev, [paymentId]: file }));
  };

  const handleSubmitReceipt = async (payment: Payment) => {
    const file = files[payment.id] || null;
    if (!file) {
      Swal.fire('Missing receipt', 'Please attach a photo of your receipt first.', 'warning');
      return;
    }

    setSubmittingId(payment.id);

    const formData = new FormData();
    formData.append('status', 'paid');
    formData.append('receipt_image', file);
    formData.append('_method', 'PUT');

    try {
      await axios.post(`/api/payments/${payment.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Swal.fire('Submitted', 'Your receipt was uploaded. Please wait for admin approval.', 'success');
      setFiles((prev) => ({ ...prev, [payment.id]: null }));
      fetchPayments();
    } catch (error: any) {
      console.error(error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to submit receipt. Please try again.',
        'error',
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingOrOverdue = payments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue',
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-[#001F3F] mb-4">My Payments</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-gray-500">No payment records found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {currencyFormatter.format(p.amount)} · {p.type.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Due:{' '}
                  {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'Not set'}
                </p>
                <p className="text-xs mt-1">
                  Status:{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'paid'
                        ? 'bg-blue-100 text-blue-700'
                        : p.status === 'overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </p>
                {p.receipt_url && (
                  <p className="text-xs mt-1">
                    Proof:{' '}
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View receipt
                    </a>
                  </p>
                )}
              </div>

              {(p.status === 'pending' || p.status === 'overdue') && !p.receipt_url && (
                <div className="flex flex-col items-stretch gap-2 w-full md:w-64">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(p.id, e.target.files?.[0] || null)
                    }
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    className="bg-[#001F3F] text-white hover:bg-[#003366]"
                    onClick={() => handleSubmitReceipt(p)}
                    disabled={submittingId === p.id}
                  >
                    {submittingId === p.id ? 'Submitting...' : 'Submit Receipt'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingOrOverdue.length === 0 && (
        <p className="text-xs text-gray-500 mt-4">
          You have no pending or overdue payments requiring proof at the moment.
        </p>
      )}
    </div>
  );
}




