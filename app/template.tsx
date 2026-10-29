// template در هر ناوبری دوباره ساخته می‌شود، پس انیمیشن ورود صفحه هر بار اجرا می‌شود
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in flex flex-1 flex-col max-w-6xl w-full">{children}</div>
}
