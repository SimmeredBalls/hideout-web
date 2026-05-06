export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for verifying your email. Your account is currently 
        <strong> Pending Approval</strong>.
      </p>
      <p className="text-sm">
        An IT Admin will review your registration. 
        You will be able to log in to the dashboard once your account is activated.
      </p>
      <a href="/auth/login" className="mt-8 text-blue-500 hover:underline">
        Back to Login
      </a>
    </div>
  );
}