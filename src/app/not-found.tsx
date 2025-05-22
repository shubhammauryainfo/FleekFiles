// app/not-found.js
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-500  text-center">
      <div className="max-w-2xl p-6 ">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <p className="mt-4 text-xl text-gray-300">
          Oops! The page you are looking for does not exist.
        </p>
        <p className="mt-2 text-xl text-gray-400">
          It seems like you've hit a wrong link or the page might have been
          moved.
        </p>
        <Link
          href="/"
          className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 mt-2 font-medium rounded-lg text-sm px-10 py-4 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
        >
        Home Page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;