import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let attempts = 0;
    const poll = async () => {
      if (attempts >= 5) { setStatus('timeout'); return; }
      attempts++;
      try {
        const res = await api.get(`/payments/status/${sessionId}`);
        setPaymentData(res.data);
        if (res.data.payment_status === 'paid') { setStatus('success'); return; }
        if (res.data.status === 'expired') { setStatus('expired'); return; }
        setTimeout(poll, 2000);
      } catch { setTimeout(poll, 2000); }
    };
    poll();
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16" data-testid="payment-success-page">
      <div className="text-center max-w-md">
        {status === 'checking' && (
          <>
            <Loader2 size={48} className="text-primary mx-auto mb-5 animate-spin" />
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3">Verifying Payment...</h2>
            <p className="text-slate-600">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3">Payment Successful!</h2>
            <p className="text-slate-600 mb-6">Your consultation payment has been confirmed. Our team will send you the meeting details shortly.</p>
            {paymentData && (
              <div className="bg-surface rounded-lg p-4 mb-6 text-sm text-left">
                <p><span className="text-slate-500">Amount:</span> <span className="font-medium">{(paymentData.amount_total / 100).toFixed(2)} {paymentData.currency?.toUpperCase()}</span></p>
                <p><span className="text-slate-500">Status:</span> <span className="font-medium text-emerald-600">Paid</span></p>
              </div>
            )}
            <Link to="/" className="text-primary hover:text-blue-700 font-medium text-sm" data-testid="back-home-btn">Back to Home</Link>
          </>
        )}
        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3">
              {status === 'expired' ? 'Session Expired' : 'Payment Issue'}
            </h2>
            <p className="text-slate-600 mb-6">We could not verify your payment. Please try again or contact support.</p>
            <Link to="/consultation" className="text-primary hover:text-blue-700 font-medium text-sm">Try Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
