import AuthPage from "../auth/auth.page";

export default function HomePage() {
  const [isLoggedIn] = [false];
  return (
    <div>
      {isLoggedIn ? (
        <div>
          {" "}
          <div className="col-span-1">
            <img
              src="https://cdn.pixabay.com/photo/2025/11/08/13/23/zebra-9944593_1280.jpg"
              alt="Zebra"
            />
          </div>
          <br />
          <div className="col-4">
            <img
              src=" https://cdn.pixabay.com/photo/2025/08/15/06/29/mountain-cabin-9776289_640.jpg"
              alt="Zebra"
            />
          </div>
        </div>
      ) : (
        <AuthPage />
      )}
    </div>
  );
}
