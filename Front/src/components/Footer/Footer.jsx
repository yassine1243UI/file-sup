import React from 'react';
import { Link } from 'react-router-dom';
import "./Footer.css"

export default function Footer() {
  return (
    <footer className="footer bg-blue-900 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="logo-emoji">📂</span>
          <span className="text-lg font-bold">Filesup</span>
        </div>

        <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
          <li>
            <Link to="/" className="hover:text-gray-300 transition">
              Login
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300 transition">
              S'inscrire
            </Link>
          </li>
        </ul>

        <div className="social-icons">
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.985h-2.54v-2.893h2.54V9.797c0-2.507 1.493-3.893 3.776-3.893 1.095 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.893h-2.33V21.878C18.343 21.128 22 16.991 22 12z" />
    </svg>
  </a>
  <a
    href="https://twitter.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M19.633 7.997c.013.186.013.373.013.559 0 5.694-4.334 12.26-12.26 12.26-2.433 0-4.692-.715-6.596-1.951.338.04.663.053 1.014.053a8.646 8.646 0 005.357-1.845 4.309 4.309 0 01-4.02-2.983c.27.04.528.067.798.067.389 0 .764-.053 1.12-.15a4.305 4.305 0 01-3.447-4.218v-.053c.574.319 1.235.511 1.936.533a4.301 4.301 0 01-1.91-3.584c0-.798.211-1.545.579-2.188a12.225 12.225 0 008.873 4.503c-.061-.318-.094-.65-.094-.983a4.306 4.306 0 017.447-2.94 8.581 8.581 0 002.733-1.045 4.27 4.27 0 01-1.892 2.384 8.607 8.607 0 002.486-.676 9.02 9.02 0 01-2.164 2.222z" />
    </svg>
  </a>
  <a
    href="https://linkedin.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20.447 20.452H17.5v-5.465c0-1.303-.025-2.977-1.813-2.977-1.812 0-2.089 1.418-2.089 2.883v5.559h-2.947V9.559h2.832v1.493h.04c.394-.747 1.358-1.533 2.794-1.533 2.985 0 3.536 1.965 3.536 4.522v6.411zM5.337 8.066a1.71 1.71 0 01-.565-.085 1.7 1.7 0 01-.956-.956 1.71 1.71 0 01-.085-.565c0-.187.03-.373.085-.565a1.7 1.7 0 01.956-.956 1.71 1.71 0 01.565-.085c.187 0 .373.03.565.085a1.7 1.7 0 01.956.956 1.71 1.71 0 01.085.565c0 .187-.03.373-.085.565a1.7 1.7 0 01-.956.956 1.71 1.71 0 01-.565.085zM6.816 20.452H3.757V9.559h3.059v10.893zM22.225 0H1.771C.792 0 0 .785 0 1.753v20.495C0 23.215.792 24 1.771 24h20.451c.98 0 1.774-.785 1.774-1.752V1.753C24 .785 23.205 0 22.225 0z" />
    </svg>
  </a>
</div>

      </div>

      <div className="copyright">
      © {new Date().getFullYear()} Filesup. Tous droits réservés.
      </div>
    </footer>
  );
}
