import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { usePagination } from '../hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface Payment {
  _id: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue' | 'verified' | 'submitted';
  dueDate: string; // Changed from due_date
  receiptUrl?: string; // Changed/Standardized
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

export function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [receiptLinks, setReceiptLinks] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const actionablePayments = payments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue'
  );
  const historyPayments = payments
    .filter((p) => ['paid', 'verified', 'submitted'].includes(p.status))
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 1);

  const displayedPayments = [...actionablePayments, ...historyPayments].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(displayedPayments, 5);
  const currentPayments = currentData();

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/payments/my-history');
      setPayments(res.data);
    } catch (error) {
      console.error('Error loading payments', error);
    }
  };

  const handleFileChange = (paymentId: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [paymentId]: file }));
  };

  const handleUrlChange = (paymentId: string, url: string) => {
    setReceiptLinks((prev) => ({ ...prev, [paymentId]: url }));
  };

  const handleSubmitReceipt = async (payment: Payment) => {
    const file = files[payment._id];

    if (!file) {
      Swal.fire('Missing Receipt', 'Please select an image file to upload.', 'warning');
      return;
    }

    setSubmittingId(payment._id);

    try {
      const formData = new FormData();
      // Since we are uploading a receipt, we can assume the status implies 'paid' or 'verification pending'.
      // However, the backend logic for updates relies on 'status' being passed if we want to change it.
      // Let's set it to 'paid' as per original logic, or maybe just upload the file.
      // The instructions say "admin can see the receipt", usually this implies a state change to 'paid' or 'pending approval'.
      // Let's set it to 'submitted' so admin can verify it.
      formData.append('status', 'submitted');
      formData.append('receipt_image', file);

      await axios.patch(`/api/payments/${payment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire('Submitted', 'Your receipt was uploaded. Please wait for admin approval.', 'success');
      setFiles((prev) => ({ ...prev, [payment._id]: null }));
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
      <h3 className="text-[#001F3F] mb-4">Recent Payments</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-gray-500">No payment records found.</p>
      ) : (
        <div className="space-y-4">
          {currentPayments.map((p) => (
            <div
              key={p._id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {currencyFormatter.format(p.amount)} · {p.type.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Due:{' '}
                  {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'Not set'}
                </p>
                <p className="text-xs mt-1">
                  Status:{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : p.status === 'paid'
                        ? 'bg-blue-100 text-blue-700'
                        : p.status === 'submitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : p.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {p.status}
                  </span>
                </p>
                {p.receiptUrl && (
                  <div className="mt-2 text-xs">
                    <p className="text-gray-500 mb-1">Proof:</p>
                    <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="block w-16 h-16 border rounded overflow-hidden">
                      <img
                        src={p.receiptUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerText = 'View';
                          (e.target as HTMLImageElement).parentElement!.className = 'text-blue-600 underline';
                        }}
                      />
                    </a>
                  </div>
                )}
              </div>


              {(p.status === 'pending' || p.status === 'overdue') && !p.receiptUrl && (
                <div className="flex flex-col items-stretch gap-2 w-full md:w-80">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(p._id, e.target.files ? e.target.files[0] : null)
                      }
                      className="text-xs border rounded p-2 flex-grow min-w-0"
                    />
                    <Button
                      size="sm"
                      className="bg-[#001F3F] text-white hover:bg-[#003366] whitespace-nowrap"
                      onClick={() => handleSubmitReceipt(p)}
                      disabled={submittingId === p._id}
                    >
                      {submittingId === p._id ? '...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {maxPage > 1 && (
        <div className="mt-4">
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

      {pendingOrOverdue.length === 0 && (
        <p className="text-xs text-gray-500 mt-4">
          You have no pending or overdue payments requiring proof at the moment.
        </p>
      )}
    </div>
  );
}




