import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const handleSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const refreshToken = urlParams.get("refreshToken");
      const userId = urlParams.get("userId");

      console.log("🔄 Auth success received:", {
        token: !!token,
        refreshToken: !!refreshToken,
        userId,
      });

      if (token && refreshToken) {
        try {
          // Token'ları kaydet
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);

          console.log("✅ Google login successful! Tokens saved.");

          // Dashboard'a yönlendir
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } catch (error) {
          console.error("❌ Auth success failed:", error);
          router.push("/auth/login?error=token_save_failed");
        }
      } else {
        console.error("❌ Missing tokens in URL");
        router.push("/auth/login?error=missing_tokens");
      }
    };

    handleSuccess();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          Giriş Başarılı!
        </h2>
        <p className="text-gray-600">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
