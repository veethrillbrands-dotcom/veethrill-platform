import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: "var(--gold)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: "var(--emerald)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
            V
          </div>
          <h1 className="text-white text-2xl font-black">Veethrill Realty</h1>
          <p className="text-white/50 text-sm mt-1">Create your account</p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-2xl border-0 rounded-2xl",
              headerTitle: "text-gray-900 font-bold",
              socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50",
              formButtonPrimary: "font-semibold",
            },
            variables: {
              colorPrimary: "#0B1F3A",
              colorBackground: "#ffffff",
              borderRadius: "12px",
            },
          }}
        />
      </div>
    </div>
  );
}
