// app/payment/page.tsx
import React from "react";
import PaymentPageComponent from "../../components/payment/PaymentComponent";

const PaymentPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <PaymentPageComponent />
    </div>
  );
};

export default PaymentPage;
