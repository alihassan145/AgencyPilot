import TopNavbar from "../components/TopNav";

export default function Layout({ children, onTabChange }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onTabChange={onTabChange} />
      <main className="p-6">{children}</main>
    </div>
  );
}
