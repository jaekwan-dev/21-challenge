"use client";

import React from 'react';
import { useUser } from '../context/UserContext';
import Link from 'next/link';

const Header = () => {
  const { user, setUser } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // 로그아웃 후 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">21-Challenge</Link>
      </div>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            {user.profile_image && (
              <img
                src={user.profile_image}
                alt="프로필 이미지"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user.nickname}님</span>
            <Link href="/admin">
              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md">
                관리자
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">
              로그인
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
