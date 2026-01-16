import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link href="/" className="text-lg font-bold text-gray-900">
              DevBlog
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              A minimal blog for developers
            </p>
          </div>
          
          <nav className="flex gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/categories" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Categories
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} DevBlog. Built with Next.js & Spring Boot.
          </p>
        </div>
      </div>
    </footer>
  );
}
