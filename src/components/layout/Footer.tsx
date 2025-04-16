export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-500 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700">
              &copy; {new Date().getFullYear()} F1 Dashboard. All rights reserved.
            </p>
            <p className="text-gray-700">Version 0.1</p>
          </div>
          <div className="text-gray-700">
            <p>This project/website is unofficial and is not in any way associated with Formula 1.</p>
            <p>Formula 1, Formula One, F1, Grand Prix and related marks are trademarks of Formula One Licensing BV.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}