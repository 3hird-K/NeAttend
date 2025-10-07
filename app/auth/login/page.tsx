import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex items-center justify-center w-[500px] h-[820px] max-h-full bg-[#201B51]">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
}
