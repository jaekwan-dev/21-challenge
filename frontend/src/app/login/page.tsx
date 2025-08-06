"use client";

import React from 'react';

const LoginPage = () => {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 로그인 시작 엔드포인트로 리다이렉트
    window.location.href = 'http://localhost:8080/auth/kakao';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <button
        onClick={handleKakaoLogin}
        className="bg-yellow-400 text-black px-4 py-2 rounded-md shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        카카오 로그인
      </button>
    </div>
  );
};

export default LoginPage;
