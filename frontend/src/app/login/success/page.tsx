"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const LoginSuccessPage = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userParam = searchParams.get('user');
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data', error);
      }
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen py-2">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">로그인 성공!</h1>
      <p>환영합니다, {user.nickname}님!</p>
      {user.profile_image && (
        <img src={user.profile_image} alt="프로필 이미지" className="w-24 h-24 rounded-full mt-4" />
      )}
      <pre className="mt-4 p-4 bg-gray-100 rounded-md">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default LoginSuccessPage;