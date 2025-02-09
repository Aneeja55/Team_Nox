import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">
                    <Link href="/">meSSET</Link>
                </div>
                <div className="hidden md:flex space-x-4">
                    <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">Dashoard</Link>
                    <Link href="/admin/users" className="text-gray-300 hover:text-white">Users</Link>
                </div>
                <div className="md:hidden">
                    <button className="text-gray-300 hover:text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;