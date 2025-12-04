import LoginPage from "./login.page";

export default function AuthPage() {
  return (
    <div className="flex flex-col lg:flex-row bg-linear-to-t from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Left Section - Hotel Image (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 justify-center items-center">
        <div className="relative w-full h-full max-w-4xl">
          <img
            src="./isometric-hotel-reception.png"
            alt="Luxury Hotel"
            className="w-full h-full min-h-[600px] object-cover"
          />
          <div className="absolute bg-linear-to-t from-black/50 to-transparent "></div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex justify-center items-center p-4 sm:p-6 lg:p-8">
        <LoginPage />
      </div>
    </div>
  );
}
